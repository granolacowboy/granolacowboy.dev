// Regenerate the social-share card at public/og.png (1200x630, enforced by
// scripts/verify-build.mjs). Plain-academic: warm paper, near-black serif name,
// one restrained blue rule, muted descriptor, blue domain -- the same tokens as
// src/styles/tokens.css. Rendered deterministically with sharp (librsvg), no
// browser or build dependency.
//
// Font prerequisite (one-time, local): librsvg draws SVG text with fontconfig,
// so Source Serif 4 must be installed as a static face named "SourceSerifOG".
// Produce it from the repo's own variable woff2 and refresh the font cache:
//
//   python3 - <<'PY'
//   import os
//   from fontTools import ttLib
//   from fontTools.varLib.instancer import instantiateVariableFont
//   SRC = "node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2"
//   OUT = os.path.expanduser("~/.local/share/fonts")
//   os.makedirs(OUT, exist_ok=True)
//   for w, sub in [(400, "Regular"), (600, "SemiBold")]:
//       f = ttLib.TTFont(SRC)
//       instantiateVariableFont(f, {"wght": w}, inplace=True)
//       f["OS/2"].usWeightClass = w
//       n = f["name"]
//       for i in (1, 16): n.setName("SourceSerifOG", i, 3, 1, 0x409)
//       for i in (2, 17): n.setName(sub, i, 3, 1, 0x409)
//       f.flavor = None
//       f.save(os.path.join(OUT, f"SourceSerifOG-{sub}.ttf"))
//   PY
//   fc-cache -f ~/.local/share/fonts
//
// Then: node scripts/render-og.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const OUT_PNG = fileURLToPath(new URL('../public/og.png', import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fcfbf7"/>
  <text x="90" y="292" font-family="SourceSerifOG" font-weight="600" font-size="104" fill="#1b1a17">Richard Berman</text>
  <rect x="94" y="326" width="140" height="4" fill="#15529c"/>
  <text x="90" y="396" font-family="SourceSerifOG" font-weight="400" font-size="36" fill="#565550">Personal site and weblog</text>
  <text x="90" y="560" font-family="SourceSerifOG" font-weight="400" font-size="30" fill="#15529c">granolacowboy.dev</text>
</svg>`;

const info = await sharp(Buffer.from(svg)).resize(1200, 630, { fit: 'fill' }).png().toFile(OUT_PNG);
if (info.width !== 1200 || info.height !== 630) {
  console.error(`og.png must be 1200x630, got ${info.width}x${info.height}`);
  process.exit(1);
}
console.log(`wrote ${OUT_PNG} (${info.width}x${info.height})`);
