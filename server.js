/**
 * Production server for the Praxos web app.
 *
 * This replaced a plain static file server (`serve -s dist`) for one reason: the
 * backend must not be publicly reachable. A static build cannot arrange that —
 * the bundle runs in the browser, so whatever host it calls has to be reachable
 * from the open internet.
 *
 * So the browser now only ever talks to THIS origin, and requests to /api are
 * forwarded over Railway's private network:
 *
 *     browser ──https──> Praxos (this) ──private──> praxos-backend.railway.internal
 *
 * Two consequences worth knowing:
 *   • CORS disappears — the API is same-origin as far as the browser is concerned.
 *   • The backend needs no public domain at all.
 *
 * Railway's private network is IPv6-only, which is why the upstream is addressed
 * by its .railway.internal name and why the backend binds :: rather than 0.0.0.0.
 */
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, "dist");

const PORT = process.env.PORT || 8080;
// The private address of the backend service. Set on Railway; the default is the
// service's internal DNS name so a misconfigured deploy fails loudly rather than
// silently reaching for a public URL.
const API_UPSTREAM = process.env.API_UPSTREAM || "http://praxos-backend.railway.internal:8000";

const app = express();
app.disable("x-powered-by");

// Liveness for the platform healthcheck. Answered by this service alone, so a
// backend outage shows up as failing API calls rather than the web app being
// marked unhealthy and restarted.
app.get("/healthz", (_req, res) => res.json({ status: "ok", upstream: API_UPSTREAM }));

// Mounted WITHOUT a path prefix, selecting requests with pathFilter instead.
// app.use("/api", proxy) would strip the "/api" mount point before the proxy
// sees the request, forwarding /health instead of /api/health — the backend
// answers 404 and every call looks broken.
app.use(
  createProxyMiddleware({
    pathFilter: "/api/**",
    target: API_UPSTREAM,
    changeOrigin: true,
    xfwd: true,
    // Uploads stream through; don't buffer them in this hop.
    proxyTimeout: 120_000,
    timeout: 120_000,
    on: {
      error: (err, _req, res) => {
        // Never leak the upstream address or a stack trace to the browser.
        console.error("[proxy] upstream error:", err.code || err.message);
        if (res && "writeHead" in res && !res.headersSent) {
          res.writeHead(502, { "Content-Type": "application/json" });
        }
        if (res && "end" in res) res.end(JSON.stringify({ detail: "Backend unavailable" }));
      },
    },
  }),
);

// Hashed assets are immutable; index.html must never be cached or users get a
// stale shell pointing at assets that no longer exist after a deploy.
app.use(
  express.static(DIST, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache");
      else if (filePath.includes("/assets/")) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    },
  }),
);

// SPA fallback — client-side routing owns everything that isn't a real file.
// Written as a terminal middleware rather than app.get("*"): Express 5's router
// (path-to-regexp v8) rejects a bare "*" path and the server refuses to boot.
app.use((_req, res) => res.sendFile(path.join(DIST, "index.html")));

// Listen on :: so the platform can reach this service over either stack.
app.listen(PORT, "::", () => {
  console.log(`praxos web on :${PORT}, proxying /api -> ${API_UPSTREAM}`);
});
