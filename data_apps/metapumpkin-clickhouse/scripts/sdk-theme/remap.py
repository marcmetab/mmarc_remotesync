# The hand-written part of sdk-theme.css: colours Metabase resolves in JavaScript from the SDK theme it loaded
# with (chart text, axis line, dot fill, series), remapped to the other theme's.
pairs = [  # light, dark
    ("#3a2230", "#f7ebe4"), ("#5a4550", "#dfcdc8"), ("#6f5a64", "#b9a5a8"),   # ink, ink-soft, muted
    ("#e2d8d1", "#54424a"),                                                     # border (axis line)
    ("#fdfbf9", "#22161a"),                                                     # surface (hollow dots)
]
series = [("#e2681c", "#f0823a"), ("#4a2638", "#dcb3c6"), ("#5f6d2c", "#b0bf68"), ("#e3a047", "#e9ad5c"),
          ("#a8667a", "#cf8aa0"), ("#c9683c", "#de8a5f"), ("#8f9a4e", "#8e9a52")]
out = []
for t, o in (("dark", "light"), ("light", "dark")):
    sel = f'.pd-app[data-theme="{t}"] .pd-mb[data-sdk-theme="{o}"]'
    frm = 0 if o == "light" else 1
    out.append(f"/* {t.capitalize()} app, {o} SDK. */")
    for pair in pairs + series:
        a, b = pair[frm], pair[1 - frm]
        out.append(f'{sel} svg [fill="{a}" i] {{ fill: {b}; }}')
        out.append(f'{sel} svg [stroke="{a}" i] {{ stroke: {b}; }}')
    for pair in series:
        a, b = pair[frm], pair[1 - frm]
        out.append(f'{sel} [color="{a}" i], {sel} .marker-{a[1:].upper()} {{ background-color: {b}; }}')
    for pair in series:
        a, b = pair[frm], pair[1 - frm]
        out.append(f'{sel} svg:has(path[stroke="{a}" i]:not([opacity])) :is(path[stroke^="rgb("]) {{ stroke: {b}; }}')
        out.append(f'{sel} svg:has(path[stroke="{a}" i]:not([opacity])) :is(path[fill^="rgb("]) {{ fill: {b}; }}')
    out.append("")
print("\n".join(out))
