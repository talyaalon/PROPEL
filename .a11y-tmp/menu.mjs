import { launch, ORIGIN, settle, open } from './lib.mjs'
const browser = await launch()
for (const locale of ['he','en']) {
for (const W of [320, 375]) {
  const page = await browser.newPage({ viewport: { width: W, height: 700 } })
  await open(page, `${ORIGIN}/${locale}`)
  await settle(page)
  console.log(`\n########## ${locale} @${W}`)

  const trigger = page.locator('#a11y-panel').first()
  // open menu via keyboard
  await page.evaluate(() => { document.body.setAttribute('tabindex','-1'); document.body.focus(); document.body.removeAttribute('tabindex') })
  await page.keyboard.press('Tab'); await page.keyboard.press('Tab')
  let cur = await page.evaluate(() => document.activeElement.getAttribute('aria-label'))
  console.log('  focus after 2 tabs:', cur)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(250)
  console.log('  panel present:', await page.locator('#a11y-panel').count())
  console.log('  focus now:', await page.evaluate(() => { const e=document.activeElement; return e.tagName+' "'+(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,30)+'" role='+e.getAttribute('role') }))

  // walk panel tab stops
  const stops = []
  for (let i=0;i<14;i++){
    const s = await page.evaluate(() => { const e=document.activeElement; const r=e.getBoundingClientRect(); return {
      tag:e.tagName, name:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,26), role:e.getAttribute('role'),
      inPanel: !!e.closest('#a11y-panel'), rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)] } })
    stops.push(s)
    if (!s.inPanel) break
    await page.keyboard.press('Tab'); await page.waitForTimeout(60)
  }
  stops.forEach((s,i)=>console.log(`    ${i+1} ${s.tag} "${s.name}" role=${s.role} inPanel=${s.inPanel} rect=${s.rect}`))

  // Turn everything on via clicks
  await page.evaluate(() => {
    const p = document.getElementById('a11y-panel')
    const radios=[...p.querySelectorAll('[role=radio]')]
    radios[radios.length-1].click()   // 200%
    const sw=[...p.querySelectorAll('button[aria-pressed]')]
    sw.forEach(b=>{ if(b.getAttribute('aria-pressed')==='false') b.click() })
  })
  await page.waitForTimeout(600)
  const st = await page.evaluate(() => ({
    attrs: [...document.documentElement.attributes].map(a=>a.name+(a.value?'='+a.value:'')).join(' '),
    rootFont: document.documentElement.style.fontSize,
    pressed: [...document.querySelectorAll('#a11y-panel button[aria-pressed]')].map(b=>b.textContent.trim().slice(0,14)+':'+b.getAttribute('aria-pressed')),
    checked: [...document.querySelectorAll('#a11y-panel [role=radio]')].map(b=>b.textContent.trim()+':'+b.getAttribute('aria-checked')),
  }))
  console.log('  after all-on:', JSON.stringify(st, null, 1))

  // Is the whole panel still usable / reachable at this width?
  const panelBox = await page.evaluate(() => {
    const p = document.getElementById('a11y-panel'); if(!p) return null
    const r = p.getBoundingClientRect()
    const kids=[...p.querySelectorAll('button,a')].map(k=>{const b=k.getBoundingClientRect();return {n:(k.getAttribute('aria-label')||k.textContent||'').trim().slice(0,18),x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height),
      offX: b.left < r.left-1 || b.right > r.right+1, tiny: b.width<24||b.height<24 }})
    return { rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)], scrollH:p.scrollHeight, clientH:p.clientHeight,
      vw: innerWidth, docOverflow: document.documentElement.scrollWidth - innerWidth, kids }
  })
  console.log('  panel geometry:', JSON.stringify(panelBox))

  // page-level overflow with everything on
  await page.keyboard.press('Escape'); await page.waitForTimeout(200)
  const ov = await page.evaluate(() => {
    const de=document.documentElement
    const wide=[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect(); return r.right>innerWidth+1||r.left<-1})
      .slice(0,12).map(e=>e.tagName+'.'+String(e.className||'').slice(0,32)+' right='+Math.round(e.getBoundingClientRect().right))
    return { overflow: de.scrollWidth - innerWidth, active: document.activeElement.tagName+' '+(document.activeElement.getAttribute('aria-label')||'').slice(0,24), wide }
  })
  console.log('  ESC -> focus:', ov.active)
  console.log('  horizontal overflow with all prefs on:', ov.overflow, 'px')
  ov.wide.forEach(w=>console.log('     wide:', w))
  await page.close()
}
}
await browser.close()
