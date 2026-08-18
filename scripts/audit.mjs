/**
 * The measurement harness the review agents share.
 *
 *   npm run audit -- gaps          dead space between sections, page length
 *   npm run audit -- contrast      every text role, both themes, computed
 *   npm run audit -- tab           the real tab order, with visibility
 *   npm run audit -- headings      outline per page, flagging skipped levels
 *   npm run audit -- css <class>   did this Tailwind utility actually compile?
 *   npm run audit -- all
 *
 * Options:  --origin http://localhost:4455   --locale he|en   --theme light|dark
 *
 * Every reviewer was writing this from scratch, slightly differently, which is
 * how three of them arrived at three different numbers for the same gap. One
 * implementation means the numbers are comparable across runs and across
 * agents, and the traps below are fixed once.
 *
 * Requires a production build to be serving - `npm run build && npm run start`.
 * Dev serves unminified CSS and no static optimisation, so its numbers are not
 * the numbers visitors get.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'

const BROWSERS = [
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}

const ORIGIN = arg('origin', 'http://localhost:4455')
const LOCALE = arg('locale', 'he')
const THEME = arg('theme', null)
const command = process.argv[2] ?? 'all'

const VIEWPORTS = [
  { name: '375 ', width: 375, height: 812 },
  { name: '768 ', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
]

function findBrowser() {
  const found = BROWSERS.find((p) => p && existsSync(p))
  if (!found)
    throw new Error('No Chromium found. Install Chrome, or npx playwright install chromium')
  return found
}

/**
 * Settles a page for measurement, and refuses to measure an unstyled one.
 *
 * `.reveal` starts at `opacity: 0` and `translateY(22px)`, server-rendered, so
 * a page measured as loaded is a page whose content is transparent and 22px out
 * of position. Forcing the class on is not cosmetic - without it every gap
 * below the fold is wrong by 22px and every contrast sample reads 0 alpha.
 *
 * The stylesheet check is the more important half. A server left holding the
 * port after a rebuild serves HTML whose asset hashes no longer resolve; the
 * page renders with no CSS at all and every number comes out *better*. Gaps
 * collapse, the page shortens by a third, contrast reads 21:1 in both themes,
 * and text-scaling reports a perfect x2.00 because everything is already at the
 * browser default. It has cost three runs. It throws now.
 */
async function settle(page) {
  const styled = await page.evaluate(() => {
    /*
     * `.section` sets horizontal padding at every breakpoint, so unstyled it is
     * 0. The legal pages have no `.section` element at all, and gating on it
     * alone aborted the whole run two pages in - so the body's background,
     * which the stylesheet always sets, is the fallback.
     */
    const section = document.querySelector('.section')
    const padded = section
      ? parseFloat(getComputedStyle(section).paddingLeft) > 0
      : getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'
    const sheets = [...document.styleSheets].filter((s) => {
      try {
        return s.cssRules.length > 0
      } catch {
        return true
      }
    }).length
    return { padded, sheets }
  })

  if (!styled.padded) {
    throw new Error(
      `The page rendered without CSS (${styled.sheets} stylesheet(s), .section has no padding).\n` +
        'A stale server is almost certainly holding the port and serving asset hashes\n' +
        'from a previous build. Kill it and re-run `npm run start` before measuring:\n' +
        '  Get-NetTCPConnection -LocalPort 4455 -State Listen | %{ Stop-Process -Id $_.OwningProcess -Force }',
    )
  }

  await page.evaluate(() => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'))
  })
  await page.waitForTimeout(400)
}

// ── Gaps ─────────────────────────────────────────────────────────────────────

