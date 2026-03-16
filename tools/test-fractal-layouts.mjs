import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function safeName(s) {
  return String(s).replace(/[^a-z0-9._-]+/gi, "_").replace(/^_+|_+$/g, "");
}

function parseArgs(argv) {
  const flags = {
    preset: null,
    presetOnly: false,
    allPresets: false,
    presetsOnly: false,
    withLayouts: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--preset" && next) {
      flags.preset = next;
      i++;
      continue;
    }
    if (a.startsWith("--preset=")) {
      flags.preset = a.slice("--preset=".length);
      continue;
    }
    if (a === "--preset-only") {
      flags.presetOnly = true;
      continue;
    }
    if (a === "--all-presets") {
      flags.allPresets = true;
      continue;
    }
    if (a === "--presets-only") {
      flags.presetsOnly = true;
      continue;
    }
    if (a === "--with-layouts") {
      flags.withLayouts = true;
      continue;
    }
    positional.push(a);
  }

  return { positional, flags };
}

async function openPresetsModal(page) {
  await page.click("#btn-presets", { timeout: 5000 });
  await page.waitForSelector("#presets-modal:not(.hidden)", { timeout: 5000 });
}

async function closePresetsModalIfOpen(page) {
  try {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(100);
  } catch {}
}

async function waitForTreeReady(page, timeoutMs) {
  await page.waitForFunction(
    () => {
      // eslint-disable-next-line no-undef
      return !!(window.app && window.app.treeData && Array.isArray(window.app.allNodes) && window.app.allNodes.length > 0);
    },
    { timeout: timeoutMs }
  );
}

async function getDrawCount(page) {
  return await page.evaluate(() => {
    // eslint-disable-next-line no-undef
    return typeof window.__drawCount === "number" ? window.__drawCount : 0;
  });
}

async function waitForDrawAdvance(page, prev, timeoutMs) {
  await page.waitForFunction(
    (p) => {
      // eslint-disable-next-line no-undef
      return (typeof window.__drawCount === "number" ? window.__drawCount : 0) > p;
    },
    prev,
    { timeout: timeoutMs }
  );
}

async function listAllPresets(page) {
  await openPresetsModal(page);
  await page.fill("#presets-search", "");
  await page.waitForTimeout(150);
  const names = await page.evaluate(() => {
    const grid = document.querySelector("#presets-grid");
    if (!grid) return [];
    const cards = [...grid.querySelectorAll(":scope > div")].filter((d) =>
      d.querySelector("button.btn-preset-load")
    );
    const out = [];
    for (const c of cards) {
      const t = c.querySelector("div.font-semibold");
      const name = (t ? t.textContent : "").trim();
      if (name) out.push(name);
    }
    return out;
  });
  await page.click("#btn-presets-close", { timeout: 5000 });
  await page.waitForFunction(() => {
    const el = document.getElementById("presets-modal");
    return !!el && el.classList.contains("hidden");
  }, { timeout: 5000 });
  return [...new Set(names)];
}

async function loadPresetByName(page, name) {
  const query = name.trim();
  if (!query) throw new Error("Preset name was empty.");

  await openPresetsModal(page);
  await page.fill("#presets-search", query);
  await page.waitForTimeout(200);

  const found = await page.evaluate((q) => {
    const grid = document.querySelector("#presets-grid");
    if (!grid) return null;
    const cards = [...grid.querySelectorAll(":scope > div")].filter((d) =>
      d.querySelector("button.btn-preset-load")
    );
    const needle = q.toLowerCase();
    let firstPartial = null;
    for (const card of cards) {
      const titleEl = card.querySelector("div.font-semibold");
      const title = ((titleEl ? titleEl.textContent : "") || "").trim();
      if (!title) continue;
      if (title.toLowerCase() === needle) {
        const loadBtn = card.querySelector("button.btn-preset-load");
        return { title, exact: true, hasLoad: !!loadBtn };
      }
      if (!firstPartial && title.toLowerCase().includes(needle)) {
        const loadBtn = card.querySelector("button.btn-preset-load");
        firstPartial = { title, exact: false, hasLoad: !!loadBtn };
      }
    }
    return firstPartial;
  }, query);

  if (!found || !found.hasLoad) {
    await page.click("#btn-presets-close", { timeout: 5000 });
    await page.waitForFunction(() => {
      const el = document.getElementById("presets-modal");
      return !!el && el.classList.contains("hidden");
    }, { timeout: 5000 });
    throw new Error(`Preset not found for query: "${query}"`);
  }

  await page.evaluate((title) => {
    const grid = document.querySelector("#presets-grid");
    if (!grid) return;
    const cards = [...grid.querySelectorAll(":scope > div")].filter((d) =>
      d.querySelector("button.btn-preset-load")
    );
    for (const card of cards) {
      const titleEl = card.querySelector("div.font-semibold");
      const t = ((titleEl ? titleEl.textContent : "") || "").trim();
      if (t !== title) continue;
      const loadBtn = card.querySelector("button.btn-preset-load");
      if (loadBtn) loadBtn.click();
      break;
    }
  }, found.title);

  await page.waitForFunction(() => {
    const el = document.getElementById("presets-modal");
    return !!el && el.classList.contains("hidden");
  }, { timeout: 10000 });
  return found.title;
}

