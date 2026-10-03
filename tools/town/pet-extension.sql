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
