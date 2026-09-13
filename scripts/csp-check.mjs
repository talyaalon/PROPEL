/**
 * Load production pages in a real browser and fail on any CSP violation.
 *
 * The enforcing CSP shipped on the strength of a static analysis: every origin
 * the served HTML and CSS reference was enumerated and all of them turned out
 * to be link targets or XML namespaces rather than subresources. That argument
 * is sound and it is still an argument. A CSP breaks things at runtime, in the
 * browser, after hydration, so it has to be checked there.
 *
 * Run this after ANY change to the policy in next.config.ts, and after adding
 * anything that loads a resource: an embed, a font, an image host, an
 * analytics tag. A blocked subresource does not fail the build, does not show
 * up in the served HTML, and does not appear in any of the other audits here.
 * It shows up as a page that quietly stops working for a visitor.
 *
 * Uses playwright-core, already a dependency, driving the Chrome the operating
 * system ships. Nothing is downloaded.
 *
 *   node scripts/csp-check.mjs [origin]
 */
import { chromium } from 'playwright-core'

const SITE = process.argv[2] ?? 'https://propel.co.il'
const PAGES = [
  '/he',
  '/en',
  '/he/services',
  '/he/contact',
  '/he/portfolio',
  '/he/portfolio/jcafe-kosher',
  '/he/not-a-fit',
  '/he/privacy',
  '/he/blog',
  '/he/blog/branch-leakage-case-study',
]

// Chrome ships with the OS here; playwright-core drives it without downloading one.
const CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]
const { existsSync } = await import('node:fs')
const executablePath = CANDIDATES.find((p) => existsSync(p))
if (!executablePath) {
  console.error('No Chrome or Edge found. Checked:\n  ' + CANDIDATES.join('\n  '))
  process.exit(2)
}
console.log(`browser: ${executablePath}\n`)

const browser = await chromium.launch({ executablePath, headless: true })
let violations = 0
let pageErrors = 0

for (const path of PAGES) {
  const page = await browser.newPage()
  const found = []

  // The browser reports a blocked resource as a securitypolicyviolation event.
  await page.addInitScript(() => {
    window.__cspHits = []
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspHits.push({
        directive: e.violatedDirective,
        blocked: e.blockedURI,
        line: e.lineNumber,
      })
    })
  })

  page.on('console', (msg) => {
    const t = msg.text()
    if (/Content Security Policy|Refused to/i.test(t)) found.push('console: ' + t.slice(0, 160))
  })
  page.on('pageerror', (err) => {
    pageErrors++
    found.push('pageerror: ' + String(err).slice(0, 160))
  })

  await page.goto(SITE + path, { waitUntil: 'networkidle', timeout: 45000 })
  // Give hydration a moment to run and trip anything it is going to trip.
  await page.waitForTimeout(1200)

  const hits = await page.evaluate(() => window.__cspHits ?? [])
  for (const h of hits) found.push(`blocked ${h.directive} -> ${h.blocked}`)

  // Prove the page actually rendered rather than failing silently.
  const rendered = await page.evaluate(() => ({
    sheets: [...document.styleSheets].reduce((n, s) => {
      try {
        return n + s.cssRules.length
      } catch {
        return n
      }
    }, 0),
    hasNav: !!document.querySelector('nav'),
    hasFooter: !!document.querySelector('footer'),
    bodyText: document.body.innerText.trim().length,
  }))

  const ok = found.length === 0 && rendered.sheets > 100 && rendered.hasFooter
  violations += found.length
  console.log(
    `${ok ? 'ok  ' : 'FAIL'}  ${path.padEnd(34)} cssRules=${String(rendered.sheets).padStart(4)} text=${String(rendered.bodyText).padStart(5)} nav=${rendered.hasNav} footer=${rendered.hasFooter}`,
  )
  for (const f of found) console.log('        ' + f)

  await page.close()
}

await browser.close()
console.log(
  `\n${violations === 0 && pageErrors === 0 ? 'PASS' : 'FAIL'}: ${violations} CSP violation(s), ${pageErrors} page error(s) across ${PAGES.length} pages\n`,
)
process.exit(violations === 0 && pageErrors === 0 ? 0 : 1)
