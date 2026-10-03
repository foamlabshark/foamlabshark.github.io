from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def replace(file,old,new):
 p=ROOT/file;s=p.read_text(encoding='utf-8')
 if new in s:return
 if old not in s:raise RuntimeError(f'Missing integration anchor: {file}: {old[:70]}')
 p.write_text(s.replace(old,new,1),encoding='utf-8')
replace('themes/foam-lab/layout/account.ejs','<section class="account-quick">','<section class="town-account" id="town-account"><h2>我的小镇</h2><p>正在读取小镇信息…</p></section><section class="account-quick">')
replace('themes/foam-lab/layout/home.ejs','<section class="fl-community">','<a class="town-entry town-entry-banner" href="/town/"><div><strong>熊猫小镇</strong><p>逛逛街道，给邻居送根竹子，聊聊最近在算的案例。</p></div><span>带熊猫去逛逛 →</span></a>\n<section class="fl-community">')
# Town has a decorated entry at the top of layout.ejs and directory.js.
# Do not append a second entry to the community navigation.
replace('themes/foam-lab/source/assets/town/town.js','/community/?id=','/community/?topic=')
# All discussion links use the existing topic query parameter.
p=ROOT/'themes/foam-lab/source/assets/town/town.js';p.write_text(p.read_text(encoding='utf-8').replace('/community/?id=','/community/?topic='),encoding='utf-8')
replace('themes/foam-lab/source/assets/lab.js',"'<article class=\"lab-message\"><div", "'<article class=\"lab-message\" data-message-id=\"'+r.id+'\" data-author-id=\"'+r.author_id+'\"><div")
replace('themes/foam-lab/source/assets/lab.js','more.hidden=page.length<200;}','more.hidden=page.length<200;window.dispatchEvent(new Event("foamlab:messages"));}')
replace('themes/foam-lab/source/assets/lab.js',"try{lab.check(await lab.client.from('foamlab_threads').update({status:thread.status==='resolved'?'open':'resolved'}).eq('id',id));", "try{if(thread.accepted_message_id&&thread.status==='resolved')lab.check(await lab.client.rpc('foamlab_accept_answer',{thread_id:id,message_id:null}));else lab.check(await lab.client.from('foamlab_threads').update({status:thread.status==='resolved'?'open':'resolved'}).eq('id',id));")
replace('themes/foam-lab/source/assets/cms.js',"moderator?[['moderation','评论与讨论']]", "moderator?[['moderation','评论与讨论'],['town','熊猫小镇']]")
replace('themes/foam-lab/source/assets/cms.js',"if(active==='moderation')await window.FoamCMSModeration(api);", "if(active==='moderation')await window.FoamCMSModeration(api);\n  if(active==='town')await window.FoamCMSTown(api);")
replace('themes/foam-lab/layout/admin.ejs','<script src="/assets/cms.js" defer></script>', '<script src="/assets/town/town-admin.js" defer></script>\n<script src="/assets/cms.js" defer></script>')
replace('themes/foam-lab/source/assets/panda-pet.js',"article:'文章发表'", "article:'文章发表',accepted:'回答被采纳',bamboo:'收到竹子',spot:'首次到访景点',festival:'节日收藏',town_visit:'小镇到访',town_home:'选择住处'")
replace('themes/foam-lab/source/assets/panda-pet.js','5 种形态 · 点击展开','8 种形态 · 点击展开')
replace('themes/foam-lab/source/assets/panda-pet.js',"['decoration','装饰']].map", "['decoration','装饰'],['ride','出行'],['house','房屋'],['duo','互动'],['emote','表情'],['badge','纪念章'],['title','称号']].map")
replace('themes/foam-lab/source/assets/panda-pet.js',"pet.dataset.form=p.form;", "pet.dataset.ride=p.ride||'walk';pet.dataset.form=p.form;")
replace('themes/foam-lab/source/assets/panda-pet.js',"const next=state.items.filter(i=>i.required_level>state.level)", "const next=state.items.filter(i=>!i.requirement&&!i.festival&&i.required_level>state.level)")
replace('themes/foam-lab/source/assets/panda-pet.js','<strong>图鉴已收集齐全</strong><span>继续学习，经验和等级会继续积累。</span>', '<strong>等级收藏已解锁</strong><span>还可以通过答疑、创作和小镇活动收集成就与节日收藏。</span>')
replace('themes/foam-lab/source/assets/panda-pet.js',"i.unlocked?'已解锁 · 点击使用':'Lv.'+i.required_level+' 解锁'", "i.unlocked?['duo','emote','badge','title','house'].includes(i.category)?'前往小镇查看':'已解锁 · 点击使用':i.requirement?'完成成就解锁':i.festival?'节日期间领取':'Lv.'+i.required_level+' 解锁'")
replace('themes/foam-lab/source/assets/panda-pet.js','<li>每日签到：10 经验</li>','<li>回答被采纳：20 经验，每日最多 3 次</li><li>收到竹子：2 经验，每日最多 5 次</li><li>首次到访每类景点：5 经验，共 6 类</li><li>每日签到：10 经验</li>')
replace('themes/foam-lab/source/assets/panda-pet.js',"e.points? '+'+e.points:'已撤回'", "e.points? '+'+e.points:['town_visit','town_home','festival'].includes(e.kind)?'已记录':'已撤回'")
print('Town entry, account, discussion, CMS and panda integration updated.')
replace('themes/foam-lab/source/assets/panda-pet.js',"if(item){const changingForm=", "if(item){const collection=state?.items.find(i=>i.id===item.dataset.pandaItem)?.category;if(['duo','emote','badge','title','house'].includes(collection)){location.href='/town/';return;}const changingForm=")
replace('themes/foam-lab/source/assets/panda-pet.js','data-form="${p.form}" data-outfit="${p.outfit}" data-decoration=', 'data-form="${p.form}" data-outfit="${p.outfit}" data-ride="${p.ride||\'walk\'}" data-decoration=')
replace('themes/foam-lab/source/assets/panda-pet.js','data-decoration="${i.category===\'decoration\'?i.id:p.decoration||\'no-decor\'}"', 'data-ride="${i.category===\'ride\'?i.id:p.ride||\'walk\'}" data-decoration="${i.category===\'decoration\'?i.id:p.decoration||\'no-decor\'}"')
