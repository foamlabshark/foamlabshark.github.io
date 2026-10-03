-- Panda Town v1. All changes go through authenticated, validated RPCs.
create table public.foamlab_town_residents (
 user_id uuid primary key references auth.users(id) on delete cascade,
 province text not null, house_style text not null default 'bamboo-hut', title_id text,
 mailbox_open boolean not null default true, show_question boolean not null default true,
 walk_to_buildings boolean not null default true, show_entry boolean not null default true,
 group_name text not null default '' check(char_length(group_name)<=40), group_key text not null default '',
 visited_provinces text[] not null default '{}', visited_spots text[] not null default '{}',
 moved_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index town_residents_province on public.foamlab_town_residents(province,created_at,user_id);
create index town_residents_group on public.foamlab_town_residents(province,group_key) where group_key<>'';
create table public.foamlab_town_presence (
 user_id uuid primary key references auth.users(id) on delete cascade, province text not null,
 seen_at timestamptz not null default now(), entered_at timestamptz not null default now(),
 recent_actions jsonb not null default '[]', invitations jsonb not null default '[]'
);
create index town_presence_street on public.foamlab_town_presence(province,seen_at);
create table public.foamlab_town_mail (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 author_id uuid not null references auth.users(id) on delete cascade, body text not null check(char_length(body) between 1 and 200),
 status text not null default 'visible' check(status in ('visible','hidden','deleted')),
 read_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index town_mail_owner on public.foamlab_town_mail(owner_id,created_at desc);
create index town_mail_author on public.foamlab_town_mail(author_id,created_at desc);
create table public.foamlab_town_bamboo (
 giver_id uuid not null references auth.users(id) on delete cascade,
 receiver_id uuid not null references auth.users(id) on delete cascade,
 given_on date not null default (now() at time zone 'Asia/Shanghai')::date, created_at timestamptz not null default now(),
 primary key(giver_id,receiver_id,given_on), check(giver_id<>receiver_id)
);
create index town_bamboo_receiver on public.foamlab_town_bamboo(receiver_id,given_on);
create table public.foamlab_town_photo_invites (
 inviter_id uuid not null references auth.users(id) on delete cascade, invitee_id uuid not null references auth.users(id) on delete cascade,
 province text not null, created_at timestamptz not null default now(), primary key(inviter_id,invitee_id),check(inviter_id<>invitee_id)
);
create index town_photo_invitee on public.foamlab_town_photo_invites(invitee_id,created_at);
create table public.foamlab_town_photos (
 id uuid primary key default gen_random_uuid(), a_id uuid not null references auth.users(id) on delete cascade,
 b_id uuid not null references auth.users(id) on delete cascade, province text not null, look jsonb not null,
 taken_on date not null default (now() at time zone 'Asia/Shanghai')::date, hidden_by uuid[] not null default '{}',
 created_at timestamptz not null default now(),check(a_id<b_id),unique(a_id,b_id,taken_on)
);
create index town_photos_b on public.foamlab_town_photos(b_id,created_at desc);
create table public.foamlab_town_groups (
 group_key text not null, province text not null, display_name text not null check(char_length(display_name) between 1 and 40),
 aliases text[] not null default '{}',primary key(group_key,province)
);
create table public.foamlab_town_reports (
 id uuid primary key default gen_random_uuid(), mail_id uuid not null references public.foamlab_town_mail(id) on delete cascade,
 reporter_id uuid not null references auth.users(id) on delete cascade,reason text not null check(char_length(reason) between 1 and 200),
 status text not null default 'open' check(status in ('open','resolved')),created_at timestamptz not null default now(),unique(mail_id,reporter_id)
);
create index town_reports_reporter on public.foamlab_town_reports(reporter_id,created_at);
create index town_reports_status on public.foamlab_town_reports(status,created_at desc);
alter table public.foamlab_threads add column accepted_message_id uuid references public.foamlab_messages(id) on delete set null;
alter table public.foamlab_threads add column accepted_at timestamptz;
create index threads_accepted_message on public.foamlab_threads(accepted_message_id) where accepted_message_id is not null;
alter table public.foamlab_pets add column ride text not null default 'walk';
alter table public.foamlab_pets add column quickbar text[] not null default array['wave','highfive','smile','heart','thumb','give-bamboo'];
alter table public.foamlab_pets add column show_town_entry boolean not null default true;
alter table foamlab_private.pet_items drop constraint if exists pet_items_category_check;
alter table foamlab_private.pet_items add constraint pet_items_category_check check(category in ('form','outfit','action','decoration','duo','emote','ride','house','badge','title'));
alter table foamlab_private.pet_items add column requirement jsonb;
alter table foamlab_private.pet_items add column festival text;
do $$ declare t text; begin
 foreach t in array array['residents','presence','mail','bamboo','photo_invites','photos','groups','reports'] loop
 execute format('alter table public.foamlab_town_%I enable row level security',t);
 execute format('revoke all on public.foamlab_town_%I from anon,authenticated',t);
 end loop;
end $$;
grant select on public.foamlab_town_residents,public.foamlab_town_mail,public.foamlab_town_reports to authenticated;
grant select on public.foamlab_town_groups to anon,authenticated;
create policy town_resident_self on public.foamlab_town_residents for select to authenticated using(user_id=(select auth.uid()));
create policy town_mail_participant on public.foamlab_town_mail for select to authenticated using(owner_id=(select auth.uid()) or author_id=(select auth.uid()) or (select foamlab_private.has_role(array['admin','moderator'])));
create policy town_reports_mod on public.foamlab_town_reports for select to authenticated using((select foamlab_private.has_role(array['admin','moderator'])));
create policy town_groups_public on public.foamlab_town_groups for select to anon,authenticated using(true);

create function foamlab_private.town_provinces() returns text[] language sql immutable set search_path='' as $$
 select array['beijing','tianjin','hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','shanghai','jiangsu','zhejiang','anhui','fujian','jiangxi','shandong','henan','hubei','hunan','guangdong','guangxi','hainan','chongqing','sichuan','guizhou','yunnan','xizang','shaanxi','gansu','qinghai','ningxia','xinjiang','hongkong','macao','taiwan','overseas','plaza']::text[] $$;
create function foamlab_private.town_enabled() returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select value='"on"'::jsonb or (value='"admins"'::jsonb and foamlab_private.has_role(array['admin'])) from public.foamlab_settings where key='town_enabled'),false) $$;
create function foamlab_private.town_normalize(value text) returns text language sql immutable set search_path='' as $$
 select lower(regexp_replace(trim(normalize(coalesce(value,''),NFKC)),'\s+',' ','g')) $$;
create function foamlab_private.town_spot(province text) returns text language sql immutable set search_path='' as $$
 select case when province='hubei' then 'dam' when province in ('neimenggu','xinjiang','gansu') then 'wind'
 when province in ('shanghai','jiangsu','liaoning') then 'ship' when province in ('shaanxi','sichuan') then 'airfoil'
 when province='guangdong' then 'heat' else 'cavity' end $$;
create function foamlab_private.town_text(value text,max_chars integer default 200) returns text language plpgsql stable security definer set search_path='' as $$
 declare clean text:=trim(value); word text;
 begin
 if clean is null or char_length(clean) not between 1 and max_chars then raise exception '请输入 1–% 个字。',max_chars; end if;
 if clean ~* '(https?://|www\.|mailto:|[a-z0-9-]+\.(com|cn|net|org|io)(/|\y)|[<>])' then raise exception '请使用纯文字，留言中请勿放入网址。'; end if;
 for word in select jsonb_array_elements_text(s.value) from public.foamlab_settings s where key='town_banned_words' loop
 if word<>'' and position(lower(word) in lower(clean))>0 then raise exception '内容含有暂不支持发布的词语，请修改。'; end if;
 end loop;
 return clean;
 end $$;
