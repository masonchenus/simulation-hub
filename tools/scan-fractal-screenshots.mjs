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

function rgbDist1(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

function getPixel(png, x, y) {
  const idx = (png.width * y + x) << 2;
  return [
    png.data[idx],
    png.data[idx + 1],
    png.data[idx + 2],
    png.data[idx + 3],
  ];
}

function scanOne(filePath) {
  const png = readPng(filePath);
  const w = png.width;
  const h = png.height;

  const samplePts = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
    [Math.floor(w / 2), 0],
    [Math.floor(w / 2), h - 1],
  ];

  const samples = samplePts.map(([x, y]) => getPixel(png, x, y));
  const bg = [
    Math.round(samples.reduce((a, s) => a + s[0], 0) / samples.length),
    Math.round(samples.reduce((a, s) => a + s[1], 0) / samples.length),
    Math.round(samples.reduce((a, s) => a + s[2], 0) / samples.length),
  ];

  // Downsample by ~400x400 probes max.
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / (400 * 400))));
  const thr = 18;

  let minx = Infinity;
  let miny = Infinity;
  let maxx = -Infinity;
  let maxy = -Infinity;
  let non = 0;
  let total = 0;

  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const [r, g, b, a] = getPixel(png, x, y);
      if (a < 10) continue;
      total++;
      if (rgbDist1([r, g, b], bg) > thr) {
        non++;
        if (x < minx) minx = x;
        if (y < miny) miny = y;
        if (x > maxx) maxx = x;
        if (y > maxy) maxy = y;
      }
    }
  }

  const nonBgFrac = total ? non / total : 0;
  const bbox =
    non === 0
      ? null
      : {
          minx,
          miny,
          maxx,
          maxy,
        };

  const bboxAreaFrac =
    bbox === null ? 0 : ((bbox.maxx - bbox.minx + 1) * (bbox.maxy - bbox.miny + 1)) / (w * h);

  const touchEdge =
    bbox === null
      ? false
      : bbox.minx <= 3 || bbox.miny <= 3 || bbox.maxx >= w - 4 || bbox.maxy >= h - 4;

  return {
    path: filePath,
    w,
    h,
    bg,
    sample_step: step,
    non_bg_frac: nonBgFrac,
    bbox,
    bbox_area_frac: bboxAreaFrac,
    touch_edge: touchEdge,
  };
}

function scanDir(dir) {
  return listPngs(dir).map(scanOne);
}

function main() {
  const layoutDir = process.argv[2] ?? "output/fractal-layout-smoke-run4";
  const presetDir = process.argv[3] ?? "output/fractal-presets-smoke-run2/presets";
  const outPath = process.argv[4] ?? "output/fractal-smoke-gallery/scan.json";

  const report = {
    layouts: scanDir(layoutDir),
    presets: scanDir(presetDir),
    flags: [],
  };

  function flag(section, kind, it) {
    report.flags.push({
      section,
      kind,
      path: it.path,
      non_bg_frac: it.non_bg_frac,
      bbox_area_frac: it.bbox_area_frac,
    });
  }

  for (const [section, arr] of [
    ["layouts", report.layouts],
    ["presets", report.presets],
  ]) {
    for (const it of arr) {
      if (it.non_bg_frac < 0.002) flag(section, "too_blank", it);
      if (it.bbox_area_frac < 0.003) flag(section, "tiny_bbox", it);
      if (it.touch_edge) flag(section, "touch_edge", it);
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  // eslint-disable-next-line no-console
  console.log(
    `Scanned layouts=${report.layouts.length} presets=${report.presets.length} flags=${report.flags.length}`
  );
  for (const f of report.flags.slice(0, 25)) {
    // eslint-disable-next-line no-console
    console.log(
      `${f.section} ${f.kind} ${path.basename(f.path)} non_bg=${f.non_bg_frac.toFixed(4)} bbox=${f.bbox_area_frac.toFixed(4)}`
    );
  }
}

main();

