# Generates src/pages/explore/sdk-theme.css from two dumps of the SDK's CSS variables (dumpvars.js), one
# taken with the light preset loaded and one with the dark preset.
import json, re, sys
S = sys.argv[1]; OUT = sys.argv[2]
L = json.load(open(f"{S}/live/vars-light.json")); D = json.load(open(f"{S}/live/vars-dark.json"))
def get(d, sel, owner=None, minlen=5):
    rs = [r for r in d["rules"] if r["sel"] == sel and len(r["decls"]) >= minlen and (owner is None or r["owner"] == owner)]
    return rs[0]["decls"]
root = {"light": get(L, ":root", "css-global"), "dark": get(D, ":root", "css-global")}
wrap = {"light": get(L, ".mb-wrapper"), "dark": get(D, ".mb-wrapper")}
scheme = {"light": get(L, '.mb-wrapper[data-mantine-color-scheme="light"]'), "dark": get(D, '.mb-wrapper[data-mantine-color-scheme="dark"]')}
mbkeys = [k[len("--mb-color-"):] for k in root["light"] if k.startswith("--mb-color-")]

# 1. Metabase's colour variables (declared on :root): every one that differs between the presets, plus every
#    one built from another (var(...)), which must be declared again to be rebuilt from the overridden ones.
mb = [k for k in root["light"] if k.startswith("--mb-color-") and (root["light"][k] != root["dark"][k] or "var(" in root["light"][k])]
# 2. Mantine's colour shades: each Metabase colour is a palette of ten equal shades of its value, written out
#    as literals per .mb-wrapper. The ones Mantine's scheme variables read (0, 1, 4) read the Metabase
#    variable instead, for every colour whose shades equal it in both presets.
pal = lambda t, K: wrap[t].get(f"--mantine-color-{K}-0")
shaded = [K for K in mbkeys if pal("light", K) == root["light"]["--mb-color-" + K] and pal("dark", K) == root["dark"]["--mb-color-" + K]
          and ("--mb-color-" + K) in mb]
# 3. Mantine's own scheme variables (body, text, borders, placeholders...) and its shadows.
core = ["--mantine-color-scheme", "--mantine-color-bright", "--mantine-color-text", "--mantine-color-body", "--mantine-color-error",
        "--mantine-color-placeholder", "--mantine-color-anchor", "--mantine-color-default", "--mantine-color-default-hover",
        "--mantine-color-default-color", "--mantine-color-default-border", "--mantine-color-dimmed", "--mantine-color-disabled",
        "--mantine-color-disabled-color", "--mantine-color-disabled-border"]
shadows = [k for k in wrap["light"] if k.startswith("--mantine-shadow-") and wrap["light"][k] != wrap["dark"][k]]

def block(t):
    o = "light" if t == "dark" else "dark"
    sel = f'.pd-app[data-theme="{t}"] .pd-mb[data-sdk-theme="{o}"]'
    lines = [f"{sel} {{"] + [f"  {k}: {root[t][k]};" for k in mb] + ["}"]
    lines += [f"{sel} .mb-wrapper {{"] + [f"  {k}: {scheme[t][k]};" for k in core] + [f"  {k}: {wrap[t][k]};" for k in shadows] + ["}"]
    return "\n".join(lines)

shade_lines = [f"  --mantine-color-{K}-0: var(--mb-color-{K}); --mantine-color-{K}-1: var(--mb-color-{K}); --mantine-color-{K}-4: var(--mb-color-{K});" for K in shaded]
both = ':is(.pd-app[data-theme="dark"] .pd-mb[data-sdk-theme="light"], .pd-app[data-theme="light"] .pd-mb[data-sdk-theme="dark"]) .mb-wrapper'
gen = "\n\n".join([
    "/* ── Generated: the SDK's variables in the app's theme (see the header) ── */",
    "/* Dark app, light SDK: the dark preset's values. */\n" + block("dark"),
    "/* Light app, dark SDK: the light preset's values. */\n" + block("light"),
    "/* Either way: Mantine's shades read the Metabase variables above. */\n" + both + " {\n" + "\n".join(shade_lines) + "\n}",
]) + "\n"
head = open(OUT).read().split("/* ── Generated:")[0] if __import__("os").path.exists(OUT) else ""
open(OUT, "w").write(head + gen)
print(len(mb), len(shaded), len(shadows), "lines", (head + gen).count("\n"))
