#!/usr/bin/env python3
"""Bake driver headshots into the bundle as WebP data URIs.

Why this exists
---------------
The app renders inside Metabase's embed iframe, whose CSP is

    img-src 'self' data: https://*.tile.openstreetmap.org blob:

so remote headshots from ``media.formula1.com`` are refused in production.
They load in ``npm run dev`` only because the dev server sets no ``img-src``
directive at all, which is why this is invisible until the app is synced.
``allowed_hosts`` cannot help: it feeds ``connect-src``/``form-action``/
``frame-src``, and the embed ``img-src`` is identical across every app on the
instance.

``data:`` *is* allowed, so inlining works — that is also why the F1 logo
(imported with ``?inline``) has always rendered in production.

Format
------
WebP, not PNG, and not a sprite sheet. Measured over the 26 images:

    26 individual PNGs (source)   163 kB
    sprite sheet, PNG             295 kB   <- 81% WORSE
    26 individual WebP q82         74 kB
    sprite sheet, WebP q82         69 kB

The sprite is counterproductive for PNG because 20 of the sources are
palette images, each with its own optimised 256-colour table; merging them
forces truecolour and throws 26 separate optimisations away. In WebP the
sprite saves ~5 kB over individual files, which does not pay for mapping
every driver to pixel coordinates and keeping that in step with the lineup.

Quality: alpha survives intact, and mean error over opaque pixels is
5.95/255 at q82. The sources are 93x93 and the driver page displays at
128px, so they are already upscaled; encoding above q90 buys nothing.

Usage
-----
    python3 scripts/build-headshots.py

Requires Pillow (``pip install Pillow``). Reads DATA_APP_MB_URL and
DATA_APP_MB_API_KEY from the environment, or from the repo-root .env.local.
Re-run when the driver lineup changes, then commit the generated module.
"""

from __future__ import annotations

import base64
import io
import json
import os
import pathlib
import sys
import urllib.request

QUALITY = 82
OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets" / "headshots.generated.ts"


def credentials() -> tuple[str, str]:
    """Read the Metabase URL and key, without ever echoing them."""
    url = os.environ.get("DATA_APP_MB_URL")
    key = os.environ.get("DATA_APP_MB_API_KEY")
    if url and key:
        return url, key

    root = pathlib.Path(__file__).resolve().parents[3] / ".env.local"
    if root.is_file():
        for line in root.read_text().splitlines():
            line = line.strip()
            if line.startswith("DATA_APP_MB_URL=") and not url:
                url = line.split("=", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("DATA_APP_MB_API_KEY=") and not key:
                key = line.split("=", 1)[1].strip().strip('"').strip("'")

    if not url or not key or key == "mb_replace_me":
        sys.exit("Set DATA_APP_MB_URL and DATA_APP_MB_API_KEY (env or repo-root .env.local).")
    return url, key


def fetch_headshot_urls(base: str, key: str) -> list[str]:
    """Every distinct headshot the loaded sessions reference."""
    query = {
        "database": 67,
        "type": "native",
        "native": {
            "query": (
                "SELECT DISTINCT headshot_url FROM f1.results "
                "WHERE headshot_url IS NOT NULL AND headshot_url != '' "
                "ORDER BY headshot_url"
            )
        },
    }
    request = urllib.request.Request(
        f"{base}/api/dataset",
        data=json.dumps(query).encode(),
        headers={"x-api-key": key, "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        payload = json.load(response)
    if payload.get("error"):
        sys.exit(f"Metabase rejected the query: {payload['error']}")
    return [row[0] for row in payload["data"]["rows"] if row and row[0]]


def main() -> None:
    try:
        from PIL import Image
    except ImportError:
        sys.exit("Pillow is required: pip install Pillow")

    base, key = credentials()
    urls = fetch_headshot_urls(base, key)
    print(f"{len(urls)} distinct headshots")

    entries: dict[str, str] = {}
    skipped: list[str] = []
    source_bytes = 0

    for url in urls:
        try:
            with urllib.request.urlopen(url, timeout=30) as response:
                raw = response.read()
        except Exception as exc:  # noqa: BLE001 - report and continue
            skipped.append(f"{url} ({exc})")
            continue

        source_bytes += len(raw)
        try:
            image = Image.open(io.BytesIO(raw)).convert("RGBA")
        except Exception as exc:  # noqa: BLE001
            skipped.append(f"{url} (decode: {exc})")
            continue

        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=QUALITY, method=6)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
        entries[url] = f"data:image/webp;base64,{encoded}"

    if not entries:
        sys.exit("No headshots could be fetched; leaving the existing module alone.")

    inlined = sum(len(v) for v in entries.values())
    print(f"source PNG {source_bytes / 1024:.1f} kB -> inlined WebP {inlined / 1024:.1f} kB")
    for line in skipped:
        print(f"  skipped: {line}")

    body = ",\n".join(f'  {json.dumps(k)}: {json.dumps(v)}' for k, v in sorted(entries.items()))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "// Generated by scripts/build-headshots.py — do not edit by hand.\n"
        "//\n"
        "// Driver headshots, inlined as WebP data URIs. Metabase's embed CSP allows\n"
        "// `data:` but not the remote image host, so these only render in production\n"
        "// when they are baked into the bundle. Re-run the script when the lineup\n"
        "// changes. Keyed by source URL, which is what the results row carries.\n"
        "export const HEADSHOTS: Readonly<Record<string, string>> = {\n"
        f"{body},\n"
        "};\n"
    )
    print(f"wrote {OUT.relative_to(OUT.parents[2])} ({len(entries)} entries)")


if __name__ == "__main__":
    main()
