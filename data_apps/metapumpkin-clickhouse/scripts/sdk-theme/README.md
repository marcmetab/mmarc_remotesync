# Regenerating src/pages/explore/sdk-theme.css

The Metabase question (Explore tab and sheet) gets its theme once, at load, from the system setting.
`sdk-theme.css` repaints it when the in-app switch picks the other theme. Regenerate it after an SDK
upgrade or a palette change:

1. With the app open in the dev server, once with a light and once with a dark system setting, run
   `dumpvars.js` in the page (DevTools console) and save the two results as `live/vars-light.json`
   and `live/vars-dark.json` in a working folder.
2. `python3 gen.py <working folder> ../../src/pages/explore/sdk-theme.css` writes the variable part.
3. `remap.py` holds the hand-written part: colours Metabase resolves in JavaScript (chart text, axis
   line, series), mapped light ↔ dark. Keep its pairs in step with `lightPalette` / `darkPalette` in
   `src/theme.ts`.
