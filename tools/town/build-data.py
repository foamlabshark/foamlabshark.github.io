"""The town's public catalogue and abstract, non-geographic island layout."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2]
data='''beijing|北京|7|2|pagoda|cavity
tianjin|天津|8|3|boat|cavity
hebei|河北|7|3|bridge|cavity
shanxi|山西|6|3|pagoda|cavity
neimenggu|内蒙古|5|1|wind|wind
liaoning|辽宁|8|2|boat|marine
jilin|吉林|9|1|snow|cavity
heilongjiang|黑龙江|9|0|snow|cavity
shanghai|上海|9|5|boat|marine
jiangsu|江苏|8|5|boat|marine
zhejiang|浙江|8|6|bridge|cavity
anhui|安徽|7|5|tree|cavity
fujian|福建|8|7|boat|cavity
jiangxi|江西|7|6|tree|cavity
shandong|山东|8|4|bridge|cavity
henan|河南|6|4|pagoda|cavity
hubei|湖北|6|5|dam|dam
hunan|湖南|6|6|tree|cavity
guangdong|广东|7|7|chip|heat
guangxi|广西|5|7|tree|cavity
hainan|海南|5|8|palm|cavity
chongqing|重庆|5|5|bridge|cavity
sichuan|四川|4|5|plane|airfoil
guizhou|贵州|5|6|tree|cavity
yunnan|云南|4|7|tree|cavity
xizang|西藏|1|5|mountain|cavity
shaanxi|陕西|5|4|plane|airfoil
gansu|甘肃|3|2|wind|wind
qinghai|青海|2|4|mountain|cavity
ningxia|宁夏|4|3|wind|cavity
xinjiang|新疆|1|1|wind|wind
taiwan|台湾|9|7|mountain|cavity
hongkong|香港|7|8|boat|cavity
macau|澳门|6|8|bridge|cavity
overseas|海外|1|7|boat|cavity
square|熊猫广场|1|8|panda|cavity'''
provinces=[dict(zip(['id','name','x','y','icon','landmark'],r.split('|'))) for r in data.splitlines()]
layout={'heilongjiang':(8,0),'neimenggu':(5,1),'beijing':(6,1),'liaoning':(7,1),'jilin':(8,1),'xinjiang':(0,2),'gansu':(3,2),'ningxia':(4,2),'shanxi':(5,2),'hebei':(6,2),'tianjin':(7,2),'qinghai':(2,3),'shaanxi':(4,3),'henan':(5,3),'shandong':(6,3),'xizang':(1,4),'sichuan':(3,4),'chongqing':(4,4),'hubei':(5,4),'anhui':(6,4),'jiangsu':(7,4),'yunnan':(3,5),'guizhou':(4,5),'hunan':(5,5),'jiangxi':(6,5),'zhejiang':(7,5),'shanghai':(8,5),'guangxi':(4,6),'guangdong':(5,6),'fujian':(6,6),'taiwan':(8,6),'hainan':(4,7),'macau':(5,7),'hongkong':(6,7),'overseas':(9,7),'square':(0,0)}
for p in provinces:
    p['x'],p['y']=layout[p['id']]
    p['id']={'macau':'macao','square':'plaza'}.get(p['id'],p['id'])
    if p['landmark']=='marine':p['landmark']='ship'
    if p['icon']=='pagoda':p['icon']='tree'
assert len(provinces)==36 and len({x['id'] for x in provinces})==36
items=[]
def add(id,category,title,level,description,condition=None):items.append(dict(id=id,category=category,title=title,required_level=level,description=description,condition=condition or {}))
for r in [('sailor','水手熊猫',22,'海魂衫、水手帽，还有肩上的小海鸥。'),('pilot','飞行员熊猫',26,'戴上飞行帽和风镜，围巾随风飘动。'),('polar','极地科考熊猫',30,'穿好厚羽绒服，帽檐缀着小小的霜花。')]:add(r[0],'form',*r[1:])
for r in [('beanie','毛线帽',9,'帽顶有一颗软软的绒球。'),('overalls','背带裤',11,'胸前口袋插着小扳手。'),('bowtie','小领结',13,'合影时系上红色领结。'),('sunglasses','圆框墨镜',16,'准备晒一会儿太阳。')]:add(r[0],'outfit',*r[1:])
achievements=[('helper','热心熊猫','accepted',3),('author','作者','articles',1),('traveller','串门达人','provinces',34),('bamboo-master','竹林大户','bamboo',100),('collector','景点收藏家','landmarks',6),('institute','研究所成员','institute',1)]
for id,title,key,count in achievements:add('title-'+id,'title',title,1,'累计'+str(count)+{'accepted':'次回答被采纳','articles':'篇已发表文章','provinces':'个省份到访','bamboo':'根收到的竹子','landmarks':'枚景点纪念章','institute':'个研究所成员身份'}[key],dict(kind='achievement',key=key,count=count))
for id,title,key,count,desc in [('stethoscope','听诊器','accepted',3,'挂在脖子上，为问题找找原因。'),('palette','画笔与调色板','articles',1,'爪子上沾着一点颜料。'),('map-scroll','地图卷轴','provinces',34,'卷起的地图背在身后。'),('basket','竹编背篓','bamboo',100,'背篓里探出几根竹子。'),('badge-card','研究所工牌','institute',1,'戴上所在研究所的小工牌。')]:add(id,'outfit',title,1,desc,dict(kind='achievement',key=key,count=count))
for id,title,event,desc in [('red-lantern','红灯笼','spring','春节里提一盏小灯笼。'),('zongzi','粽子挂件','dragon','腰间挂一只小粽子。'),('moon-lamp','月亮提灯','midautumn','带着一轮暖暖的小月亮。')]:add(id,'outfit',title,1,desc,dict(kind='festival',event=event))
for id,title,level,desc in [('type','敲键盘',5,'双爪在小键盘上轻快敲动。'),('kite','放风筝',7,'牵着风筝，看它随着气流摆动。'),('bubbles','吹泡泡',9,'泡泡慢慢升起，在空中散开。'),('camera','拍张照',10,'举起相机，留下这一刻。'),('taichi','打太极',14,'慢慢推手，脚下画出一个圆。'),('streamlines','画流线',16,'用爪子画出几条彩色流线。')]:add(id,'action',title,level,desc)
add('fireworks','action','放烟花',1,'头顶绽开一朵小烟花。',dict(kind='festival',event='celebration'))
for id,title,level in [('highfive','击掌',1),('bamboo','递竹子',1),('hug','拥抱',3),('photo','合影',6),('duodance','双人舞',10)]:add('duo-'+id,'duo',title,level,'发起邀请，对方回应后一起完成。')
for id,title,level in [('smile','笑脸',1),('heart','爱心',1),('like','点赞',1),('question','问号',1),('exclaim','感叹号',1),('idea','灯泡',1),('bamboo','竹子',1),('zzz','Zzz',1),('stars','星星眼',5),('sweat','冒汗',10),('confetti','彩带',15),('fire','小火苗',20)]:add('emote-'+id,'emote',title,level,'在头顶显示三秒的小表情。')
for id,title,level,desc in [('walk','走路',1,'迈着轻快的小步。'),('run','小跑',3,'耳朵一颠一颠地向前跑。'),('skate','滑板',8,'脚下的滑板带起几道风线。'),('bike','自行车',12,'车筐里放着一根竹子。'),('balloon','气球飘行',20,'抓着三只气球慢慢飘。')]:add('travel-'+id,'travel',title,level,desc)
for id,title,level,desc in [('bamboo','竹屋',1,'竹色屋顶和小小的院子。'),('brick','砖瓦小屋',5,'红瓦屋顶，烟囱缓缓冒烟。'),('mushroom','蘑菇屋',10,'圆圆的屋顶缀着白色圆点。'),('lighthouse','灯塔小屋',15,'屋顶的灯缓缓转动。'),('windtunnel','风洞实验室',20,'风扇转起来，门前飘过几条流线。')]:add('house-'+id,'house',title,level,desc)
for id,title in [('dam','溃坝'),('wind','风场'),('marine','船舶'),('airfoil','翼型'),('heat','散热'),('cavity','方腔')]:add('landmark-'+id,'badge',title+'纪念章',1,'首次到访'+title+'景点后获得。',dict(kind='landmark',key=id))
out=ROOT/'source-openfoam/assets/town';out.mkdir(parents=True,exist_ok=True)
renames={'map-scroll':'scroll','red-lantern':'lantern-red','type':'typing','camera':'photo','streamlines':'streamline','fireworks':'firework','duo-highfive':'highfive','duo-bamboo':'give-bamboo','duo-hug':'hug','duo-photo':'selfie','duo-duodance':'duet','travel-walk':'walk','travel-run':'jog','travel-skate':'skateboard','travel-bike':'bicycle','travel-balloon':'balloon','house-bamboo':'bamboo-hut','house-brick':'brick','house-mushroom':'mushroom','house-lighthouse':'lighthouse','house-windtunnel':'wind-tunnel','title-traveller':'title-traveler','title-bamboo-master':'title-bamboo'}
for item in items:
    old=item['id'];item['id']=renames.get(old,old)
    if old.startswith('emote-'):item['id']={'like':'thumb','stars':'starry'}.get(old[6:],old[6:])
    if old.startswith('landmark-'):item['id']='badge-'+old[9:].replace('marine','ship')
    if item['category']=='travel':item['category']='ride'
    c=item.pop('condition');item['requirement']=None;item['festival']=None
    if c.get('kind')=='achievement':item['requirement']={'type':{'bamboo':'bamboo_received','landmarks':'badges'}.get(c['key'],c['key']),'count':c['count']}
    if c.get('kind')=='landmark':item['requirement']={'type':'spot','id':c['key'].replace('marine','ship')}
    if c.get('kind')=='festival':item['festival']={'dragon':'dragon-boat','midautumn':'mid-autumn','celebration':'spring,national'}.get(c['event'],c['event'])
(out/'provinces.json').write_text(json.dumps(provinces,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(ROOT/'tools/town/catalog-new.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
base=json.loads((ROOT/'tools/panda-catalog.json').read_text(encoding='utf-8'))
old_new_ids=set(renames)|{'emote-'+x for x in ['smile','heart','like','question','exclaim','idea','bamboo','zzz','stars','sweat','confetti','fire']}|{'landmark-'+x for x in ['dam','wind','marine','airfoil','heat','cavity']}
base=[x for x in base if x['id'] not in {i['id'] for i in items}|old_new_ids]+items
(ROOT/'tools/panda-catalog.json').write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(out/'catalog.json').write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(len(provinces),'islands;',len(items),'new collectibles;',len(base),'total')
