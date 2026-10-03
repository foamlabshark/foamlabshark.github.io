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