create function foamlab_private.town_group(who uuid) returns text language sql stable security definer set search_path='' as $$
 with self as (select r.*,coalesce(g.group_key,r.group_key) canonical,coalesce(g.display_name,r.group_name) label
 from public.foamlab_town_residents r left join public.foamlab_town_groups g on g.province=r.province and (g.group_key=r.group_key or r.group_key=any(g.aliases)) where r.user_id=who and r.group_key<>'')
 select max(s.label) from self s join public.foamlab_town_residents r on r.province=s.province
 left join public.foamlab_town_groups g on g.province=r.province and (g.group_key=r.group_key or r.group_key=any(g.aliases))
 where coalesce(g.group_key,r.group_key)=s.canonical having count(distinct r.user_id)>=3 $$;
create function foamlab_private.pet_unlocked(who uuid) returns setof text language plpgsql stable security definer set search_path='' as $$
 declare i foamlab_private.pet_items; lvl integer; n integer; requirement_type text; need integer;
 begin
 select foamlab_private.pet_level(xp) into lvl from public.foamlab_pets where user_id=who;
 for i in select * from foamlab_private.pet_items where required_level<=coalesce(lvl,1) loop
 if i.festival is not null and not exists(select 1 from public.foamlab_pet_events where user_id=who and event_key='claim:'||i.id) then continue; end if;
 if i.requirement is not null then
 requirement_type:=i.requirement->>'type'; need:=coalesce((i.requirement->>'count')::integer,1); n:=0;
 case requirement_type
 when 'accepted' then select count(*) into n from public.foamlab_threads t join public.foamlab_messages m on m.id=t.accepted_message_id where m.author_id=who and m.status='visible' and t.status='resolved';
 when 'articles' then select count(*) into n from public.foamlab_content where author_id=who and kind in ('article','log') and status='published';
 when 'provinces' then select count(*) into n from public.foamlab_pet_events where user_id=who and kind='town_visit' and event_key not in ('visit:plaza','visit:overseas');
 when 'bamboo_received' then select count(*) into n from public.foamlab_town_bamboo where receiver_id=who;
 when 'badges' then select count(*) into n from public.foamlab_pet_events where user_id=who and kind='spot';
 when 'institute' then n:=case when foamlab_private.town_group(who) is not null then 1 else 0 end;
 when 'spot' then n:=case when exists(select 1 from public.foamlab_pet_events where user_id=who and event_key='spot:'||(i.requirement->>'id')) then 1 else 0 end;
 else n:=0;
 end case;
 if n<need then continue; end if;
 end if;
 return next i.id;
 end loop;
 end $$;
create function foamlab_private.town_unlocked(who uuid,item_id text) returns boolean language sql stable security definer set search_path='' as $$
 select item_id in (select foamlab_private.pet_unlocked(who)) $$;
insert into public.foamlab_settings(key,value) values
 ('town_enabled','"off"'),('town_banned_words','[]'),
 ('town_festivals','{"2026":{"national":["2026-10-01","2026-10-07"]}}'),
 ('town_options','{"interactions":true,"move_days":7,"mail_hour_limit":10,"max_online":30}') on conflict(key) do nothing;


insert into foamlab_private.pet_items(id,category,title,description,required_level,requirement,festival) values
('sailor','form','水手熊猫','海魂衫、水手帽，还有肩上的小海鸥。',22,null,null),
('pilot','form','飞行员熊猫','戴上飞行帽和风镜，围巾随风飘动。',26,null,null),
('polar','form','极地科考熊猫','穿好厚羽绒服，帽檐缀着小小的霜花。',30,null,null),
('beanie','outfit','毛线帽','帽顶有一颗软软的绒球。',9,null,null),
('overalls','outfit','背带裤','胸前口袋插着小扳手。',11,null,null),
('bowtie','outfit','小领结','合影时系上红色领结。',13,null,null),
('sunglasses','outfit','圆框墨镜','准备晒一会儿太阳。',16,null,null),
('title-helper','title','热心熊猫','累计3次回答被采纳',1,'{"type": "accepted", "count": 3}',null),
('title-author','title','作者','累计1篇已发表文章',1,'{"type": "articles", "count": 1}',null),
('title-traveler','title','串门达人','累计34个省份到访',1,'{"type": "provinces", "count": 34}',null),
('title-bamboo','title','竹林大户','累计100根收到的竹子',1,'{"type": "bamboo_received", "count": 100}',null),
('title-collector','title','景点收藏家','累计6枚景点纪念章',1,'{"type": "badges", "count": 6}',null),
('title-institute','title','研究所成员','累计1个研究所成员身份',1,'{"type": "institute", "count": 1}',null),
('stethoscope','outfit','听诊器','挂在脖子上，为问题找找原因。',1,'{"type": "accepted", "count": 3}',null),
('palette','outfit','画笔与调色板','爪子上沾着一点颜料。',1,'{"type": "articles", "count": 1}',null),
('scroll','outfit','地图卷轴','卷起的地图背在身后。',1,'{"type": "provinces", "count": 34}',null),
('basket','outfit','竹编背篓','背篓里探出几根竹子。',1,'{"type": "bamboo_received", "count": 100}',null),
('badge-card','outfit','研究所工牌','戴上所在研究所的小工牌。',1,'{"type": "institute", "count": 1}',null),
('lantern-red','outfit','红灯笼','春节里提一盏小灯笼。',1,null,'spring'),
('zongzi','outfit','粽子挂件','腰间挂一只小粽子。',1,null,'dragon-boat'),
('moon-lamp','outfit','月亮提灯','带着一轮暖暖的小月亮。',1,null,'mid-autumn'),
('typing','action','敲键盘','双爪在小键盘上轻快敲动。',5,null,null),
('kite','action','放风筝','牵着风筝，看它随着气流摆动。',7,null,null),
('bubbles','action','吹泡泡','泡泡慢慢升起，在空中散开。',9,null,null),
('photo','action','拍张照','举起相机，留下这一刻。',10,null,null),
('taichi','action','打太极','慢慢推手，脚下画出一个圆。',14,null,null),
('streamline','action','画流线','用爪子画出几条彩色流线。',16,null,null),
('firework','action','放烟花','头顶绽开一朵小烟花。',1,null,'spring,national'),
('highfive','duo','击掌','发起邀请，对方回应后一起完成。',1,null,null),
('give-bamboo','duo','递竹子','发起邀请，对方回应后一起完成。',1,null,null),
('hug','duo','拥抱','发起邀请，对方回应后一起完成。',3,null,null),
('selfie','duo','合影','发起邀请，对方回应后一起完成。',6,null,null),
('duet','duo','双人舞','发起邀请，对方回应后一起完成。',10,null,null),
('smile','emote','笑脸','在头顶显示三秒的小表情。',1,null,null),
('heart','emote','爱心','在头顶显示三秒的小表情。',1,null,null),
('thumb','emote','点赞','在头顶显示三秒的小表情。',1,null,null),
('question','emote','问号','在头顶显示三秒的小表情。',1,null,null),
('exclaim','emote','感叹号','在头顶显示三秒的小表情。',1,null,null),
('idea','emote','灯泡','在头顶显示三秒的小表情。',1,null,null),
('bamboo','emote','竹子','在头顶显示三秒的小表情。',1,null,null),
('zzz','emote','Zzz','在头顶显示三秒的小表情。',1,null,null),
('starry','emote','星星眼','在头顶显示三秒的小表情。',5,null,null),
('sweat','emote','冒汗','在头顶显示三秒的小表情。',10,null,null),
('confetti','emote','彩带','在头顶显示三秒的小表情。',15,null,null),
('fire','emote','小火苗','在头顶显示三秒的小表情。',20,null,null),
('walk','ride','走路','迈着轻快的小步。',1,null,null),
('jog','ride','小跑','耳朵一颠一颠地向前跑。',3,null,null),
('skateboard','ride','滑板','脚下的滑板带起几道风线。',8,null,null),
('bicycle','ride','自行车','车筐里放着一根竹子。',12,null,null),
('balloon','ride','气球飘行','抓着三只气球慢慢飘。',20,null,null),
('bamboo-hut','house','竹屋','竹色屋顶和小小的院子。',1,null,null),
('brick','house','砖瓦小屋','红瓦屋顶，烟囱缓缓冒烟。',5,null,null),
('mushroom','house','蘑菇屋','圆圆的屋顶缀着白色圆点。',10,null,null),
('lighthouse','house','灯塔小屋','屋顶的灯缓缓转动。',15,null,null),
('wind-tunnel','house','风洞实验室','风扇转起来，门前飘过几条流线。',20,null,null),
('badge-dam','badge','溃坝纪念章','首次到访溃坝景点后获得。',1,'{"type": "spot", "id": "dam"}',null),
('badge-wind','badge','风场纪念章','首次到访风场景点后获得。',1,'{"type": "spot", "id": "wind"}',null),
('badge-ship','badge','船舶纪念章','首次到访船舶景点后获得。',1,'{"type": "spot", "id": "ship"}',null),
('badge-airfoil','badge','翼型纪念章','首次到访翼型景点后获得。',1,'{"type": "spot", "id": "airfoil"}',null),
('badge-heat','badge','散热纪念章','首次到访散热景点后获得。',1,'{"type": "spot", "id": "heat"}',null),
('badge-cavity','badge','方腔纪念章','首次到访方腔景点后获得。',1,'{"type": "spot", "id": "cavity"}',null);

