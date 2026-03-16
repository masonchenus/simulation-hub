import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

function listPngs(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith(".png"))
    .map((n) => path.join(dir, n))
    .sort((a, b) => a.localeCompare(b));
}

function readPng(filePath) {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

function writePng(png, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, PNG.sync.write(png));
}

function resizeNearest(src, targetW, targetH) {
  const dst = new PNG({ width: targetW, height: targetH });
  for (let y = 0; y < targetH; y++) {
    const sy = Math.floor((y / targetH) * src.height);
    for (let x = 0; x < targetW; x++) {
      const sx = Math.floor((x / targetW) * src.width);
      const sidx = (src.width * sy + sx) << 2;
      const didx = (targetW * y + x) << 2;
      dst.data[didx] = src.data[sidx];
      dst.data[didx + 1] = src.data[sidx + 1];
      dst.data[didx + 2] = src.data[sidx + 2];
      dst.data[didx + 3] = src.data[sidx + 3];
    }
  }
  return dst;
}

function blit(dst, src, ox, oy) {
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const didx = (dst.width * (oy + y) + (ox + x)) << 2;
      const sidx = (src.width * y + x) << 2;
      dst.data[didx] = src.data[sidx];
      dst.data[didx + 1] = src.data[sidx + 1];
      dst.data[didx + 2] = src.data[sidx + 2];
      dst.data[didx + 3] = src.data[sidx + 3];
    }
  }
}

const FONT_5X7 = {
  "A": ["01110","10001","10001","11111","10001","10001","10001"],
  "B": ["11110","10001","10001","11110","10001","10001","11110"],
  "C": ["01110","10001","10000","10000","10000","10001","01110"],
  "D": ["11110","10001","10001","10001","10001","10001","11110"],
  "E": ["11111","10000","10000","11110","10000","10000","11111"],
  "F": ["11111","10000","10000","11110","10000","10000","10000"],
  "G": ["01110","10001","10000","10111","10001","10001","01110"],
  "H": ["10001","10001","10001","11111","10001","10001","10001"],
  "I": ["01110","00100","00100","00100","00100","00100","01110"],
  "J": ["00111","00010","00010","00010","10010","10010","01100"],
  "K": ["10001","10010","10100","11000","10100","10010","10001"],
  "L": ["10000","10000","10000","10000","10000","10000","11111"],
  "M": ["10001","11011","10101","10101","10001","10001","10001"],
  "N": ["10001","11001","10101","10011","10001","10001","10001"],
  "O": ["01110","10001","10001","10001","10001","10001","01110"],
  "P": ["11110","10001","10001","11110","10000","10000","10000"],
  "Q": ["01110","10001","10001","10001","10101","10010","01101"],
  "R": ["11110","10001","10001","11110","10100","10010","10001"],
  "S": ["01111","10000","10000","01110","00001","00001","11110"],
  "T": ["11111","00100","00100","00100","00100","00100","00100"],
  "U": ["10001","10001","10001","10001","10001","10001","01110"],
  "V": ["10001","10001","10001","10001","10001","01010","00100"],
  "W": ["10001","10001","10001","10101","10101","10101","01010"],
  "X": ["10001","10001","01010","00100","01010","10001","10001"],
  "Y": ["10001","10001","01010","00100","00100","00100","00100"],
  "Z": ["11111","00001","00010","00100","01000","10000","11111"],
  "0": ["01110","10001","10011","10101","11001","10001","01110"],
  "1": ["00100","01100","00100","00100","00100","00100","01110"],
  "2": ["01110","10001","00001","00010","00100","01000","11111"],
  "3": ["11110","00001","00001","01110","00001","00001","11110"],
  "4": ["00010","00110","01010","10010","11111","00010","00010"],
  "5": ["11111","10000","10000","11110","00001","00001","11110"],
  "6": ["01110","10000","10000","11110","10001","10001","01110"],
  "7": ["11111","00001","00010","00100","01000","01000","01000"],
  "8": ["01110","10001","10001","01110","10001","10001","01110"],
  "9": ["01110","10001","10001","01111","00001","00001","01110"],
  "-": ["00000","00000","00000","11111","00000","00000","00000"],
  "_": ["00000","00000","00000","00000","00000","00000","11111"],
  ".": ["00000","00000","00000","00000","00000","00100","00100"],
  "/": ["00001","00010","00100","01000","10000","00000","00000"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"]
};

function blendPixel(dst, idx, r, g, b, a) {
  const da = dst.data[idx + 3] / 255;
  const sa = a / 255;
  const outA = sa + da * (1 - sa);
  if (outA <= 0) return;
  dst.data[idx] = Math.round((r * sa + dst.data[idx] * da * (1 - sa)) / outA);
  dst.data[idx + 1] = Math.round((g * sa + dst.data[idx + 1] * da * (1 - sa)) / outA);
  dst.data[idx + 2] = Math.round((b * sa + dst.data[idx + 2] * da * (1 - sa)) / outA);
  dst.data[idx + 3] = Math.round(outA * 255);
}

function drawRectAlpha(dst, x, y, w, h, r, g, b, a) {
  const x0 = Math.max(0, x);
  const y0 = Math.max(0, y);
  const x1 = Math.min(dst.width, x + w);
  const y1 = Math.min(dst.height, y + h);
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) {
      const idx = (dst.width * yy + xx) << 2;
      blendPixel(dst, idx, r, g, b, a);
    }
  }
}

