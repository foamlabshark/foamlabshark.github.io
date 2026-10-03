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
