const ORIGIN='http://localhost:4455'
const paths=['','/portfolio','/portfolio/jcafe-kosher','/portfolio/hagorer2','/portfolio/cnafim-lauf','/portfolio/bom-recipes','/portfolio/air-manage','/services/migration','/blog','/accessibility','/privacy']
const routes=[]; for(const l of ['he','en']) for(const p of paths) routes.push(`/${l}${p}`)
const decode=s=>s.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;/g,"'").replace(/&#39;/g,"'")
for(const r of routes){
  const html=await (await fetch(ORIGIN+r)).text()
  const head=html.slice(0,html.indexOf('</body>'))
  const blocks=[...head.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1])
  const types=[]
  for(const b of blocks){
    let j
    try{ j=JSON.parse(decode(b)) }catch(e){ types.push('PARSE_ERROR: '+e.message); continue }
    const walk=(o,path='')=>{ const bad=[]
      if(Array.isArray(o)){o.forEach((v,i)=>bad.push(...walk(v,path+'['+i+']')));return bad}
      if(o&&typeof o==='object'){for(const[k,v]of Object.entries(o)){bad.push(...walk(v,path+'.'+k))}return bad}
      if(typeof o==='string'&&(o==='undefined'||o==='null'||o===''||o.includes('undefined'))) bad.push(path+'='+JSON.stringify(o))
      return bad }
    const bad=walk(j)
    types.push(j['@type']+(bad.length?'  BAD:'+bad.join(','):''))
  }
  console.log(r.padEnd(32), blocks.length, '|', types.join(' ; '))
}