async function gaps(browser) {
  console.log('\n=== dead space between sections ===')

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
    await page.goto(`${ORIGIN}/${LOCALE}`, { waitUntil: 'networkidle' })
    await settle(page)

    const result = await page.evaluate(() => {
      /*
       * The painted edge, not the layout edge.
       *
       * Two traps, both of which produced wrong numbers before they were
       * understood. Descendants of an `overflow: hidden` ancestor still report
       * their full rect even though the browser never paints past the clip -
       * the closed FAQ answers extend ~130px below their container and made
       * one boundary measure as a large negative. And anything `position:
       * fixed` reports viewport coordinates, unrelated to where it sits in the
       * flow, which produced negatives in the thousands.
       */
      const painted = (el, edge) => {
        /*
         * Chrome hides the content of a closed <details> through the UA shadow
         * tree, so it has no `overflow: hidden` ancestor to detect and still
         * reports a live 82-132px rect. The FAQ container used to carry
         * `overflow-hidden`, which caught it; that was removed to stop the
         * focus ring being clipped, and this boundary started reporting a
         * phantom negative gap again.
         */
        const inClosedDetails = (node) => {
          for (let n = node.parentElement; n; n = n.parentElement) {
            if (n.tagName === 'DETAILS' && !n.open) return true
          }
          return false
        }

        const clip = (node) => {
          let box = node.getBoundingClientRect()
          for (let n = node.parentElement; n; n = n.parentElement) {
            const s = getComputedStyle(n)
            if (s.overflow === 'visible' && s.overflowY === 'visible') continue
            const r = n.getBoundingClientRect()
            box = {
              top: Math.max(box.top, r.top),
              bottom: Math.min(box.bottom, r.bottom),
            }
          }
          return box
        }

        const values = []
        for (const node of el.querySelectorAll('*')) {
          const s = getComputedStyle(node)
          if (s.position === 'fixed' || s.display === 'none' || s.visibility === 'hidden') continue
          if (inClosedDetails(node)) continue
          const box = clip(node)
          if (box.bottom <= box.top) continue // fully clipped, paints nothing
          values.push(edge === 'bottom' ? box.bottom : box.top)
        }
        if (!values.length) return null
        return edge === 'bottom' ? Math.max(...values) : Math.min(...values)
      }

      const sections = [...document.querySelectorAll('section')]
      const out = []
      for (let i = 1; i < sections.length; i++) {
        const last = painted(sections[i - 1], 'bottom')
        const first = painted(sections[i], 'top')
        if (last === null || first === null) continue
        out.push({
          id: sections[i].id || sections[i].getAttribute('aria-label') || `#${i}`,
          gap: Math.round(first - last),
        })
      }
      return { out, height: document.documentElement.scrollHeight }
    })

    const total = result.out.reduce((a, g) => a + Math.max(0, g.gap), 0)
    console.log(
      `\n${vp.name}  ${result.height}px = ${(result.height / vp.height).toFixed(1)} screens   total ${total}px`,
    )
    for (const g of result.out)
      console.log(`        ${String(g.gap).padStart(5)}px  before ${g.id}`)
    await page.close()
  }
}

// ── Contrast ─────────────────────────────────────────────────────────────────

const channel = (c) => {
  c /= 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p)
  return (hi + 0.05) / (lo + 0.05)
}

async function contrast(browser) {
  console.log('\n=== contrast, computed ===')

  for (const theme of THEME ? [THEME] : ['light', 'dark']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(`${ORIGIN}/${LOCALE}`, { waitUntil: 'networkidle' })
    await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme)
    await settle(page)

    const samples = await page.evaluate(() => {
      const parse = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)

      /*
       * Walks for the first ancestor with a non-transparent background. A
       * sample taken against `rgba(0,0,0,0)` silently compares text to black
       * and reports a passing ratio for text that is invisible.
       */
      const backdrop = (el) => {
        for (let n = el; n; n = n.parentElement) {
          const c = getComputedStyle(n).backgroundColor
          if (c && !c.includes('rgba(0, 0, 0, 0)') && c !== 'transparent') return parse(c)
        }
        return [255, 255, 255]
      }

      const pick = (selector, label, pseudo) => {
        const el = document.querySelector(selector)
        if (!el) return null
        const style = getComputedStyle(el, pseudo)
        const size = parseFloat(style.fontSize)
        const weight = Number(style.fontWeight) || 400
        return {
          label,
          fg: parse(style.color),
          bg: backdrop(el),
          size,
          // 1.4.3's large-text exemption: 18.66px bold, or 24px at any weight.
          large: size >= 24 || (size >= 18.66 && weight >= 700),
        }
      }

      return [
        pick('h1', 'h1'),
        pick('h2', 'h2'),
        pick('h3', 'h3'),
        pick('header nav a[href*="#"]', 'nav link'),
        pick('.body-text, #about p', 'body'),
        pick('.tag', 'tag'),
        pick('.num', 'metric'),
        pick('.eyebrow', 'eyebrow'),
        pick('#contact input', 'input text'),
        pick('#contact textarea', 'placeholder', '::placeholder'),
        pick('#contact label', 'label'),
        pick('footer a', 'footer link'),
        pick('.section--band h2', 'h2 on band'),
        pick('.section--band p', 'body on band'),
      ].filter(Boolean)
    })

    console.log(`\n${theme}:`)
    for (const s of samples) {
      const r = ratio(s.fg, s.bg)
      const need = s.large ? 3 : 4.5
      const verdict = r >= need ? 'pass' : 'FAIL'
      console.log(
        `  ${s.label.padEnd(13)} ${r.toFixed(2).padStart(6)}:1  needs ${need}  ${verdict}${s.large ? '  (large)' : ''}`,
      )
    }
    await page.close()
  }
}

