import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findHtmlInputs(rootDir: string) {
  const skip = new Set(["node_modules", "dist", "src", ".git", ".venv", "venv"]);
  const out: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (skip.has(entry.name)) continue;
        walk(path.join(dir, entry.name));
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".html")) {
        out.push(path.join(dir, entry.name));
      }
    }
  };

  walk(rootDir);
  return out;
}

function copyDirIfExists(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function speedtestResultsPlugin(): Plugin {
  const OUT_DIR = path.join(__dirname, "output", "speedtest-results");

  const handler: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url || "";

    if (req.method === "OPTIONS" && url.startsWith("/speedtest-results")) {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "content-type");
      res.end();
      return;
    }

    if (req.method !== "POST" || !url.startsWith("/speedtest-results")) {
      next();
      return;
    }

    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const payload = JSON.parse(raw);

        fs.mkdirSync(OUT_DIR, { recursive: true });
        const ts = new Date().toISOString().replaceAll(":", "-");
        const file = path.join(OUT_DIR, `speedtest-${ts}.json`);
        fs.writeFileSync(file, JSON.stringify(payload, null, 2), "utf8");

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify({ ok: true, saved: path.relative(__dirname, file) }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
      }
    });
  };

  return {
    name: "speedtest-results",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      // @ts-expect-error Vite preview server exposes Connect middlewares.
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: false,
  },
  preview: {
    host: "127.0.0.1",
    port: 4174,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      // Ensures sub-pages like /simulations/*.html exist in dist, so navigating from index doesn't fall back to index.html.
      input: findHtmlInputs(__dirname),
    },
  },
  plugins: [
    react(),
    speedtestResultsPlugin(),
    {
      name: "copy-static-dirs",
      apply: "build",
      closeBundle() {
        const outDir = path.join(__dirname, "dist");
        copyDirIfExists(path.join(__dirname, "css"), path.join(outDir, "css"));
        copyDirIfExists(path.join(__dirname, "js"), path.join(outDir, "js"));
      },
    },
  ],
});
