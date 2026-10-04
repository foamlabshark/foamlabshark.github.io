/* Browser regression checks for physical keys, IME events and input cancellation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/shark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {townFixture}=require('./check-town.cjs'),{ready}=require('./check-cms-ui.cjs');
const OUT=path.resolve(__dirname,'../.openfoam-work/town');
const pos=p=>p.locator('.town-resident.is-me').evaluate(e=>({x:parseFloat(e.style.getPropertyValue('--x'))+32,y:parseFloat(e.style.getPropertyValue('--y'))+62}));
const changed=(before,after,axis,sign,label)=>assert((after[axis]-before[axis])*sign>25,label+' should move in the requested direction');
const stable=(a,b,label)=>assert(Math.hypot(a.x-b.x,a.y-b.y)<4,label);
async function event(p,type,key,code){await p.evaluate(({type,key,code})=>document.activeElement.dispatchEvent(new KeyboardEvent(type,{key,code,bubbles:true,cancelable:true,isComposing:key==='Process'})),{type,key,code});}
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[];try{
 const f=await townFixture(browser),p=f.page;await ready(p,'/town/#hubei','.town-game-world');await p.waitForTimeout(600);
 for(const [key,axis,sign]of [['d','x',1],['a','x',-1],['s','y',1],['w','y',-1],['ArrowRight','x',1],['ArrowLeft','x',-1],['ArrowDown','y',1],['ArrowUp','y',-1]]){const before=await pos(p);await p.keyboard.down(key);await p.waitForTimeout(400);await p.keyboard.up(key);changed(before,await pos(p),axis,sign,key);}
 checks.push('WASD and all four arrow keys');
 for(const [code,axis,sign]of [['KeyD','x',1],['KeyA','x',-1],['KeyS','y',1],['KeyW','y',-1]]){const before=await pos(p);await event(p,'keydown','Process',code);await p.waitForTimeout(400);await event(p,'keyup',code.slice(-1).toLowerCase(),code);changed(before,await pos(p),axis,sign,'IME '+code);const stopped=await pos(p);await p.waitForTimeout(100);stable(stopped,await pos(p),'IME release should stop movement');}
 checks.push('Chinese IME Process events; physical key identity survives a changed key value on release');
 await event(p,'keydown','d','KeyD');await p.waitForTimeout(200);await event(p,'keyup','Process','KeyD');const released=await pos(p);await p.waitForTimeout(200);stable(released,await pos(p),'Input-method switch on keyup leaves no held key');
 await p.keyboard.down('d');await p.waitForTimeout(200);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));const blurred=await pos(p);await p.waitForTimeout(200);stable(blurred,await pos(p),'Window blur stops movement');await p.keyboard.up('d');checks.push('release and window blur clear held directions');
 await p.keyboard.down('s');await p.waitForTimeout(200);await p.click('[data-town=settings]');await p.waitForSelector('#town-dialog[open]');const paused=await pos(p);await p.fill('#town-settings-form [name=group_name]','WASD 测试团队');await event(p,'keydown','Process','KeyD');await p.waitForTimeout(200);stable(paused,await pos(p),'Typing must not move the panda');await p.click('[data-town-close]');await p.waitForTimeout(250);stable(paused,await pos(p),'Closing a dialog must not resume a stale direction');await p.keyboard.up('s');await event(p,'keyup','Process','KeyD');checks.push('dialog typing and close preserve a stopped player');
 const afterClose=await pos(p);await p.keyboard.down('d');await p.waitForTimeout(350);await p.keyboard.up('d');changed(afterClose,await pos(p),'x',1,'D after dialog');assert.deepEqual(f.errors,[]);await f.close();
 const m=await townFixture(browser,{mobile:true}),q=m.page;await ready(q,'/town/#hubei','.town-game-world');await q.waitForTimeout(500);
 for(const [direction,axis,sign]of [['d','x',1],['a','x',-1],['s','y',1],['w','y',-1]]){const before=await pos(q),box=await q.locator('[data-game-direction='+direction+']').boundingBox(),cdp=await q.context().newCDPSession(q);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await q.waitForTimeout(400);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();changed(before,await pos(q),axis,sign,'Touch '+direction);const stopped=await pos(q);await q.waitForTimeout(120);stable(stopped,await pos(q),'Touch release stops movement');}
 assert.deepEqual(m.errors,[]);await m.close();checks.push('all four mobile direction buttons and release');
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'controls-results.json'),JSON.stringify({checks,passed:checks.length,externalWrites:0},null,2));console.log(JSON.stringify({checks,passed:checks.length,externalWrites:0},null,2));
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
