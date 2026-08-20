# Performance — what was measured, and what is deliberately left alone

Measured on the live site (`https://propel.co.il/he`) after the positioning
merge, with Lighthouse 12 run locally against production.

| | Perf | A11y | Best practices | SEO |
|---|---|---|---|---|
| Mobile (4G, 4× CPU) | 93 | 100 | 100 | 100 |
| Desktop | 95 | 100 | 100 | 100 |

Core Web Vitals, mobile: **FCP 1.3s · LCP 2.5s · CLS 0 · TBT 140ms.**
Desktop: FCP 0.5s · LCP 0.7s · CLS 0 · TBT 0ms.

**These numbers are not comparable to a PageSpeed Insights score.** PSI runs on
Google's hardware with its own CPU calibration; this ran on a developer laptop.
Compare local runs to local runs. The keyless PSI API quota was exhausted the
day this was taken — re-run it there before quoting a number to anyone.

CLS is 0 on both, which is the one that survives the environment difference.

---

## Fixed as a result

**Forced reflow in the nav.** The ResizeObserver that publishes `--nav-h` read
`offsetHeight` inside its own callback, forcing a synchronous layout the
observer had already performed — on every resize and every step of the
accessibility menu's text control. It now reads `entry.borderBoxSize`.

**Cache lifetimes.** `public/` assets gained `stale-while-revalidate=604800`
alongside the existing day, and the image optimiser's TTL is pinned in
`next.config.ts` instead of inherited from the platform.

---

## Not fixed, on purpose

**Legacy JavaScript — "11 KiB of unnecessary polyfills."** Lighthouse points at
`chunks/255-*.js`, and the polyfills are real: `Array.prototype.at`, `flat`,
`flatMap`, `Object.fromEntries`. They are **Next.js's own `polyfill-module`**,
fused into the app-router runtime chunk — the surrounding bytes are Next
internals like `addSearchParamsIfPageSegment`. `browserslist` does not control
it; removing it means aliasing an internal Next package to an empty module.

The 11 KiB is uncompressed. That chunk ships at 46 KB gzipped and 38 KB brotli,
so the polyfills' real share is one to two kilobytes over the wire. Fighting the
framework's own runtime for that is a bad trade, and it silently breaks older
browsers in a way nothing here would catch.

**Render-blocking CSS — one 9.2 KB stylesheet.** Inlining critical CSS means
`experimental.optimizeCss`, which is experimental, pulls in a separate critical-
CSS engine, and has a history of dropping rules. 9 KB is one round trip on a
stylesheet that is already small; CLS is 0 precisely because the stylesheet
arrives before paint. Not worth trading a stable render for a round trip.

**Image delivery — "5 KiB" on the logo.** Lighthouse is asking for a higher
compression factor on a 256px-wide logo already at q=75. A logo is exactly
where compression artefacts are visible, and it sits in the header of every
page. The `sizes` and DPR selection are already correct.

---

## Re-running it

```bash
export CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
npx lighthouse@12 https://propel.co.il/he --output=json \
  --output-path=lh.json --quiet --chrome-flags="--headless=new --no-sandbox"
# --preset=desktop for the desktop pass
```

The three items above will be flagged every time. That is expected — they are
decisions, not an outstanding to-do list.