create function foamlab_private.town_card(who uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare p public.foamlab_pets; r public.foamlab_town_residents; lvl integer; unlocked text[]; title text;
 begin
 select * into r from public.foamlab_town_residents where user_id=who; if not found then return null; end if;
 select * into p from public.foamlab_pets where user_id=who;
 lvl:=foamlab_private.pet_level(coalesce(p.xp,0));
 select array_agg(id) into unlocked from foamlab_private.pet_unlocked(who) id;
 select i.title into title from foamlab_private.pet_items i where i.id=r.title_id and i.id=any(unlocked) and i.category='title';
 title:=coalesce(title,case when lvl>=30 then '极地科考员' when lvl>=26 then '飞行员' when lvl>=22 then '水手' when lvl>=18 then '航天探索者' when lvl>=12 then '研究员' when lvl>=6 then '见习工程师' else '小镇新邻居' end);
 return jsonb_build_object('user_id',who,'name',coalesce((select nullif(display_name,'') from public.foamlab_public_profiles where user_id=who),'熊猫邻居'),
 'pet_name',p.name,'level',lvl,'title',title,'province',r.province,
 'form',case when p.form=any(unlocked) then p.form else 'cub' end,
 'outfit',case when p.outfit=any(unlocked) then p.outfit else 'none' end,
 'decoration',case when p.decoration=any(unlocked) then p.decoration else 'no-decor' end,
 'ride',case when p.ride=any(unlocked) then p.ride else 'walk' end,
 'house_style',case when r.house_style=any(unlocked) then r.house_style else 'bamboo-hut' end,
 'group_name',r.group_name,'institute',foamlab_private.town_group(who),
 'bamboo',(select count(*) from public.foamlab_town_bamboo where receiver_id=who),
 'question',case when r.show_question then (select jsonb_build_object('id',t.id,'title',t.title) from public.foamlab_threads t where author_id=who and status='open' order by created_at desc limit 1) else null end);
 end $$;
create function foamlab_private.town_map() returns jsonb language plpgsql stable security definer set search_path='' as $$
 begin
 if not foamlab_private.town_enabled() then return jsonb_build_object('enabled',false,'provinces','[]'::jsonb); end if;
 return jsonb_build_object('enabled',true,'options',(select value from public.foamlab_settings where key='town_options'),'provinces',(select jsonb_agg(jsonb_build_object('id',x.province,
 'residents',case when x.n>=3 then x.n end,
 'online',case when x.n>=3 then (select count(*) from public.foamlab_town_presence p join public.foamlab_town_residents r using(user_id) where p.province=x.province and p.seen_at>now()-interval '2 minutes') end,
 'answers',case when x.n>=3 then (select count(*) from public.foamlab_messages m join public.foamlab_town_residents r on r.user_id=m.author_id join public.foamlab_threads t on t.id=m.thread_id where r.province=x.province and m.status='visible' and t.status in ('open','resolved') and m.created_at>=date_trunc('month',now())) end))
 from (select province,count(*) n from public.foamlab_town_residents group by province) x));
 end $$;
create function foamlab_private.town_street(province text,page integer,query text) returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare target text:=province; page_index integer:=greatest(0,least(coalesce(page,0),10000)); term text:=left(trim(coalesce(query,'')),40); residents jsonb; online jsonb; groups jsonb;
 begin
 if not foamlab_private.town_enabled() then return jsonb_build_object('enabled',false); end if;
 if not target=any(foamlab_private.town_provinces()) then raise exception '请选择一个小镇。'; end if;
 select coalesce(jsonb_agg(foamlab_private.town_card(r.user_id) order by r.created_at,r.user_id),'[]') into residents from
 (select r.user_id,r.created_at from public.foamlab_town_residents r left join public.foamlab_public_profiles p using(user_id)
 where r.province=target and (term='' or position(lower(term) in lower(coalesce(p.display_name,'')||' '||r.group_name))>0)
 order by r.created_at,r.user_id offset page_index*10 limit 10) r;
 -- Visitors see houses; only GitHub participants receive live resident cards.
 if auth.uid() is not null and foamlab_private.has_github_identity() and not foamlab_private.has_role(array['blocked']) then
 select coalesce(jsonb_agg(foamlab_private.town_card(p.user_id)),'[]') into online from
 (select p.user_id from public.foamlab_town_presence p join public.foamlab_town_residents r using(user_id) where p.province=target and p.seen_at>now()-interval '2 minutes' and not exists(select 1 from public.foamlab_roles b where b.user_id=p.user_id and b.role='blocked') order by p.seen_at desc limit 30) p;
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('name',s.name,'count',s.n)),'[]') into groups from
 (select foamlab_private.town_group(r.user_id) name,count(*) n from public.foamlab_town_residents r where r.province=target and r.group_key<>'' group by 1 having foamlab_private.town_group((array_agg(r.user_id))[1]) is not null) s;
 return jsonb_build_object('enabled',true,'province',target,'page',page_index,'residents',residents,'online',coalesce(online,'[]'), 'groups',groups,
 'total',(select count(*) from public.foamlab_town_residents r left join public.foamlab_public_profiles p using(user_id) where r.province=target and (term='' or position(lower(term) in lower(coalesce(p.display_name,'')||' '||r.group_name))>0)),
 'questions',(select coalesce(jsonb_agg(to_jsonb(q)),'[]') from (select t.id,t.title from public.foamlab_threads t join public.foamlab_town_residents r on r.user_id=t.author_id where r.province=target and r.show_question and t.status='open' order by t.created_at desc limit 5) q),
 'articles',(select coalesce(jsonb_agg(to_jsonb(a)),'[]') from (select c.id,c.slug,c.title from public.foamlab_content c join public.foamlab_town_residents r on r.user_id=c.author_id where r.province=target and c.kind in ('article','log') and c.status='published' order by c.published_at desc nulls last limit 3) a),
 'spot',foamlab_private.town_spot(target));
 end $$;
