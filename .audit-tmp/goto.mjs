export async function load(page, url) {
  for (let i = 0; i < 4; i++) {
    await page.goto(url, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle')
    const ok = await page.evaluate(() => {
      const s = document.querySelector('.section')
      return !!s && parseFloat(getComputedStyle(s).paddingLeft) > 0
    })
    if (ok) return
    await page.waitForTimeout(800)
  }
  throw new Error('page never styled: ' + url)
}
