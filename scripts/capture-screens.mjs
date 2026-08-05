/**
 * Captures the full-page screenshots that drive the scrolling project previews.
 *
 *   npm run shots            capture every project that has a liveUrl
 *   npm run shots hagorer2   capture one
 *
 * Two shots per project, at the widths the CSS expects:
 *
 *   desktop.webp   1566 wide
 *   mobile.webp     370 wide
 *
 * Height is whatever the page turns out to be — the taller the capture, the more
 * natural the scroll inside the frame looks. Output is capped at 6000px so a
 * pathologically long page cannot produce a multi-megabyte background.
 *
 * Uses playwright-core against a browser already on the machine, so nothing is
 * downloaded. Re-run it whenever a client site is redesigned.
 */

import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from 'playwright-core'
import sharp from 'sharp'

const BROWSERS = [
  join(process.env.LOCALAPPDATA ?? '', 'ms-playwright/chromium-1223/chrome-win64/chrome.exe'),
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
]

/*
 * Only publicly browsable sites belong here. Air Manage and BOM & Recipes sit
 * behind a login, so a capture of either is just a sign-in box — which says
 * nothing about the work and would make the card look broken rather than
 * impressive. Those two keep the empty frame instead.
 *
 * J-Cafe's root is a store picker, barely a screen tall. The Bangkok storefront
 * is the page worth showing scrolling.
 */
const TARGETS = [
  { slug: 'hagorer2', url: 'https://hagorer2.co.il' },
  { slug: 'cnafim-lauf', url: 'https://cnafim-lauf.co.il' },
  { slug: 'jcafe-kosher', url: 'https://www.jcafekosher.com/en/s/bangkok' },
]

const VIEWS = [
  { name: 'desktop', width: 1566, height: 900 },
  { name: 'mobile', width: 370, height: 800 },
]

const MAX_HEIGHT = 6000

function findBrowser() {
  const found = BROWSERS.find((p) => p && existsSync(p))
  if (!found) throw new Error('No Chromium or Chrome found. Install one, or run: npx playwright install chromium')
  return found
}

async function capture(page, target, view) {
  await page.setViewportSize({ width: view.width, height: view.height })
  await page.goto(target.url, { waitUntil: 'networkidle', timeout: 60_000 })

  // Scroll the whole page once so lazy-loaded images and reveal animations have
  // fired — otherwise the capture is full of empty placeholders.
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0
      const step = () => {
        window.scrollBy(0, window.innerHeight)
        y += window.innerHeight
        if (y < document.body.scrollHeight && y < 20000) setTimeout(step, 120)
        else {
          window.scrollTo(0, 0)
          setTimeout(resolve, 600)
        }
      }
      step()
    })
  })

  // Cookie bars and chat bubbles are fixed, so they would otherwise be burned
  // into the capture at every scroll position.
  await page.addStyleTag({
    content: `*{animation:none!important;transition:none!important}
              [class*="cookie" i],[id*="cookie" i],[class*="whatsapp" i],
              [class*="chat" i],[id*="chat" i]{display:none!important}`,
  })

  const buffer = await page.screenshot({ fullPage: true, type: 'png' })

  const dir = join('public', 'projects', target.slug)
  mkdirSync(dir, { recursive: true })
  const out = join(dir, `${view.name}.webp`)

  const meta = await sharp(buffer).metadata()
  let image = sharp(buffer)
  if ((meta.height ?? 0) > MAX_HEIGHT) image = image.extract({ left: 0, top: 0, width: meta.width, height: MAX_HEIGHT })

  await image.webp({ quality: 72 }).toFile(out)
  const final = await sharp(out).metadata()
  return `${view.name.padEnd(7)} ${final.width}x${final.height}  ${Math.round((final.size ?? 0) / 1024)}KB`
}

const only = process.argv[2]
const targets = only ? TARGETS.filter((t) => t.slug === only) : TARGETS

const browser = await chromium.launch({ executablePath: findBrowser() })
const context = await browser.newContext({ deviceScaleFactor: 1, ignoreHTTPSErrors: true })
const page = await context.newPage()

for (const target of targets) {
  console.log(`\n${target.slug}  ${target.url}`)
  for (const view of VIEWS) {
    try {
      console.log('  ' + (await capture(page, target, view)))
    } catch (error) {
      console.log(`  ${view.name.padEnd(7)} FAILED  ${String(error).split('\n')[0].slice(0, 110)}`)
    }
  }
}

await browser.close()