// ── Tab order ────────────────────────────────────────────────────────────────

async function tab(browser) {
  console.log('\n=== tab order ===')
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } })
  await page.goto(`${ORIGIN}/${LOCALE}`, { waitUntil: 'networkidle' })
  await settle(page)
  await page.evaluate(() => document.body.focus())

  const stops = []
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab')
    // Longer than the 680ms reveal transition, so a stop that scrolls content
    // into view is not sampled mid-fade and reported as invisible.
    await page.waitForTimeout(90)
    const stop = await page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return null
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return {
        tag: el.tagName,
        name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 42),
        opacity: style.opacity,
        inert: el.closest('[inert]') !== null,
        offscreen: rect.width === 0 || rect.height === 0,
      }
    })
    if (!stop) break
    stops.push(stop)
  }

  stops.forEach((s, i) => {
    const flags = [
      s.opacity === '0' ? 'INVISIBLE (opacity 0)' : '',
      s.inert ? 'inside [inert]' : '',
      s.offscreen ? 'zero-size' : '',
    ]
      .filter(Boolean)
      .join(' · ')
    console.log(`  ${String(i + 1).padStart(3)}  ${s.tag.padEnd(7)} ${s.name.padEnd(44)} ${flags}`)
  })
  console.log(`  ${stops.length} stops`)
  await page.close()
}

// ── Headings ─────────────────────────────────────────────────────────────────

async function headings(browser) {
  console.log('\n=== heading outline ===')
  /*
   * Every route, not a sample. The h1 -> h3 skip on /portfolio lived for weeks
   * because this list stopped at four routes - an audit that skips pages
   * reports "clean" in exactly the places nobody looked. The project slugs are
   * read from the build manifest so a new case study is audited by existing.
   */
  const slugs = existsSync('.next/prerender-manifest.json')
    ? Object.keys(JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8')).routes)
        .filter((r) => r.startsWith(`/${LOCALE}/portfolio/`))
        .map((r) => r.replace(`/${LOCALE}`, ''))
    : []
  const routes = [
    `/${LOCALE}`,
    `/${LOCALE}/portfolio`,
    ...slugs.map((s) => `/${LOCALE}${s}`),
    `/${LOCALE}/services/migration`,
    `/${LOCALE}/blog`,
    `/${LOCALE}/privacy`,
    `/${LOCALE}/accessibility`,
    `/${LOCALE}/404`,
  ]

  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(ORIGIN + route, { waitUntil: 'networkidle' })
    await settle(page)

    const found = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
        level: Number(h.tagName[1]),
        text: (h.textContent ?? '').trim().slice(0, 48),
      })),
    )

    const problems = []
    let previous = 0
    for (const h of found) {
      if (previous && h.level > previous + 1)
        problems.push(`h${previous} -> h${h.level} at "${h.text}"`)
      previous = h.level
    }
    const h1s = found.filter((h) => h.level === 1).length
    if (h1s !== 1) problems.push(`${h1s} h1 elements`)

    console.log(`\n${route}  ${found.length} headings`)
    if (problems.length) problems.forEach((p) => console.log(`  SKIP  ${p}`))
    else console.log('  clean')
    await page.close()
  }
}

// ── Did that class compile? ──────────────────────────────────────────────────

