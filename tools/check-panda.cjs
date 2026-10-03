/* Real UI with a local-only Auth/RPC fixture; no public posts or user tokens. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/shark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture,ready,content}=require('./check-cms-ui.cjs');
const ROOT=path.resolve(__dirname,'..'),OUT=path.join(ROOT,'.openfoam-work/panda');fs.mkdirSync(OUT,{recursive:true});
const origin=process.env.FOAM_CHECK_ORIGIN||'http://localhost:4173';
const catalog=require('./panda-catalog.json');
const entries=catalog.map(i=>[i.id,i.category,i.title,i.required_level,i.description]);
async function petFixture(browser,options={}){
 const f=await fixture(browser,'member',options);let xp=options.xp??40,checked=false,failure=false,delay=0;
 const pet={user_id:'22222222-2222-4222-8222-222222222222',name:'泡泡',form:'cub',outfit:'none',action:'wave',decoration:'no-decor',visible:true,motion:true,ride:'walk',quickbar:['wave','highfive','smile','heart','thumb','give-bamboo']};const events=[];const calls=[];
 await f.page.context().route('**/rest/v1/rpc/foamlab_pet',async route=>{
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST,OPTIONS'};
  if(route.request().method()==='OPTIONS')return route.fulfill({status:204,headers});
  const data=route.request().postDataJSON();calls.push(data);const level=Math.floor((1+Math.sqrt(1+xp/6.25))/2);
  if(delay)await new Promise(r=>setTimeout(r,delay));
  if(failure)return route.fulfill({status:503,headers,contentType:'application/json',body:JSON.stringify({message:'成长记录暂时无法读取。'})});
  let awarded=0;
  if(data.operation==='checkin'&&!checked){xp+=10;awarded=10;checked=true;events.push({kind:'checkin',points:10,created_at:new Date().toISOString()});}
  if(data.operation==='settings'){for(const key of ['name','motion','visible','ride','quickbar','show_town_entry'])if(key in data.payload)pet[key]=data.payload[key];}
  if(data.operation==='equip'){const entry=entries.find(x=>x[0]===data.payload.id);assert(entry&&entry[3]<=level,'Client tried to equip locked item');pet[entry[1]]=entry[0];}
  const lv=Math.floor((1+Math.sqrt(1+xp/6.25))/2);
  await route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({pet:{...pet,xp},level:lv,level_start:25*lv*(lv-1),next_level_xp:25*lv*(lv+1),checked_in:checked,awarded,items:catalog.map(i=>({...i,unlocked:i.required_level<=lv&&(!i.requirement||(options.achievements||[]).includes(i.id))&&(!i.festival||(options.festivals||[]).includes(i.festival))})),events})});
 });
 return {...f,calls,pet,setXP:v=>xp=v,setFailure:v=>failure=v,setDelay:v=>delay=v};
}
async function touchCheck(page){
 const c=await page.context().newCDPSession(page);let r=await page.locator('.panda-grab').boundingBox();
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+45,y:r.y+50}]});
 await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:180}]});
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(420);
 assert(await page.locator('.panda-bubble').isHidden());r=await page.locator('.panda-grab').boundingBox();assert(r.x<160&&r.y<240);
 const tap=async()=>{await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+45,y:r.y+50}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await tap();await page.waitForTimeout(420);assert(await page.locator('.panda-bubble').isVisible());const bubble=await page.locator('.panda-bubble').boundingBox();assert(bubble.x>=0&&bubble.y>=0&&bubble.x+bubble.width<=390&&bubble.y+bubble.height<=844);
 await tap();await page.waitForTimeout(75);await tap();await page.waitForSelector('#search-dialog[open]');await page.waitForTimeout(450);assert(await page.locator('#search-dialog').isVisible());await page.keyboard.press('Escape');await c.detach();
}
module.exports={petFixture};
if(require.main===module)(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const checks=[];
 try{
  const f=await petFixture(browser,{persistSession:true}),p=f.page;
  await ready(p,'/account/#my-panda','#panda-checkin');await p.waitForSelector('#panda-pet:not([hidden])');
  assert(await p.locator('#panda-item-cap').isDisabled());assert(await p.locator('#panda-item-scarf').isDisabled());
  await p.locator('#panda-checkin').click();await p.waitForFunction(()=>document.querySelector('.panda-level-tag')?.textContent==='Lv.2');assert(await p.locator('#panda-checkin').isDisabled());
  await p.click('#panda-item-scarf');await p.waitForFunction(()=>document.querySelector('#panda-pet')?.dataset.outfit==='scarf');checks.push('check-in, level-up, unlock, equip and account collection');
  await p.locator('.panda-grab').click();await p.waitForSelector('.panda-bubble:not([hidden])');const first=await p.locator('.panda-bubble p').textContent();
  await p.waitForTimeout(380);await p.locator('.panda-grab').click();await p.waitForTimeout(420);const second=await p.locator('.panda-bubble p').textContent();assert.notEqual(first,second);
  await p.locator('.panda-grab').dblclick({delay:80});await p.waitForSelector('#search-dialog[open]');await p.waitForTimeout(450);assert(await p.locator('.panda-bubble').isHidden());assert(await p.locator('#global-search').evaluate(e=>e===document.activeElement));await p.keyboard.press('Escape');checks.push('single click rotates tips; double click only opens search');
  await p.locator('.panda-grab').click();await p.waitForSelector('.panda-bubble:not([hidden])');await p.click('.panda-tip-search');await p.waitForSelector('#search-dialog[open]');assert((await p.locator('#global-search').inputValue()).length>0);await p.keyboard.press('Escape');checks.push('tip links seed the existing site search');
  const old=await p.locator('.panda-grab').boundingBox();await p.mouse.move(old.x+old.width/2,old.y+old.height/2);await p.mouse.down();await p.mouse.move(280,320,{steps:12});await p.mouse.up();await p.waitForTimeout(420);assert(await p.locator('.panda-bubble').isHidden());assert(await p.locator('#search-dialog').isHidden());const moved=await p.locator('#panda-pet').boundingBox();assert(moved.x<400);checks.push('dragging suppresses clicks');
  await p.locator('.panda-grab').focus();await p.keyboard.press('ArrowRight');const after=await p.locator('#panda-pet').boundingBox();assert(Math.abs(after.x-moved.x-16)<2);checks.push('keyboard movement');
  await p.locator('[data-pet-hide]').click();await p.waitForSelector('.panda-dock:not([hidden])');assert(await p.locator('#panda-pet').isHidden());await p.locator('.panda-dock').click();await p.waitForSelector('#panda-pet:not([hidden])');checks.push('hide and restore');
  await p.locator('#panda-settings [name=name]').fill('竹竹');await p.locator('#panda-settings [name=motion]').uncheck();await p.locator('#panda-settings [type=submit]').click();await p.waitForFunction(()=>document.querySelector('#panda-pet')?.dataset.quiet==='true');assert.equal(await p.locator('.panda-nameplate span').textContent(),'竹竹');checks.push('name and animation preferences');
  f.setXP(2300);await p.evaluate(()=>dispatchEvent(new Event('foamlab:activity')));await p.waitForFunction(()=>document.querySelector('.panda-level-tag')?.textContent==='Lv.10');await p.click('#panda-item-cap');await p.waitForFunction(()=>document.querySelector('#panda-pet')?.dataset.outfit==='cap');await p.click('#panda-tab-form');await p.click('#panda-item-master');await p.waitForFunction(()=>document.querySelector('#panda-pet')?.dataset.form==='master');await p.click('#panda-tab-action');assert.equal(await p.locator('.panda-item').count(),catalog.filter(i=>i.category==='action').length);await p.click('#panda-item-dance');await p.waitForFunction(()=>document.querySelector('#panda-item-dance')?.getAttribute('aria-pressed')==='true');checks.push('level 10 form, costume and action collection');
  await p.evaluate(()=>{const el=document.querySelector('#panda-pet');el.style.left=(innerWidth-152)+'px';el.style.top=(innerHeight-210)+'px';dispatchEvent(new Event('resize'));});await p.click('#panda-tab-outfit');await p.evaluate(()=>scrollTo(0,170));await p.screenshot({path:path.join(OUT,'account-desktop.png'),animations:'disabled'});
  await p.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await p.evaluate(()=>document.documentElement.dataset.theme='dark');assert.equal(await p.locator('#panda-pet').getAttribute('data-quiet'),'true');await p.screenshot({path:path.join(OUT,'account-dark.png'),animations:'disabled'});checks.push('dark mode and reduced motion');
  f.setFailure(true);await p.click('#panda-item-scarf');await p.waitForFunction(()=>document.querySelector('.panda-form-status')?.textContent.includes('暂时无法读取'));checks.push('RPC error retains existing pet and reports retryable failure');f.setFailure(false);
  f.setDelay(700);await p.evaluate(()=>dispatchEvent(new Event('foamlab:activity')));await p.waitForTimeout(230);await p.locator('#nav-sign-out').click();await p.waitForFunction(()=>window.foamAuth&&!window.foamAuth.loading&&!window.foamAuth.user);await p.waitForTimeout(850);assert(await p.locator('#panda-pet').isHidden());assert(await p.locator('.panda-dock').isHidden());checks.push('logout during pending request cannot resurrect pet');assert.deepEqual(f.errors,[]);await f.close();
  const mobile=await petFixture(browser,{mobile:true,xp:150}),mp=mobile.page;await ready(mp,'/account/#my-panda','#panda-checkin');assert(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await mp.locator('[data-pet-search]').click();await mp.waitForSelector('#search-dialog[open]');await mp.keyboard.press('Escape');await mp.locator('.panda-grab').click();await mp.waitForSelector('.panda-bubble:not([hidden])');const bubble=await mp.locator('.panda-bubble').boundingBox();assert(bubble.x>=0&&bubble.x+bubble.width<=390);await mp.screenshot({path:path.join(OUT,'account-mobile.png'),animations:'disabled'});await touchCheck(mp);checks.push('touch drag, single tap and double tap keep search open');assert.deepEqual(mobile.errors,[]);await mobile.close();checks.push('mobile controls, bubble clamping and no horizontal overflow');
  const anon=await fixture(browser,'anon'),ap=anon.page;await ready(ap,'/','.panda-home-portrait svg');assert(await ap.locator('#panda-pet').isHidden());await ap.screenshot({path:path.join(OUT,'home-desktop.png'),animations:'disabled'});await ap.setViewportSize({width:390,height:844});assert(await ap.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await ap.screenshot({path:path.join(OUT,'home-mobile.png'),animations:'disabled'});checks.push('anonymous site has theme but no floating pet');assert.deepEqual(anon.errors,[]);await anon.close();
  fs.writeFileSync(path.join(OUT,'results.json'),JSON.stringify({checks,passed:checks.length,externalWrites:0},null,2));console.log(JSON.stringify({checks,passed:checks.length,externalWrites:0},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