function drawChar(dst, ch, x, y, scale, r, g, b, a) {
  const glyph = FONT_5X7[ch] || FONT_5X7[" "];
  for (let row = 0; row < glyph.length; row++) {
    const line = glyph[row];
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== "1") continue;
      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const px = x + col * scale + sx;
          const py = y + row * scale + sy;
          if (px < 0 || py < 0 || px >= dst.width || py >= dst.height) continue;
          const idx = (dst.width * py + px) << 2;
          blendPixel(dst, idx, r, g, b, a);
        }
      }
    }
  }
}

function drawText(dst, text, x, y, scale) {
  const chars = text.split("");
  const spacing = scale;
  const charW = 5 * scale;
  chars.forEach((ch, i) => {
    const ox = x + i * (charW + spacing);
    drawChar(dst, ch, ox + 1, y + 1, scale, 0, 0, 0, 200);
    drawChar(dst, ch, ox, y, scale, 235, 242, 255, 255);
  });
}

function labelForPath(p) {
  const base = path.basename(p, path.extname(p));
  return base.replace(/_/g, " ").toUpperCase();
}

function truncateText(text, maxChars) {
  if (text.length <= maxChars) return text;
  if (maxChars <= 1) return text.slice(0, 1);
  return text.slice(0, maxChars - 1) + ".";
}

function makeSheet(paths, outPath, cols, rows, thumbW, thumbH) {
  const sheet = new PNG({ width: cols * thumbW, height: rows * thumbH });
  // Fill with dark background
  for (let i = 0; i < sheet.data.length; i += 4) {
    sheet.data[i] = 10;
    sheet.data[i + 1] = 16;
    sheet.data[i + 2] = 32;
    sheet.data[i + 3] = 255;
  }
  paths.forEach((p, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    if (row >= rows) return;
    const src = readPng(p);
    const thumb = resizeNearest(src, thumbW, thumbH);
    blit(sheet, thumb, col * thumbW, row * thumbH);
    const label = labelForPath(p);
    const scale = 2;
    const charW = 5 * scale;
    const spacing = scale;
    const pad = 6;
    const maxChars = Math.max(1, Math.floor((thumbW - pad * 2) / (charW + spacing)));
    const text = truncateText(label, maxChars);
    const textW = text.length * charW + Math.max(0, text.length - 1) * spacing;
    const textH = 7 * scale;
    const labelH = textH + pad * 2;
    const baseX = col * thumbW;
    const baseY = row * thumbH;
    drawRectAlpha(sheet, baseX, baseY + thumbH - labelH, thumbW, labelH, 8, 12, 22, 190);
    const textX = baseX + Math.floor((thumbW - textW) / 2);
    const textY = baseY + thumbH - labelH + pad;
    drawText(sheet, text, textX, textY, scale);
  });
  writePng(sheet, outPath);
}

function main() {
  const layoutDir = process.argv[2] ?? "output/fractal-layout-smoke-run5";
  const presetDir = process.argv[3] ?? "output/fractal-presets-smoke-run3/presets";
  const outDir = process.argv[4] ?? "output/fractal-smoke-gallery";

  const layouts = listPngs(layoutDir);
  const presets = listPngs(presetDir);

  // Layouts: 96 -> 12x8
  makeSheet(
    layouts,
    path.join(outDir, "contact-layouts.png"),
    12,
    8,
    240,
    135
  );

  // Presets: 16 -> 4x4
  makeSheet(
    presets,
    path.join(outDir, "contact-presets.png"),
    4,
    4,
    320,
    180
  );

  // eslint-disable-next-line no-console
  console.log(`Layouts: ${layouts.length} Presets: ${presets.length} -> ${outDir}`);
}

main();