async function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));

  const baseUrl =
    positional[0] ?? "http://127.0.0.1:3000/simulations/fractal-sim.html";
  const outDir =
    positional[1] ??
    path.join(
      "output",
      `fractal-layout-smoke-${new Date().toISOString().replace(/[:.]/g, "-")}`
    );

  // Params supported by fractal-sim.html (parsed from location.hash)
  const hashParams = new URLSearchParams({
    seed: "12",
    depth: "10",
    scale: "120",
  });

  ensureDir(outDir);

  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  const runErrors = [];
  const currentErrors = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") currentErrors.push({ type: "console.error", text: msg.text() });
  });
  page.on("pageerror", (err) => {
    currentErrors.push({ type: "pageerror", text: String(err) });
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(700);
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  await page.waitForTimeout(350);
  await page.waitForFunction(() => {
    // eslint-disable-next-line no-undef
    return typeof window.__drawCount === "number";
  }, { timeout: 10000 });

  const canvasHandle = (await page.$("#main-canvas")) || (await page.$("canvas"));
  if (!canvasHandle) throw new Error("No canvas found to screenshot.");
  const canvasBox = await canvasHandle.boundingBox();

  // Preset capture
  const didPresetWork = flags.allPresets || !!flags.preset;
  const presetsOnly =
    flags.presetsOnly || flags.presetOnly || (flags.allPresets && !flags.withLayouts);

  const presetSummary = [];
  if (flags.allPresets) {
    const names = await listAllPresets(page);
    for (const name of names) {
      currentErrors.length = 0;
      // eslint-disable-next-line no-console
      console.log(`Preset: ${name}`);
      await closePresetsModalIfOpen(page);

      let loadedTitle = name;
      try {
        const prev = await getDrawCount(page);
        loadedTitle = await loadPresetByName(page, name);
        await waitForDrawAdvance(page, prev, 60000);
        await page.waitForTimeout(400);
      } catch (e) {
        runErrors.push({
          preset: name,
          url: page.url(),
          error: String(e && e.message ? e.message : e),
        });
      }

      const shotPath = path.join(outDir, "presets", `${safeName(loadedTitle)}.png`);
      ensureDir(path.dirname(shotPath));
      if (canvasBox) {
        await page.screenshot({
          type: "png",
          omitBackground: false,
          clip: canvasBox,
          path: shotPath,
        });
      } else {
        await page.screenshot({ type: "png", omitBackground: false, path: shotPath });
      }

      const hasErrors = currentErrors.length > 0;
      const errorPath = hasErrors
        ? path.join(outDir, "presets", `${safeName(loadedTitle)}.errors.json`)
        : null;
      if (hasErrors && errorPath) {
        fs.writeFileSync(errorPath, JSON.stringify(currentErrors, null, 2));
        runErrors.push({
          preset: loadedTitle,
          url: page.url(),
          errorPath,
          errors: [...currentErrors],
        });
      }

      presetSummary.push({
        preset: loadedTitle,
        screenshot: shotPath,
        ok: !hasErrors,
        errors: hasErrors ? currentErrors.length : 0,
      });
    }
  } else if (flags.preset) {
    currentErrors.length = 0;
    // eslint-disable-next-line no-console
    console.log(`Preset: ${flags.preset}`);
    const prev = await getDrawCount(page);
    const loadedTitle = await loadPresetByName(page, flags.preset);
    await waitForDrawAdvance(page, prev, 60000);
    await page.waitForTimeout(400);

    const shotPath = path.join(outDir, "presets", `${safeName(loadedTitle)}.png`);
    ensureDir(path.dirname(shotPath));
    if (canvasBox) {
      await page.screenshot({
        type: "png",
        omitBackground: false,
        clip: canvasBox,
        path: shotPath,
      });
    } else {
      await page.screenshot({ type: "png", omitBackground: false, path: shotPath });
    }

    const hasErrors = currentErrors.length > 0;
    const errorPath = hasErrors
      ? path.join(outDir, "presets", `${safeName(loadedTitle)}.errors.json`)
      : null;
    if (hasErrors && errorPath) {
      fs.writeFileSync(errorPath, JSON.stringify(currentErrors, null, 2));
      runErrors.push({ preset: loadedTitle, url: page.url(), errorPath, errors: [...currentErrors] });
    }
    presetSummary.push({
      preset: loadedTitle,
      screenshot: shotPath,
      ok: !hasErrors,
      errors: hasErrors ? currentErrors.length : 0,
    });
  }

  // Discover layouts from the page itself so it stays in sync with the UI.
  if (presetsOnly) {
    fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(presetSummary, null, 2));
    fs.writeFileSync(path.join(outDir, "failures.json"), JSON.stringify(runErrors, null, 2));
    await browser.close();
    // eslint-disable-next-line no-console
    console.log(`Presets: ${presetSummary.length} | Errors: ${runErrors.length}`);
    // eslint-disable-next-line no-console
    console.log(`Artifacts: ${outDir}`);
    if (runErrors.length) process.exitCode = 2;
    return;
  }

  // If we did any preset work, reset to a stable baseline before iterating layouts.
  if (didPresetWork) {
    const url = `${baseUrl}#${hashParams.toString()}`;
    const prev = await getDrawCount(page);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await waitForDrawAdvance(page, prev, 30000);
    await page.waitForTimeout(250);
  }

  const layouts = await page.evaluate(() => {
    const sel = document.querySelector("#layout-select");
    if (!sel) return [];
    return [...sel.querySelectorAll("option")]
      .map((o) => o.value)
      .filter((v) => typeof v === "string" && v.length > 0);
  });

  if (!layouts.length) throw new Error("No layouts found (expected #layout-select options).");

  const bbox = canvasBox;

  const summary = [];

  // If we didn't load a preset, apply the hash params once to get a stable baseline.
  if (!didPresetWork) {
    const url = `${baseUrl}#${hashParams.toString()}`;
    const prev = await getDrawCount(page);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(700);
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await waitForDrawAdvance(page, prev, 30000);
    await page.waitForTimeout(250);
  }

  for (const layout of layouts) {
    currentErrors.length = 0;
    // eslint-disable-next-line no-console
    console.log(`Layout: ${layout}`);

    // Switch layout via UI so distribution presets & camera reset logic runs.
    const prev = await getDrawCount(page);
    await page.selectOption("#layout-select", layout);
    await page.dispatchEvent("#layout-select", "input");
    await page.waitForFunction(
      (expected) => {
        const sel = document.getElementById("layout-select");
        return !!sel && sel.value === expected;
      },
      layout,
      { timeout: 5000 }
    );
    await waitForDrawAdvance(page, prev, 30000);
    await page.waitForTimeout(250);

    const url = page.url();
    const shotPath = path.join(outDir, `${safeName(layout)}.png`);
    if (bbox) {
      await page.screenshot({
        type: "png",
        omitBackground: false,
        clip: bbox,
        path: shotPath,
      });
    } else {
      await page.screenshot({ type: "png", omitBackground: false, path: shotPath });
    }

    const hasErrors = currentErrors.length > 0;
    const errorPath = hasErrors
      ? path.join(outDir, `${safeName(layout)}.errors.json`)
      : null;
    if (hasErrors && errorPath) {
      fs.writeFileSync(errorPath, JSON.stringify(currentErrors, null, 2));
      runErrors.push({ layout, url, errorPath, errors: [...currentErrors] });
    }

    summary.push({
      layout,
      url,
      screenshot: shotPath,
      ok: !hasErrors,
      errors: hasErrors ? currentErrors.length : 0,
    });
  }

  fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(outDir, "failures.json"), JSON.stringify(runErrors, null, 2));

  await browser.close();

  const okCount = summary.filter((s) => s.ok).length;
  const failCount = summary.length - okCount;
  // eslint-disable-next-line no-console
  console.log(`Layouts: ${summary.length} | OK: ${okCount} | Errors: ${failCount}`);
  // eslint-disable-next-line no-console
  console.log(`Artifacts: ${outDir}`);
  if (failCount) process.exitCode = 2;
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
