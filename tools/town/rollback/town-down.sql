-- Emergency procedure: back up the database and exported Town records first.
-- Applying the previous source release is also necessary. This script deletes Town data.
begin;
update public.foamlab_settings set value='"off"' where key='town_enabled';
drop policy if exists town_realtime_read on realtime.messages;
drop policy if exists town_realtime_presence on realtime.messages;
drop trigger if exists a_town_accept_guard on public.foamlab_threads;
drop trigger if exists town_accept_cleanup on public.foamlab_threads;
drop trigger if exists town_accept_cleanup on public.foamlab_messages;
alter table public.foamlab_threads drop column accepted_message_id,drop column accepted_at;
delete from public.foamlab_pet_events where kind in ('accepted','bamboo','spot','town_visit','town_home','festival');
update public.foamlab_pets p set xp=(select coalesce(sum(points),0) from public.foamlab_pet_events e where e.user_id=p.user_id);
update public.foamlab_pets set form='cub' where form in ('sailor','pilot','polar','beanie','overalls','bowtie','sunglasses','title-helper','title-author','title-traveler','title-bamboo','title-collector','title-institute','stethoscope','palette','scroll','basket','badge-card','lantern-red','zongzi','moon-lamp','typing','kite','bubbles','photo','taichi','streamline','firework','highfive','give-bamboo','hug','selfie','duet','smile','heart','thumb','question','exclaim','idea','bamboo','zzz','starry','sweat','confetti','fire','walk','jog','skateboard','bicycle','balloon','bamboo-hut','brick','mushroom','lighthouse','wind-tunnel','badge-dam','badge-wind','badge-ship','badge-airfoil','badge-heat','badge-cavity');
update public.foamlab_pets set outfit='none' where outfit in ('sailor','pilot','polar','beanie','overalls','bowtie','sunglasses','title-helper','title-author','title-traveler','title-bamboo','title-collector','title-institute','stethoscope','palette','scroll','basket','badge-card','lantern-red','zongzi','moon-lamp','typing','kite','bubbles','photo','taichi','streamline','firework','highfive','give-bamboo','hug','selfie','duet','smile','heart','thumb','question','exclaim','idea','bamboo','zzz','starry','sweat','confetti','fire','walk','jog','skateboard','bicycle','balloon','bamboo-hut','brick','mushroom','lighthouse','wind-tunnel','badge-dam','badge-wind','badge-ship','badge-airfoil','badge-heat','badge-cavity');
update public.foamlab_pets set action='wave' where action in ('sailor','pilot','polar','beanie','overalls','bowtie','sunglasses','title-helper','title-author','title-traveler','title-bamboo','title-collector','title-institute','stethoscope','palette','scroll','basket','badge-card','lantern-red','zongzi','moon-lamp','typing','kite','bubbles','photo','taichi','streamline','firework','highfive','give-bamboo','hug','selfie','duet','smile','heart','thumb','question','exclaim','idea','bamboo','zzz','starry','sweat','confetti','fire','walk','jog','skateboard','bicycle','balloon','bamboo-hut','brick','mushroom','lighthouse','wind-tunnel','badge-dam','badge-wind','badge-ship','badge-airfoil','badge-heat','badge-cavity');
delete from foamlab_private.pet_items where id in ('sailor','pilot','polar','beanie','overalls','bowtie','sunglasses','title-helper','title-author','title-traveler','title-bamboo','title-collector','title-institute','stethoscope','palette','scroll','basket','badge-card','lantern-red','zongzi','moon-lamp','typing','kite','bubbles','photo','taichi','streamline','firework','highfive','give-bamboo','hug','selfie','duet','smile','heart','thumb','question','exclaim','idea','bamboo','zzz','starry','sweat','confetti','fire','walk','jog','skateboard','bicycle','balloon','bamboo-hut','brick','mushroom','lighthouse','wind-tunnel','badge-dam','badge-wind','badge-ship','badge-airfoil','badge-heat','badge-cavity');
CREATE OR REPLACE FUNCTION foamlab_private.pet_api(operation text, payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare who uuid:=auth.uid(); p public.foamlab_pets; lvl integer; item foamlab_private.pet_items; awarded integer:=0; lesson uuid; result jsonb;
begin
 if who is null or not foamlab_private.has_github_identity() or not exists(select 1 from auth.users where id=who) then raise exception using errcode='42501',message='请先使用 GitHub 登录。'; end if;
 if foamlab_private.has_role(array['blocked']) then raise exception using errcode='42501',message='此账号的成长功能暂时停用。'; end if;
 if operation not in ('state','checkin','equip','settings') or operation is null then raise exception '未知操作。'; end if;
 insert into public.foamlab_pets(user_id) values(who) on conflict do nothing;
 select * into p from public.foamlab_pets where user_id=who for update;
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
  if not found or item.required_level>lvl then raise exception '这个收藏尚未解锁。'; end if;
  if item.category='form' then update public.foamlab_pets set form=item.id where user_id=who;
  elsif item.category='outfit' then update public.foamlab_pets set outfit=item.id where user_id=who;
  elsif item.category='decoration' then update public.foamlab_pets set decoration=item.id where user_id=who;
  elsif item.category='action' then update public.foamlab_pets set action=item.id where user_id=who; end if;
 elsif operation='settings' then
  if payload ? 'name' and (jsonb_typeof(payload->'name')<>'string' or char_length(trim(payload->>'name')) not between 1 and 20) then raise exception '名字请输入 1–20 个字。'; end if;
  if payload ? 'visible' and jsonb_typeof(payload->'visible')<>'boolean' then raise exception '显示设置无效。'; end if;
  if payload ? 'motion' and jsonb_typeof(payload->'motion')<>'boolean' then raise exception '动画设置无效。'; end if;
  update public.foamlab_pets set name=case when payload ? 'name' then trim(payload->>'name') else name end,
  visible=coalesce((payload->>'visible')::boolean,visible),motion=coalesce((payload->>'motion')::boolean,motion) where user_id=who;
 end if;
 select * into p from public.foamlab_pets where user_id=who;
 lvl:=foamlab_private.pet_level(p.xp);
 -- Moderated/deleted contributions can lower XP; equipment follows the current level.
 if not exists(select 1 from foamlab_private.pet_items where id=p.form and category='form' and required_level<=lvl) then p.form:='cub'; end if;
 if not exists(select 1 from foamlab_private.pet_items where id=p.outfit and category='outfit' and required_level<=lvl) then p.outfit:='none'; end if;
 if not exists(select 1 from foamlab_private.pet_items where id=p.action and category='action' and required_level<=lvl) then p.action:='wave'; end if;
 if not exists(select 1 from foamlab_private.pet_items where id=p.decoration and category='decoration' and required_level<=lvl) then p.decoration:='no-decor'; end if;
 update public.foamlab_pets set form=p.form,outfit=p.outfit,action=p.action,decoration=p.decoration where user_id=who;
 result:=jsonb_build_object('pet',to_jsonb(p),'level',lvl,'level_start',25*lvl*(lvl-1),'next_level_xp',25*lvl*(lvl+1),'awarded',awarded,
 'checked_in',exists(select 1 from public.foamlab_pet_events where user_id=who and event_key='checkin:'||(now() at time zone 'Asia/Shanghai')::date),
 'items',(select jsonb_agg(to_jsonb(i)||jsonb_build_object('unlocked',required_level<=lvl) order by category,required_level,id) from foamlab_private.pet_items i),
 'events',(select coalesce(jsonb_agg(to_jsonb(e)),'[]'::jsonb) from (select kind,points,created_at from public.foamlab_pet_events where user_id=who order by id desc limit 8) e));
 return result;
end $function$;
do $$ declare f record; begin
for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (p.proname like 'foamlab_town%' or p.proname='foamlab_accept_answer') loop execute format('drop function %s',f.signature);end loop;
for f in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='foamlab_private' and (p.proname like 'town_%' or p.proname in ('pet_unlocked','accept_answer')) loop execute format('drop function %s cascade',f.signature);end loop;
end $$;
drop table public.foamlab_town_reports,public.foamlab_town_mail,public.foamlab_town_residents,public.foamlab_town_presence,public.foamlab_town_bamboo,public.foamlab_town_photo_invites,public.foamlab_town_photos,public.foamlab_town_groups;
alter table public.foamlab_pets drop column ride,drop column quickbar,drop column show_town_entry;
alter table foamlab_private.pet_items drop column requirement,drop column festival;
alter table foamlab_private.pet_items drop constraint pet_items_category_check;
alter table foamlab_private.pet_items add constraint pet_items_category_check check(category in ('form','outfit','action','decoration'));
update public.foamlab_sections set visible=false where key='town';
commit;