create function foamlab_private.town_house(owner uuid,page integer,photo_page integer) returns jsonb language plpgsql stable security definer set search_path='' as $$
 declare r public.foamlab_town_residents; mine boolean:=owner=auth.uid();
 begin
 if not foamlab_private.town_enabled() then return jsonb_build_object('enabled',false); end if;
 select * into r from public.foamlab_town_residents where user_id=owner; if not found then return null; end if;
 return jsonb_build_object('card',foamlab_private.town_card(owner),'mailbox_open',r.mailbox_open,'mine',coalesce(mine,false),
 'badges',(select coalesce(jsonb_agg(i.id),'[]') from foamlab_private.pet_items i where category='badge' and i.id in (select foamlab_private.pet_unlocked(owner))),
 'photos',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from (select id,look,province,created_at from public.foamlab_town_photos where owner in(a_id,b_id) and not owner=any(hidden_by) order by created_at desc offset greatest(0,least(photo_page,10000))*6 limit 6) p),
 'photo_total',(select count(*) from public.foamlab_town_photos where owner in(a_id,b_id) and not owner=any(hidden_by)),
 'mail_total',case when mine or r.mailbox_open then (select count(*) from public.foamlab_town_mail where owner_id=owner and status='visible') else 0 end,
 'mail',case when mine or r.mailbox_open then (select coalesce(jsonb_agg(to_jsonb(m)),'[]') from
 (select m.id,m.author_id,m.body,m.created_at,m.read_at,coalesce(p.display_name,'熊猫邻居') author_name from public.foamlab_town_mail m left join public.foamlab_public_profiles p on p.user_id=m.author_id where m.owner_id=owner and m.status='visible' order by m.created_at desc offset greatest(0,least(page,10000))*20 limit 20) m) else '[]'::jsonb end,
 'given_today',exists(select 1 from public.foamlab_town_bamboo where giver_id=auth.uid() and receiver_id=owner and given_on=(now() at time zone 'Asia/Shanghai')::date));
 end $$;
create function public.foamlab_town_map() returns jsonb language sql stable set search_path='' as $$ select foamlab_private.town_map() $$;
create function public.foamlab_town_street(province text,page integer default 0,query text default '') returns jsonb language sql stable set search_path='' as $$ select foamlab_private.town_street(province,page,query) $$;
create function public.foamlab_town_house(user_id uuid,page integer default 0,photo_page integer default 0) returns jsonb language sql stable set search_path='' as $$ select foamlab_private.town_house(user_id,page,photo_page) $$;