/**
 * Tailwind drops a utility it cannot generate, silently.
 *
 * The colour tokens here are bare `var(--x)` with no `<alpha-value>`
 * placeholder, so every opacity modifier on them - `border-brand-accent/40`,
 * `placeholder:text-brand-slate/60` - compiles to nothing at all. The element
 * then falls through to preflight's hardcoded grey, which looks deliberate and
 * does not flip with the theme. This has shipped twice.
 *
 * There is no build error and no console warning. Grepping the built CSS is the
 * only way to know.
 */
function css(needle) {
  if (!needle) {
    console.log('usage: npm run audit -- css border-brand-accent/40')
    return
  }
  const dir = '.next/static/css'
  if (!existsSync(dir)) {
    console.log('No built CSS found. Run `npm run build` first.')
    return
  }
  /*
   * Two escaping passes, and missing the first one made this check worthless.
   *
   * Tailwind writes a literal backslash before every character that is not
   * valid in a bare CSS identifier, so the class `text-[0.875rem]` is emitted
   * as the selector `.text-\[0\.875rem\]`. The old version escaped the needle
   * for the *regex* only, and then searched for a literal `[` in a file that
   * contains `\[`. Nothing matched.
   *
   * The result was a check that answered "DID NOT COMPILE" for every arbitrary
   * value and every variant prefix in the project - `text-[0.875rem]`,
   * `opacity-[0.028]`, `leading-[1.06]`, `max-h-[70vh]`, `hover:text-brand-accent`
   * are all present in the built CSS and all reported as missing. Only plain
   * classes like `text-brand-ink` ever answered correctly.
   *
   * That is worse than having no check. It invites someone to "fix" working
   * code, and it buries the real hits - `bg-brand-accent/10` genuinely does
   * compile to nothing - in a wall of false ones.
   *
   *   1. CSS-escape, the way Tailwind does when it writes the selector.
   *   2. Regex-escape the result, backslashes included.
   */
  /*
   * Each special character can appear in the built file in TWO spellings.
   * Tailwind writes the readable escape (`\,`), and cssnano then rewrites some
   * of those to the hex form with a space terminator (`\2c `) - which is how
   * `text-[length:min(6rem,20vw)]` sat in the stylesheet, verified working,
   * and was still reported DID NOT COMPILE. A checker that has already
   * produced two different false-negative classes gets the general fix, not a
   * third special case: every escaped character matches either spelling.
   */
  const forRegex = [...needle]
    .map((ch) => {
      if (/[a-zA-Z0-9_-]/.test(ch)) return ch
      const hex = ch.codePointAt(0).toString(16)
      const literal = ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return `\\\\(?:${hex} ?|${literal})`
    })
    .join('')

  // `(?![\w-])` stops `text-brand-ink` matching `.text-brand-inky`. A variant
  // class is followed by its pseudo (`.hover\:x:hover`), which the guard allows.
  const pattern = new RegExp(`\\.${forRegex}(?![\\w-])[^{]*\\{[^}]*\\}`, 'g')

  let hits = 0
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.css'))) {
    const body = readFileSync(join(dir, file), 'utf8')
    const matches = body.match(pattern)
    if (matches) {
      hits += matches.length
      matches.slice(0, 3).forEach((m) => console.log(`  ${file}: ${m.slice(0, 110)}`))
    }
  }

  if (hits) {
    console.log(`\n  "${needle}" compiled - ${hits} rule(s)`)
    return
  }

  console.log(`\n  "${needle}" DID NOT COMPILE - it is doing nothing`)
  if (/\/\d/.test(needle)) {
    console.log(
      `  Likely cause: the brand colour tokens are bare \`var(--x)\` with no\n` +
        `  \`<alpha-value>\` channel, so every opacity modifier on them compiles to\n` +
        `  nothing. A translucent value needs its own token.`,
    )
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────

if (command === 'css') {
  css(process.argv[3])
} else {
  const browser = await chromium.launch({ executablePath: findBrowser() })
  try {
    if (command === 'gaps' || command === 'all') await gaps(browser)
    if (command === 'contrast' || command === 'all') await contrast(browser)
    if (command === 'tab' || command === 'all') await tab(browser)
    if (command === 'headings' || command === 'all') await headings(browser)
  } finally {
    await browser.close()
  }
}
