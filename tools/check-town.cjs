/* Browser checks use local fixtures. Database invariants are tested separately in SQL. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('C:/Users/shark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {fixture,ready,MEMBER}=require('./check-cms-ui.cjs'),{petFixture}=require('./check-panda.cjs');
const OUT=path.resolve(__dirname,'../.openfoam-work/town');fs.mkdirSync(OUT,{recursive:true});
const catalog=require('./panda-catalog.json'),NEIGHBOR='33333333-3333-4333-8333-333333333333';
async function townFixture(browser,options={}){
 const f=options.anon||options.admin?await fixture(browser,options.admin?'admin':'anon',options):await petFixture(browser,{...options,xp:800});
 f.db.foamlab_settings.push({key:'town_enabled',value:'on'});f.db.foamlab_pets=[{user_id:MEMBER,show_town_entry:true}];
 f.db.foamlab_sections=[{id:'town-nav',key:'town',name:'熊猫小镇',href:'/town/',parent_id:null,visible:true,nav_group:'资源与社区',sort_order:585},{id:'home-nav',key:'home',name:'学习概览',href:'/',parent_id:null,visible:true,nav_group:'学习空间',sort_order:1}];
 const card={user_id:MEMBER,name:'泡泡同学',pet_name:'泡泡',level:6,title:'见习工程师',province:'hubei',form:'cub',outfit:'scarf',ride:'walk',house_style:'bamboo-hut',bamboo:8,group_name:'Flow Lab',institute:null};
 const neighbor={...card,user_id:NEIGHBOR,name:'竹林邻居',outfit:'strawhat',house_style:'brick',question:{id:'topic-0',title:'如何检查局部加密后的网格质量？'}};
 let resident=options.join||options.anon?null:{user_id:MEMBER,province:'hubei',house_style:'bamboo-hut',group_name:'Flow Lab',show_entry:true,show_question:true,mailbox_open:true,walk_to_buildings:true};let bamboo=false,mails=[],reports=[];
 const calls=[];
 const self=()=>({enabled:true,resident,card:resident?card:null,unread:0,unlocked:catalog.filter(i=>i.required_level<=6&&!i.requirement&&!i.festival).map(i=>i.id),show_entry:true,invitations:[]});
 await f.context.route('**/rest/v1/rpc/foamlab_town*',async route=>{
  const req=route.request(),name=new URL(req.url()).pathname.split('/').pop(),headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST,OPTIONS'};
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});const arg=req.postDataJSON()||{},p=arg.payload||{};calls.push({name,...arg});let data;
  if(name==='foamlab_town_map')data={enabled:true,provinces:[{id:'hubei',residents:12,online:2,answers:7}]};
  if(name==='foamlab_town_street')data={enabled:true,province:arg.province,spot:'dam',page:arg.page||0,residents:options.fullStreet?Array.from({length:10},(_,i)=>({...neighbor,user_id:i===1?MEMBER:`44444444-4444-4444-8444-${String(i).padStart(12,"0")}`,name:`邻居 ${i+1}`,house_style:["brick","bamboo-hut","mushroom","lighthouse","wind-tunnel"][i%5]})):[neighbor,card],online:resident?[card,neighbor]:[],total:24,groups:Array.from({length:options.groups||0},(_,i)=>({name:'研究所 '+(i+1),count:5})),questions:[neighbor.question],articles:[]};
  if(name==='foamlab_town_house')data={card:arg.user_id===MEMBER?card:neighbor,mailbox_open:true,mine:arg.user_id===MEMBER,badges:['badge-dam'],photos:[],photo_total:0,mail_total:mails.length,mail:mails,given_today:bamboo};
  if(name==='foamlab_town_action')data={...p,from:MEMBER,nonce:'a1b2c3d4'};
  if(name==='foamlab_town_admin'){data={items:[],total:61,page:p.page||0};if(arg.operation!=='list')data={saved:true};}
  if(name==='foamlab_town'){
   if(arg.operation==='join')resident={user_id:MEMBER,province:p.province,house_style:'bamboo-hut',show_entry:true,show_question:true,mailbox_open:true,walk_to_buildings:true,group_name:''};
   if(arg.operation==='settings')Object.assign(resident,p);
   if(arg.operation==='leave')resident=null;
   if(arg.operation==='mail_send')mails.unshift({id:crypto.randomUUID(),author_id:MEMBER,author_name:'泡泡同学',body:p.body,created_at:new Date().toISOString()});
   if(arg.operation==='mail_delete')mails=mails.filter(m=>m.id!==p.id);
   if(arg.operation==='report')reports.push(p);
   data=arg.operation==='give_bamboo'?{given:!bamboo,awarded:2}:arg.operation==='visit_spot'?{spot:'dam',awarded:5}:['enter','heartbeat'].includes(arg.operation)?{online:true,invitations:[]}:self();if(arg.operation==='give_bamboo')bamboo=true;
  }
  return route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify(data)});
 });
 return {...f,callsTown:calls};
}
module.exports={townFixture};
if(require.main===module)(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),checks=[];
 try{
  const visitor=await townFixture(browser,{anon:true});await ready(visitor.page,'/town/#map','.town-island');assert.equal(await visitor.page.locator('.town-island').count(),36);await visitor.page.screenshot({path:path.join(OUT,'map-desktop.png'),fullPage:true});await visitor.page.click('[data-province=hubei]');await visitor.page.waitForSelector('.town-street-world');assert.equal(await visitor.page.locator('.town-resident').count(),2);assert.equal(visitor.callsTown.filter(c=>c.operation==='enter').length,0);await visitor.page.screenshot({path:path.join(OUT,'street-visitor.png'),fullPage:true});await visitor.page.click('[data-town=directory]');await visitor.page.click('#town-dialog [data-town=text]');assert(await visitor.page.locator('.town-street-frame').isHidden());assert(await visitor.page.locator('.town-text-residents').isVisible());checks.push('36 accessible islands; visitor street; no visitor presence; text mode');await visitor.close();
  const f=await townFixture(browser),p=f.page;await ready(p,'/town/#hubei','.town-resident');await p.locator('[data-town=wardrobe]').click();await p.waitForSelector('.town-wardrobe');assert.equal(await p.locator('[data-town=wardrobe-tab]').count(),10);await p.click('[data-town-close]');await p.click('[data-town=neighbors]');await p.click(`#town-dialog [data-town=house][data-user="${NEIGHBOR}"]`);await p.waitForSelector('#town-mail-form');await p.fill('#town-mail-form textarea','你好，一起研究 OpenFOAM！');await p.click('#town-mail-form [type=submit]');await p.waitForSelector('.town-mail');await p.click('[data-town=bamboo]');assert(await p.locator('[data-town=bamboo]').isDisabled());await p.screenshot({path:path.join(OUT,'house-desktop.png'),fullPage:true});await p.click('[data-town=mail-delete]');await p.waitForFunction(()=>!document.querySelector('.town-mail'));await p.click('[data-town-close]');await p.click('[data-town=settings]');await p.uncheck('#town-settings-form [name=show_question]');await p.click('#town-settings-form [type=submit]');await p.waitForFunction(()=>!document.querySelector('#town-dialog').open);assert(f.callsTown.some(c=>c.operation==='settings'&&c.payload.show_question===false));checks.push('10 wardrobe categories; house; public mail send/delete; bamboo; settings');
  await p.evaluate(()=>document.documentElement.dataset.theme='dark');await p.screenshot({path:path.join(OUT,'street-dark.png'),fullPage:true});await p.setViewportSize({width:390,height:844});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await p.screenshot({path:path.join(OUT,'street-mobile.png'),fullPage:true});checks.push('dark and mobile layouts without page overflow');await f.close();
  const join=await townFixture(browser,{join:true,mobile:true});await ready(join.page,'/town/#map','.town-island');await join.page.click('[data-town=join]');await join.page.selectOption('#town-join-province','sichuan');await join.page.click('[data-town=join-next]');assert.equal(join.callsTown.filter(c=>c.operation==='join').length,0);await join.page.click('[data-town=join-next]');await join.page.click('[data-town=join-back]');await join.page.click('[data-town=join-next]');await join.page.click('[data-town=join-next]');await join.page.waitForSelector('.town-street-world');assert(join.callsTown.some(c=>c.operation==='join'&&c.payload.province==='sichuan'));checks.push('three-step join; back navigation; single final join write');await join.close();
  const account=await townFixture(browser);await ready(account.page,'/account/#town','#account-town-settings');assert(await account.page.locator('#account-section-town').isVisible());await account.page.uncheck('[name=show_entry]');await account.page.click('#account-town-settings [type=submit]');await account.page.waitForFunction(()=>document.documentElement.dataset.townEntry==='false');checks.push('personal center town tab and entry preference');await account.close();
  const admin=await townFixture(browser,{admin:true});await ready(admin.page,'/admin/','[data-cms-tab=town]');await admin.page.click('[data-cms-tab=town]');await admin.page.waitForSelector('.town-admin-table');await admin.page.getByRole('button',{name:'最后一页',exact:true}).click();assert(admin.callsTown.some(c=>c.name==='foamlab_town_admin'&&c.payload.page===3));await admin.page.click('[data-town-admin=tab][data-type=settings]');await admin.page.waitForSelector('[name=enabled]');await admin.page.screenshot({path:path.join(OUT,'town-admin.png'),fullPage:true});checks.push('dedicated admin tabs and first/last pagination');await admin.close();
  fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify({checks,passed:checks.length,externalWrites:0},null,2));console.log(JSON.stringify({checks,passed:checks.length,externalWrites:0},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