create function foamlab_private.town_state(who uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('enabled',foamlab_private.town_enabled(),'resident',(select to_jsonb(r) from public.foamlab_town_residents r where user_id=who),
 'card',foamlab_private.town_card(who),'unread',(select count(*) from public.foamlab_town_mail where owner_id=who and status='visible' and read_at is null),
 'unlocked',(select coalesce(jsonb_agg(x),'[]') from foamlab_private.pet_unlocked(who) x),
 'show_entry',coalesce((select show_town_entry from public.foamlab_pets where user_id=who),true),
 'options',(select value from public.foamlab_settings where key='town_options'),
 'move_after',(select created_at+make_interval(days=>coalesce((select (value->>'move_days')::integer from public.foamlab_settings where key='town_options'),7)) from public.foamlab_pet_events where user_id=who and event_key='town:home'),
 'invitations',(select coalesce(jsonb_agg(jsonb_build_object('inviter_id',i.inviter_id,'name',p.display_name,'expires_at',i.created_at+interval '60 seconds')),'[]') from public.foamlab_town_photo_invites i left join public.foamlab_public_profiles p on p.user_id=i.inviter_id where i.invitee_id=who and i.created_at>now()-interval '60 seconds')) $$;
create function foamlab_private.town_api(operation text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare who uuid:=auth.uid(); r public.foamlab_town_residents; presence public.foamlab_town_presence;
 target uuid; destination text; item text; entry foamlab_private.pet_items; affected integer; award integer:=0;
 today date:=(now() at time zone 'Asia/Shanghai')::date; move_days integer:=7; mail_limit integer:=10;
 value_text text; message_id uuid; result jsonb; evt jsonb; expires timestamptz; event_time double precision:=extract(epoch from now());
 begin
 if who is null or not foamlab_private.has_github_identity() or foamlab_private.has_role(array['blocked']) then raise exception using errcode='42501',message='请使用 GitHub 登录后进入小镇。'; end if;
 if not foamlab_private.town_enabled() then raise exception '熊猫小镇暂未开放。'; end if;
 payload:=coalesce(payload,'{}');
 if jsonb_typeof(payload)<>'object' then raise exception '操作参数无效。'; end if;
 select * into r from public.foamlab_town_residents where user_id=who for update;
 select greatest(1,least(30,coalesce((value->>'move_days')::integer,7))), greatest(1,least(30,coalesce((value->>'mail_hour_limit')::integer,10))) into move_days,mail_limit from public.foamlab_settings where key='town_options';
 if operation='state' then return foamlab_private.town_state(who); end if;
 if operation='join' then
 if r.user_id is not null then return foamlab_private.town_state(who); end if;
 destination:=payload->>'province';
 if destination is null or not destination=any(foamlab_private.town_provinces()) then raise exception '请选择居住地。'; end if;
 if exists(select 1 from public.foamlab_pet_events where user_id=who and event_key='town:home' and created_at>now()-make_interval(days=>move_days) and fingerprint<>destination) then raise exception '上次搬家后的 % 天内，可重新入住原来的小镇。',move_days; end if;
 perform foamlab_private.pet_api('state','{}');
 insert into public.foamlab_town_residents(user_id,province,visited_provinces,visited_spots)
 values(who,destination,array(select substr(event_key,7) from public.foamlab_pet_events where user_id=who and kind='town_visit'),array(select substr(event_key,6) from public.foamlab_pet_events where user_id=who and kind='spot'));
 insert into public.foamlab_pet_events(user_id,event_key,kind,points,fingerprint) values(who,'town:home','town_home',0,destination) on conflict(user_id,event_key) do nothing;
 elsif operation='settings' then
 if payload ? 'show_entry' then update public.foamlab_pets set show_town_entry=(payload->>'show_entry')::boolean where user_id=who; end if;
 if r.user_id is null then return foamlab_private.town_state(who); end if;
 if payload ? 'group_name' then value_text:=trim(payload->>'group_name'); if value_text<>'' then value_text:=foamlab_private.town_text(value_text,40); end if; end if;
 if payload ? 'house_style' then
 item:=payload->>'house_style'; if not exists(select 1 from foamlab_private.pet_items where id=item and category='house') or not foamlab_private.town_unlocked(who,item) then raise exception '这座房屋尚未解锁。'; end if;
 end if;
 if nullif(payload->>'title_id','') is not null and (not exists(select 1 from foamlab_private.pet_items where id=payload->>'title_id' and category='title') or not foamlab_private.town_unlocked(who,payload->>'title_id')) then raise exception '这个称号尚未解锁。'; end if;
 update public.foamlab_town_residents set
 mailbox_open=coalesce((payload->>'mailbox_open')::boolean,mailbox_open),show_question=coalesce((payload->>'show_question')::boolean,show_question),
 walk_to_buildings=coalesce((payload->>'walk_to_buildings')::boolean,walk_to_buildings),show_entry=coalesce((payload->>'show_entry')::boolean,show_entry),
 group_name=case when payload ? 'group_name' then coalesce(value_text,'') else group_name end,
 group_key=case when payload ? 'group_name' then foamlab_private.town_normalize(value_text) else group_key end,
 house_style=coalesce(payload->>'house_style',house_style),title_id=case when payload ? 'title_id' then nullif(payload->>'title_id','') else title_id end where user_id=who;
 elsif r.user_id is null then raise exception '先选择一个小镇入住。';
 elsif operation='move' then
 destination:=payload->>'province'; if destination is null or not destination=any(foamlab_private.town_provinces()) then raise exception '请选择居住地。'; end if;
 if destination=r.province then return foamlab_private.town_state(who); end if;
 select created_at+make_interval(days=>move_days) into expires from public.foamlab_pet_events where user_id=who and event_key='town:home';
 if expires>now() then raise exception '下次可搬家时间：%',to_char(expires at time zone 'Asia/Shanghai','YYYY-MM-DD HH24:MI'); end if;
 update public.foamlab_town_residents set province=destination,moved_at=now() where user_id=who;
 update public.foamlab_pet_events set created_at=now(),fingerprint=destination where user_id=who and event_key='town:home';
 delete from public.foamlab_town_presence where user_id=who;
 elsif operation in ('enter','heartbeat') then
 destination:=payload->>'province'; if destination is null or not destination=any(foamlab_private.town_provinces()) then raise exception '请选择一个小镇。'; end if;
 select * into presence from public.foamlab_town_presence where user_id=who for update;
 if operation='enter' and presence.user_id is not null and presence.province<>destination and presence.entered_at>now()-interval '10 seconds' then raise exception '稍等几秒，再去下一个小镇。'; end if;
 if operation='heartbeat' and presence.user_id is not null and presence.province<>destination then raise exception '请先进入这条街道。'; end if;
 if operation='enter' or presence.user_id is null or presence.seen_at<=now()-interval '45 seconds' then
 insert into public.foamlab_town_presence(user_id,province) values(who,destination) on conflict(user_id) do update set province=excluded.province,seen_at=now(),entered_at=case when foamlab_town_presence.province<>excluded.province then now() else foamlab_town_presence.entered_at end;
 update public.foamlab_town_residents set last_seen_at=now(),visited_provinces=case when destination=any(visited_provinces) then visited_provinces else array_append(visited_provinces,destination) end where user_id=who;
 perform foamlab_private.pet_award(who,'town_visit','visit:'||destination,0,0);
 end if;
 return jsonb_build_object('online',true,'invitations',foamlab_private.town_state(who)->'invitations');
 elsif operation='disconnect' then delete from public.foamlab_town_presence where user_id=who; return jsonb_build_object('online',false);
 elsif operation='visit_spot' then
 select * into presence from public.foamlab_town_presence where user_id=who and seen_at>now()-interval '2 minutes';
 if not found then raise exception '请先进入街道。'; end if;
 item:=foamlab_private.town_spot(presence.province);
 award:=foamlab_private.pet_award(who,'spot','spot:'||item,5,0);
 update public.foamlab_town_residents set visited_spots=case when item=any(visited_spots) then visited_spots else array_append(visited_spots,item) end where user_id=who;
 return jsonb_build_object('spot',item,'awarded',award);
 elsif operation='give_bamboo' then
 target:=(payload->>'user_id')::uuid;
 if target=who or exists(select 1 from public.foamlab_roles where user_id=target and role='blocked') or not exists(select 1 from public.foamlab_town_residents where user_id=target) then raise exception '请选择另一位小镇居民。'; end if;
 insert into public.foamlab_town_bamboo(giver_id,receiver_id) values(who,target) on conflict do nothing; get diagnostics affected=row_count;
 if affected=1 then award:=foamlab_private.pet_award(target,'bamboo','bamboo:'||who||':'||today,2,5); end if;
 return jsonb_build_object('given',affected=1,'awarded',award);
 elsif operation='mail_send' then
 target:=(payload->>'user_id')::uuid;
 if not exists(select 1 from public.foamlab_town_residents where user_id=target and mailbox_open) then raise exception '这位邻居暂未开启留言板。'; end if;
 if (select count(*) from public.foamlab_town_mail where author_id=who and created_at>now()-interval '1 hour')>=mail_limit then raise exception '一小时最多发送 % 条留言，请稍后再来。',mail_limit; end if;
 value_text:=foamlab_private.town_text(payload->>'body');
 insert into public.foamlab_town_mail(owner_id,author_id,body) values(target,who,value_text) returning id into message_id;
 return jsonb_build_object('id',message_id);
 elsif operation='mail_delete' then
 update public.foamlab_town_mail set status='deleted',updated_at=now() where id=(payload->>'id')::uuid and (owner_id=who or author_id=who); get diagnostics affected=row_count;
 if affected=0 then raise exception '找不到这条留言。'; end if;
 elsif operation='mail_read' then update public.foamlab_town_mail set read_at=now() where owner_id=who and read_at is null;
 elsif operation='report' then
 message_id:=(payload->>'id')::uuid;
 if not exists(select 1 from public.foamlab_town_mail m join public.foamlab_town_residents r on r.user_id=m.owner_id where m.id=message_id and m.status='visible' and (r.mailbox_open or m.owner_id=who)) then raise exception '找不到这条留言。'; end if;
 insert into public.foamlab_town_reports(mail_id,reporter_id,reason) values(message_id,who,foamlab_private.town_text(payload->>'reason')) on conflict do nothing;
 elsif operation in ('photo_invite','photo_accept') then
 target:=(payload->>'user_id')::uuid;
 if target=who or exists(select 1 from public.foamlab_roles where user_id=target and role='blocked') then raise exception '请选择另一位居民。'; end if;
 select * into presence from public.foamlab_town_presence where user_id=who and seen_at>now()-interval '2 minutes';
 if not found or not exists(select 1 from public.foamlab_town_presence where user_id=target and province=presence.province and seen_at>now()-interval '2 minutes') then raise exception '双方在线并位于同一条街道时可以合影。'; end if;
 if operation='photo_invite' then
 if (select count(*) from jsonb_array_elements(presence.recent_actions) x where (x->>'t')::double precision>event_time-10)>=3 then raise exception '邀请太快啦，稍等几秒。'; end if;
 if not foamlab_private.town_unlocked(who,'selfie') then raise exception '合影在 Lv.6 解锁。'; end if;
 if exists(select 1 from public.foamlab_town_photo_invites where inviter_id=who and invitee_id=target and created_at>now()-interval '20 seconds') then raise exception '邀请已送达，请等待回应。'; end if;
 update public.foamlab_town_presence set recent_actions=coalesce((select jsonb_agg(x) from jsonb_array_elements(recent_actions) x where (x->>'t')::double precision>event_time-60),'[]')||jsonb_build_array(jsonb_build_object('t',event_time,'target',target)) where user_id=who;
 insert into public.foamlab_town_photo_invites(inviter_id,invitee_id,province) values(who,target,presence.province) on conflict(inviter_id,invitee_id) do update set province=excluded.province,created_at=now();
 evt:=jsonb_build_object('type','photo-invite','from',who,'to',target,'nonce',substr(md5(random()::text),1,8));
 perform realtime.send(evt,'town','town:'||presence.province,true);
 return jsonb_build_object('sent',true);
 else
 perform 1 from public.foamlab_town_photo_invites where inviter_id=target and invitee_id=who and province=presence.province and created_at>now()-interval '60 seconds' for update;
 if not found then raise exception '邀请已过期，请重新发起。'; end if;
 insert into public.foamlab_town_photos(a_id,b_id,province,look) values(least(who,target),greatest(who,target),presence.province,jsonb_build_array(foamlab_private.town_card(who)-array['question','bamboo','group_name','institute'],foamlab_private.town_card(target)-array['question','bamboo','group_name','institute'])) on conflict(a_id,b_id,taken_on) do nothing;
 delete from public.foamlab_town_photo_invites where inviter_id=target and invitee_id=who;
 perform realtime.send(jsonb_build_object('type','duo-accept','action','selfie','from',who,'to',target,'nonce',substr(md5(random()::text),1,8)),'town','town:'||presence.province,true);
 return jsonb_build_object('saved',true);
 end if;
 elsif operation='photo_decline' then delete from public.foamlab_town_photo_invites where invitee_id=who and inviter_id=(payload->>'user_id')::uuid;
 elsif operation='photo_hide' then update public.foamlab_town_photos set hidden_by=array_append(hidden_by,who) where id=(payload->>'id')::uuid and who in(a_id,b_id) and not who=any(hidden_by);
 elsif operation='leave' then
 delete from public.foamlab_town_presence where user_id=who;
 delete from public.foamlab_town_photo_invites where inviter_id=who or invitee_id=who;
 delete from public.foamlab_town_residents where user_id=who;
 else raise exception '未知的小镇操作。';
 end if;
 return foamlab_private.town_state(who);
 end $$;
create function foamlab_private.town_action(payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare who uuid:=auth.uid(); p public.foamlab_town_presence; target uuid; item foamlab_private.pet_items;
 typ text:=payload->>'type'; action_id text:=payload->>'action'; epoch double precision:=extract(epoch from now()); evt jsonb; recent jsonb; invite jsonb;
 begin
 if who is null or not foamlab_private.has_github_identity() or foamlab_private.has_role(array['blocked']) or not foamlab_private.town_enabled() then raise exception using errcode='42501',message='请登录后进入小镇。'; end if;
 if exists(select 1 from public.foamlab_settings where key='town_options' and value->>'interactions'='false') then raise exception '街道互动暂时关闭。'; end if;
 select * into p from public.foamlab_town_presence where user_id=who and seen_at>now()-interval '2 minutes' for update;
 if not found or not exists(select 1 from public.foamlab_town_residents where user_id=who) then raise exception '请先进入街道。'; end if;
 select coalesce(jsonb_agg(x),'[]') into recent from jsonb_array_elements(p.recent_actions) x where (x->>'t')::double precision>epoch-60;
 if (select count(*) from jsonb_array_elements(recent) x where (x->>'t')::double precision>epoch-10)>=3 then raise exception '动作太快啦，稍等几秒。'; end if;
 if typ not in ('act','emote','duo-invite','duo-accept','duo-decline') or typ is null then raise exception '动作类型无效。'; end if;
 select * into item from foamlab_private.pet_items where id=action_id;
 if typ in ('act','emote','duo-invite') and (item.id is null or not foamlab_private.town_unlocked(who,action_id) or (typ='act' and item.category<>'action') or (typ='emote' and item.category<>'emote') or (typ='duo-invite' and (item.category<>'duo' or item.id in ('selfie','give-bamboo')))) then raise exception '这个动作尚未解锁或请使用专用互动按钮。'; end if;
 if typ like 'duo-%' then
 target:=(payload->>'user_id')::uuid;
 if target=who or not exists(select 1 from public.foamlab_town_presence where user_id=target and province=p.province and seen_at>now()-interval '2 minutes') then raise exception '这位邻居已离开街道。'; end if;
 if typ='duo-invite' then
 if (select count(*) from jsonb_array_elements(recent) x where x->>'target'=target::text)>=3 then raise exception '请稍后再邀请这位邻居。'; end if;
 invite:=jsonb_build_object('to',target,'action',action_id,'t',epoch);
 update public.foamlab_town_presence set invitations=coalesce((select jsonb_agg(x) from jsonb_array_elements(invitations) x where (x->>'t')::double precision>epoch-15 and x->>'to'<>target::text),'[]')||jsonb_build_array(invite) where user_id=who;
 else
 select x into invite from public.foamlab_town_presence s cross join lateral jsonb_array_elements(s.invitations) x where s.user_id=target and x->>'to'=who::text and x->>'action'=action_id and (x->>'t')::double precision>epoch-15 limit 1;
 if invite is null then raise exception '邀请已过期，请重新发起。'; end if;
 -- The recipient's recent event records reject replay while the invitation is live.
 if exists(select 1 from jsonb_array_elements(recent) x where x->>'invite'=md5(invite::text)) then raise exception '这个邀请已处理。'; end if;
 end if;
 end if;
 recent:=recent||jsonb_build_array(jsonb_build_object('t',epoch,'target',target,'invite',case when typ in ('duo-accept','duo-decline') then md5(invite::text) end));
 update public.foamlab_town_presence set recent_actions=recent where user_id=who;
 evt:=jsonb_build_object('type',typ,'from',who,'to',target,'action',action_id,'nonce',substr(md5(random()::text),1,8));
 perform realtime.send(evt,'town','town:'||p.province,true);
 return evt;
 end $$;
create function public.foamlab_town(operation text default 'state',payload jsonb default '{}') returns jsonb language sql set search_path='' as $$ select foamlab_private.town_api(operation,payload) $$;
create function public.foamlab_town_action(payload jsonb) returns jsonb language sql set search_path='' as $$ select foamlab_private.town_action(payload) $$;


-- The accepted-answer award is independent from the normal reply award.
create function foamlab_private.town_revoke_accepted(message_id uuid) returns void language plpgsql security definer set search_path='' as $$
 declare who uuid;
 begin
 select author_id into who from public.foamlab_messages where id=message_id;
 if who is null then return; end if;
 perform 1 from public.foamlab_pets where user_id=who for update;
 update public.foamlab_pet_events set points=0 where user_id=who and event_key='accepted:'||message_id;
 update public.foamlab_pets set xp=(select coalesce(sum(points),0) from public.foamlab_pet_events where user_id=who) where user_id=who;
 end $$;
create function foamlab_private.town_accept_guard() returns trigger language plpgsql set search_path='' as $$
 begin
 if current_user='authenticated' and (new.accepted_message_id is distinct from old.accepted_message_id or new.accepted_at is distinct from old.accepted_at) then raise exception '请使用采纳回答操作。'; end if;
 return new;
 end $$;
create trigger a_town_accept_guard before update on public.foamlab_threads for each row execute function foamlab_private.town_accept_guard();
create function foamlab_private.town_accept_cleanup() returns trigger language plpgsql security definer set search_path='' as $$
 begin
 if tg_table_name='foamlab_threads' then
 if tg_op='DELETE' then perform foamlab_private.town_revoke_accepted(old.accepted_message_id); return old; end if;
 if new.status<>'resolved' then new.accepted_message_id:=null; new.accepted_at:=null; end if;
 if old.accepted_message_id is distinct from new.accepted_message_id then perform foamlab_private.town_revoke_accepted(old.accepted_message_id); end if;
 return new;
 else
 if tg_op='DELETE' or new.status='hidden' then
 update public.foamlab_threads set accepted_message_id=null,accepted_at=null,status=case when status='resolved' then 'open' else status end where accepted_message_id=old.id;
 end if;
 if tg_op='DELETE' then return old; else return new; end if;
 end if;
 end $$;
create trigger town_accept_cleanup before update or delete on public.foamlab_threads for each row execute function foamlab_private.town_accept_cleanup();
create trigger town_accept_cleanup before update or delete on public.foamlab_messages for each row execute function foamlab_private.town_accept_cleanup();
create function foamlab_private.accept_answer(thread_id uuid,message_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
 declare who uuid:=auth.uid(); t public.foamlab_threads; m public.foamlab_messages; awarded integer:=0;
 begin
 if who is null or not foamlab_private.has_github_identity() or foamlab_private.has_role(array['blocked']) then raise exception using errcode='42501',message='请使用 GitHub 登录后操作。'; end if;
 select * into t from public.foamlab_threads where id=thread_id for update;
 if not found or t.status not in ('open','resolved') or (t.author_id<>who and not foamlab_private.has_role(array['admin','moderator'])) then raise exception using errcode='42501',message='由提问者或管理员采纳回答。'; end if;
 if message_id is not null then
 select * into m from public.foamlab_messages where id=message_id and foamlab_messages.thread_id=t.id and status='visible';
 if not found or m.author_id=t.author_id then raise exception '请选择其他用户在本问题下的有效回答。'; end if;
 end if;
 if t.accepted_message_id is not distinct from message_id then return jsonb_build_object('accepted_message_id',message_id,'awarded',0); end if;
 update public.foamlab_threads set accepted_message_id=message_id,accepted_at=case when message_id is not null then now() end,status=case when message_id is null then 'open' else 'resolved' end where id=t.id;
 if message_id is not null then awarded:=foamlab_private.pet_award(m.author_id,'accepted','accepted:'||m.id,20,3,m.id,t.id); end if;
 return jsonb_build_object('accepted_message_id',message_id,'awarded',awarded);
 end $$;
create function public.foamlab_accept_answer(thread_id uuid,message_id uuid default null) returns jsonb language sql set search_path='' as $$ select foamlab_private.accept_answer(thread_id,message_id) $$;


create function foamlab_private.town_admin(operation text,payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
 declare typ text:=coalesce(payload->>'type','reports'); p integer:=greatest(0,least(coalesce((payload->>'page')::integer,0),10000));
 term text:=left(trim(coalesce(payload->>'query','')),100); filter_status text:=coalesce(payload->>'status',''); sort_order text:=coalesce(payload->>'sort','newest');
 items jsonb; n bigint; gkey text; province_id text; group_label text; alias_list text[]; setting_key text; setting_value jsonb; festival_name text; festival_dates jsonb;
 begin
 if auth.uid() is null or not foamlab_private.has_github_identity() or not foamlab_private.has_role(array['admin','moderator']) or foamlab_private.has_role(array['blocked']) then raise exception using errcode='42501',message='需要管理员或社区管理员权限。'; end if;
 if operation='list' then
 if typ='reports' then
 with rows as (select r.id,r.mail_id,r.reason,r.status,r.created_at,m.body,m.status mail_status,m.owner_id,m.author_id,coalesce(pr.display_name,'熊猫邻居') reporter from public.foamlab_town_reports r join public.foamlab_town_mail m on m.id=r.mail_id left join public.foamlab_public_profiles pr on pr.user_id=r.reporter_id where (filter_status='' or r.status=filter_status) and (term='' or position(lower(term) in lower(m.body||r.reason))>0))
 select (select count(*) from rows),coalesce(jsonb_agg(to_jsonb(s)),'[]') into n,items from (select * from rows order by case when sort_order='oldest' then created_at end asc,created_at desc,id offset p*20 limit 20) s;
 elsif typ='mail' then
 with rows as (select m.*,coalesce(pr.display_name,'熊猫邻居') author_name from public.foamlab_town_mail m left join public.foamlab_public_profiles pr on pr.user_id=m.author_id where (filter_status='' or m.status=filter_status) and (term='' or position(lower(term) in lower(m.body||coalesce(pr.display_name,'')))>0))
 select (select count(*) from rows),coalesce(jsonb_agg(to_jsonb(s)),'[]') into n,items from (select * from rows order by case when sort_order='oldest' then created_at end asc,created_at desc,id offset p*20 limit 20) s;
 elsif typ='groups' then
 with rows as (select * from public.foamlab_town_groups where term='' or position(lower(term) in lower(display_name||' '||province))>0)
 select (select count(*) from rows),coalesce(jsonb_agg(to_jsonb(s)),'[]') into n,items from (select * from rows order by province,display_name offset p*20 limit 20) s;
 elsif typ='residents' then
 with rows as (select r.*,coalesce(pr.display_name,'熊猫邻居') name from public.foamlab_town_residents r left join public.foamlab_public_profiles pr using(user_id) where term='' or position(lower(term) in lower(coalesce(pr.display_name,'')||' '||r.group_name))>0)
 select (select count(*) from rows),coalesce(jsonb_agg(to_jsonb(s)),'[]') into n,items from (select user_id,name,province,group_name,created_at,last_seen_at from rows order by case when sort_order='name' then name end,case when sort_order='oldest' then created_at end asc,created_at desc,user_id offset p*20 limit 20) s;
 else raise exception '未知的管理列表。'; end if;
 return jsonb_build_object('items',items,'total',n,'page',p);
 elsif operation in ('hide','restore','resolve') then
 if operation='resolve' then update public.foamlab_town_reports set status='resolved' where id=(payload->>'id')::uuid;
 else update public.foamlab_town_mail set status=case when operation='hide' then 'hidden' else 'visible' end,updated_at=now() where id=(payload->>'id')::uuid and status<>'deleted'; end if;
 elsif operation in ('group_save','group_delete','settings') then
 if not foamlab_private.has_role(array['admin']) then raise exception using errcode='42501',message='此项需要网站管理员权限。'; end if;
 if operation='settings' then
 for setting_key,setting_value in select key,value from jsonb_each(payload) loop
 if setting_key='town_enabled' and setting_value in ('"off"'::jsonb,'"admins"'::jsonb,'"on"'::jsonb) then null;
 elsif setting_key='town_banned_words' and jsonb_typeof(setting_value)='array' and jsonb_array_length(setting_value)<=200 then
 if exists(select 1 from jsonb_array_elements(setting_value) v where jsonb_typeof(v)<>'string' or char_length(v#>>'{}')>40) then raise exception '过滤词每项最多 40 个字。'; end if;
 elsif setting_key='town_options' and jsonb_typeof(setting_value)='object' then
 if not setting_value ?& array['move_days','mail_hour_limit','max_online','interactions'] then raise exception '请填写全部小镇设置。'; end if;
 if (setting_value->>'move_days')::integer not between 1 and 30 or (setting_value->>'mail_hour_limit')::integer not between 1 and 30 or (setting_value->>'max_online')::integer not between 1 and 30 or jsonb_typeof(setting_value->'interactions')<>'boolean' then raise exception '设置范围为 1–30；互动开关使用布尔值。'; end if;
 elsif setting_key='town_festivals' and jsonb_typeof(setting_value)='object' and length(setting_value::text)<20000 then
 for festival_name,festival_dates in select event.key,event.value from jsonb_each(setting_value) y cross join lateral jsonb_each(y.value) event loop
 if jsonb_typeof(festival_dates)<>'array' or jsonb_array_length(festival_dates)<>2 or festival_dates->>0 is null or festival_dates->>1 is null or (festival_dates->>0)::date>(festival_dates->>1)::date then raise exception '请填写有效的活动起止日期。'; end if;
 end loop;
 else raise exception '设置项无效：%',setting_key;
 end if;
 insert into public.foamlab_settings(key,value) values(setting_key,setting_value) on conflict(key) do update set value=excluded.value,updated_at=now();
 end loop;
 else
 province_id:=payload->>'province';gkey:=foamlab_private.town_normalize(payload->>'group_key');
 if not province_id=any(foamlab_private.town_provinces()) or gkey='' then raise exception '请选择省份并填写名称。'; end if;
 if operation='group_delete' then delete from public.foamlab_town_groups where province=province_id and group_key=gkey;
 else
 group_label:=foamlab_private.town_text(payload->>'display_name',40);
 select coalesce(array_agg(distinct foamlab_private.town_normalize(v)) filter(where trim(v)<>''),'{}') into alias_list from jsonb_array_elements_text(coalesce(payload->'aliases','[]')) v;
 if cardinality(alias_list)>40 then raise exception '每个研究所最多 40 个别名。'; end if;
 if exists(select 1 from public.foamlab_town_groups g where g.province=province_id and g.group_key<>gkey and (g.group_key=any(alias_list) or gkey=any(g.aliases) or g.aliases&&alias_list)) then raise exception '别名已属于另一个研究所，请先调整原记录。'; end if;
 insert into public.foamlab_town_groups(group_key,province,display_name,aliases) values(gkey,province_id,group_label,alias_list) on conflict(group_key,province) do update set display_name=excluded.display_name,aliases=excluded.aliases;
 end if;
 end if;
 else raise exception '未知的管理操作。'; end if;
 return jsonb_build_object('saved',true);
 end $$;
create function public.foamlab_town_admin(operation text default 'list',payload jsonb default '{}') returns jsonb language sql set search_path='' as $$ select foamlab_private.town_admin(operation,payload) $$;


CREATE OR REPLACE FUNCTION foamlab_private.pet_api(operation text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare who uuid:=auth.uid(); p public.foamlab_pets; lvl integer; item foamlab_private.pet_items; awarded integer:=0; lesson uuid; result jsonb; unlocked text[]; favorite text; festival_item foamlab_private.pet_items; festival_key text; calendar jsonb; dates jsonb;
begin
 if who is null or not foamlab_private.has_github_identity() or not exists(select 1 from auth.users where id=who) then raise exception using errcode='42501',message='请先使用 GitHub 登录。'; end if;
 if foamlab_private.has_role(array['blocked']) then raise exception using errcode='42501',message='此账号的成长功能暂时停用。'; end if;
 if operation not in ('state','checkin','equip','settings') or operation is null then raise exception '未知操作。'; end if;
 insert into public.foamlab_pets(user_id) values(who) on conflict do nothing;
 select * into p from public.foamlab_pets where user_id=who for update;
 -- Permanent claims are recorded only inside the configured festival window.
 select value->to_char(now() at time zone 'Asia/Shanghai','YYYY') into calendar from public.foamlab_settings where key='town_festivals';
 for festival_item in select * from foamlab_private.pet_items where festival is not null loop
 foreach festival_key in array string_to_array(festival_item.festival,',') loop
 dates:=calendar->festival_key;
 if jsonb_typeof(dates)='array' and jsonb_array_length(dates)=2 then
 begin
 if (now() at time zone 'Asia/Shanghai')::date between (dates->>0)::date and (dates->>1)::date then
 perform foamlab_private.pet_award(who,'festival','claim:'||festival_item.id,0,0);
 end if;
 exception when invalid_datetime_format or datetime_field_overflow then null;
 end;
 end if;
 end loop;
 end loop;
 -- Import existing completed lessons once. The unique ledger key also handles undo/redo.
 for lesson in select lp.content_id from public.foamlab_learning_progress lp join public.foamlab_content c on c.id=lp.content_id
 where lp.user_id=who and lp.completed and c.kind='lesson' and c.status='published' and coalesce(c.metadata->>'admin_only','false')<>'true'
 and not exists(select 1 from public.foamlab_pet_events e where e.user_id=who and e.event_key='course:'||lp.content_id) loop
  perform foamlab_private.pet_award(who,'course','course:'||lesson,25,0,lesson);
 end loop;
 select * into p from public.foamlab_pets where user_id=who;
 lvl:=foamlab_private.pet_level(p.xp);
 if operation='checkin' then
  awarded:=foamlab_private.pet_award(who,'checkin','checkin:'||(now() at time zone 'Asia/Shanghai')::date,10,1);
 elsif operation='equip' then
  select * into item from foamlab_private.pet_items where id=payload->>'id';
  if not found or not foamlab_private.town_unlocked(who,item.id) then raise exception '这个收藏尚未解锁。'; end if;
  if item.category='form' then update public.foamlab_pets set form=item.id where user_id=who;
  elsif item.category='outfit' then update public.foamlab_pets set outfit=item.id where user_id=who;
  elsif item.category='decoration' then update public.foamlab_pets set decoration=item.id where user_id=who;
  elsif item.category='action' then update public.foamlab_pets set action=item.id where user_id=who;
  elsif item.category='ride' then update public.foamlab_pets set ride=item.id where user_id=who;
  elsif item.category in ('house','title') then perform foamlab_private.town_api('settings',jsonb_build_object(case when item.category='house' then 'house_style' else 'title_id' end,item.id));
  else raise exception '请在小镇动作栏中选择表情或互动；纪念章会自动展示。'; end if;
 elsif operation='settings' then
  if payload ? 'quickbar' then
   if jsonb_typeof(payload->'quickbar')<>'array' or jsonb_array_length(payload->'quickbar')<>6 then raise exception '快捷栏包含六个动作。'; end if;
   for favorite in select jsonb_array_elements_text(payload->'quickbar') loop
    if not exists(select 1 from foamlab_private.pet_items where id=favorite and category in ('action','duo','emote')) or not foamlab_private.town_unlocked(who,favorite) then raise exception '快捷栏中有尚未解锁的动作。'; end if;
   end loop;
   update public.foamlab_pets set quickbar=array(select jsonb_array_elements_text(payload->'quickbar')) where user_id=who;
  end if;
  if payload ? 'show_town_entry' then update public.foamlab_pets set show_town_entry=(payload->>'show_town_entry')::boolean where user_id=who; end if;
  if payload ? 'name' and (jsonb_typeof(payload->'name')<>'string' or char_length(trim(payload->>'name')) not between 1 and 20) then raise exception '名字请输入 1–20 个字。'; end if;
  if payload ? 'visible' and jsonb_typeof(payload->'visible')<>'boolean' then raise exception '显示设置无效。'; end if;
  if payload ? 'motion' and jsonb_typeof(payload->'motion')<>'boolean' then raise exception '动画设置无效。'; end if;
  update public.foamlab_pets set name=case when payload ? 'name' then trim(payload->>'name') else name end,
  visible=coalesce((payload->>'visible')::boolean,visible),motion=coalesce((payload->>'motion')::boolean,motion) where user_id=who;
 end if;
 select * into p from public.foamlab_pets where user_id=who;
 lvl:=foamlab_private.pet_level(p.xp);
 select array_agg(id) into unlocked from foamlab_private.pet_unlocked(who) id;
 -- Moderated/deleted contributions can lower XP; equipment follows current unlocks.
 if not exists(select 1 from foamlab_private.pet_items where id=p.form and category='form' and id=any(unlocked)) then p.form:='cub'; end if;
 if not exists(select 1 from foamlab_private.pet_items where id=p.outfit and category='outfit' and id=any(unlocked)) then p.outfit:='none'; end if;
 if not exists(select 1 from foamlab_private.pet_items where id=p.action and category='action' and id=any(unlocked)) then p.action:='wave'; end if;
 if not exists(select 1 from foamlab_private.pet_items where id=p.decoration and category='decoration' and id=any(unlocked)) then p.decoration:='no-decor'; end if;
 if not p.ride=any(unlocked) then p.ride:='walk'; end if;
 if exists(select 1 from unnest(p.quickbar) id where not id=any(unlocked)) then p.quickbar:=array['wave','highfive','smile','heart','thumb','give-bamboo']; end if;
 update public.foamlab_pets set ride=p.ride,quickbar=p.quickbar,form=p.form,outfit=p.outfit,action=p.action,decoration=p.decoration where user_id=who;
 result:=jsonb_build_object('pet',to_jsonb(p),'level',lvl,'level_start',25*lvl*(lvl-1),'next_level_xp',25*lvl*(lvl+1),'awarded',awarded,
 'checked_in',exists(select 1 from public.foamlab_pet_events where user_id=who and event_key='checkin:'||(now() at time zone 'Asia/Shanghai')::date),
 'items',(select jsonb_agg(to_jsonb(i)||jsonb_build_object('unlocked',i.id=any(unlocked)) order by category,required_level,id) from foamlab_private.pet_items i),
 'events',(select coalesce(jsonb_agg(to_jsonb(e)),'[]'::jsonb) from (select kind,points,created_at from public.foamlab_pet_events where user_id=who order by id desc limit 8) e));
 return result;
end $function$;


-- All public wrappers use invoker rights. Only their explicit private targets are executable.
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='foamlab_private' and (p.proname like 'town_%' or p.proname in ('pet_unlocked','accept_answer')) loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 end loop;
 for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (p.proname like 'foamlab_town%' or p.proname='foamlab_accept_answer') loop
 execute format('revoke all on function %s from public,anon,authenticated',f.signature);
 end loop;
end $$;
grant execute on function public.foamlab_town_map(),public.foamlab_town_street(text,integer,text),public.foamlab_town_house(uuid,integer,integer),foamlab_private.town_map(),foamlab_private.town_street(text,integer,text),foamlab_private.town_house(uuid,integer,integer) to anon,authenticated;
grant execute on function public.foamlab_town(text,jsonb),public.foamlab_town_action(jsonb),public.foamlab_town_admin(text,jsonb),public.foamlab_accept_answer(uuid,uuid),foamlab_private.town_api(text,jsonb),foamlab_private.town_action(jsonb),foamlab_private.town_admin(text,jsonb),foamlab_private.accept_answer(uuid,uuid) to authenticated;
create function foamlab_private.town_channel_allowed(topic text) returns boolean language sql stable security definer set search_path='' as $$
 select foamlab_private.town_enabled() and auth.uid() is not null and foamlab_private.has_github_identity() and not foamlab_private.has_role(array['blocked'])
 and exists(select 1 from public.foamlab_town_residents r join public.foamlab_town_presence p using(user_id) where r.user_id=(select auth.uid()) and 'town:'||p.province=topic and p.seen_at>now()-interval '2 minutes') $$;
revoke all on function foamlab_private.town_channel_allowed(text) from public,anon;
grant execute on function foamlab_private.town_channel_allowed(text) to authenticated;
create policy town_realtime_read on realtime.messages for select to authenticated using(extension in ('broadcast','presence') and (select foamlab_private.town_channel_allowed(realtime.topic())));
-- Action broadcasts are emitted by the validated server RPC. Browsers only publish presence.
create policy town_realtime_presence on realtime.messages for insert to authenticated with check(extension='presence' and (select foamlab_private.town_channel_allowed(realtime.topic())));
