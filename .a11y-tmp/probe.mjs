import { launch, ORIGIN } from './lib.mjs'
const b = await launch()
const p = await b.newPage({viewport:{width:1440,height:900}})
await p.goto(ORIGIN+'/en', {waitUntil:'networkidle'})
console.log(await p.evaluate(() => {
  const s = document.querySelector('.section')
  return { hasSection: !!s, pad: s && getComputedStyle(s).paddingLeft, sheets: document.styleSheets.length,
    body: getComputedStyle(document.body).backgroundColor, links: [...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href) }
}))
await b.close()
