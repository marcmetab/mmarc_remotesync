(() => {
  const out = [];
  const walk = (rules, media) => { for (const r of rules) {
    if (r.cssRules && !r.selectorText) { walk(r.cssRules, (r.conditionText || r.media?.mediaText || "") ); continue; }
    const sel = r.selectorText; if (!sel || !(/:root|mb-wrapper|:host/.test(sel))) continue;
    const decls = {}; let any = false;
    for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (p.startsWith("--")) { decls[p] = r.style.getPropertyValue(p).trim(); any = true; } }
    if (any) out.push({ sel, media, owner: r.parentStyleSheet?.ownerNode?.getAttribute?.("data-emotion") ?? r.parentStyleSheet?.ownerNode?.nodeName, decls });
  } };
  for (const sh of document.styleSheets) { try { walk(sh.cssRules, ""); } catch (e) {} }
  return { scheme: document.querySelector(".mb-wrapper")?.getAttribute("data-mantine-color-scheme"), rules: out };
})()
