const decode=s=>s.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#x27;/g,"'")
for(const r of ['/he','/he/portfolio/jcafe-kosher']){
  const html=await (await fetch('http://localhost:4455'+r)).text()
  const blocks=[...html.slice(0,html.indexOf('</body>')).matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1])
  console.log('=====',r)
  for(const b of blocks){ const j=JSON.parse(decode(b)); if(j['@type']==='FAQPage'){console.log('FAQPage questions:', j.mainEntity.length); j.mainEntity.forEach(q=>console.log('   Q:',q.name)); } else console.log(JSON.stringify(j,null,1)) }
}
