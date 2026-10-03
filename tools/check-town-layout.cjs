/* Road clearance uses actual rendered footprints and the complete sampled road network. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/shark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {townFixture}=require('./check-town.cjs'),{ready}=require('./check-cms-ui.cjs');
const OUT=path.resolve(__dirname,'../.openfoam-work/town');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[];try{
 for(const groups of [0,3,8]){
  const f=await townFixture(browser,{fullStreet:true,groups}),p=f.page;
  await ready(p,'/town/#hubei','.town-game-world');
  const audit=await p.evaluate(()=>{
   const w=document.querySelector('.town-game-world'),roads=w._townRoads;
   const distance=(p,r)=>Math.hypot(p.x-Math.max(r.x,Math.min(r.x+r.w,p.x)),p.y-Math.max(r.y,Math.min(r.y+r.h,p.y)))-p.r;
   const buildings=[...w.querySelectorAll('[data-building]:not([hidden])')].map(e=>{const x=parseFloat(e.style.left),y=parseFloat(e.style.top);return {name:e.getAttribute('aria-label'),x,y,clearance:Math.min(...roads.map(p=>distance(p,{x:x+10,y:y+12,w:180,h:184}))),door:Math.min(...roads.map(p=>Math.hypot(p.x-Number(e.dataset.doorX),p.y-Number(e.dataset.doorY))))};});
   const lamps=[...w.querySelectorAll('.town-game-prop.lamp')].map(e=>Math.min(...roads.map(p=>distance(p,{x:parseFloat(e.style.left)+2,y:parseFloat(e.style.top),w:30,h:94}))));
   return {buildings,lamps,benches:w.querySelectorAll('.town-game-prop.bench').length,lights:document.querySelectorAll('.town-lamp-flame').length};
  });
  assert.equal(audit.buildings.length,17+groups);assert.equal(audit.benches,0);assert(audit.lamps.length>=5);assert.equal(audit.lights,audit.lamps.length);
  for(const b of audit.buildings){assert(b.clearance>=0,`${b.name} overlaps a road by ${-b.clearance}px`);assert(b.door<32,`${b.name} has no connected approach`);}
  assert(audit.lamps.every(d=>d>=0),'Lamp blocks a road');assert(new Set(audit.buildings.map(b=>b.y)).size>12);
  assert.equal(await p.locator('.sidebar-resizer').isVisible(),false);
  assert.deepEqual(f.errors,[]);checks.push({groups,buildings:audit.buildings.length,lamps:audit.lamps.length,minClearance:Math.floor(Math.min(...audit.buildings.map(b=>b.clearance)))});
  if(!groups){await p.setViewportSize({width:1476,height:1056});await p.evaluate(()=>FoamTownLighting.set('day'));await p.addStyleTag({content:'.town-game-world{transform:scale(.6)!important;transition:none!important}.town-game-lights,.town-game-top,.town-game-bottom,.town-game-minimap,.town-activity,.town-game-vignette{display:none!important}'});await p.screenshot({path:path.join(OUT,'layout-full.png')});}
  await f.close();
 }
 const f=await townFixture(browser),p=f.page;await ready(p,'/','.town-nav-entry');await p.waitForFunction(()=>FoamDirectory.available);
 assert.equal(await p.locator('#sidebar nav a[href="/town/"]').count(),1);assert.equal(await p.locator('#sidebar nav a').first().getAttribute('href'),'/town/');assert(await p.locator('.town-nav-entry').isVisible());
 await p.screenshot({path:path.join(OUT,'town-entry.png')});await f.close();
 fs.writeFileSync(path.join(OUT,'layout-results.json'),JSON.stringify({checks,topNavigation:true},null,2));console.log(JSON.stringify({checks,topNavigation:true},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
