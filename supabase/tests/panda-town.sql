-- Execute inside a transaction; every fixture and write is rolled back.
begin;
insert into auth.users(id,role,aud,email) values
 ('80000000-0000-4000-8000-000000000001','authenticated','authenticated','town-a@example.invalid'),
 ('80000000-0000-4000-8000-000000000002','authenticated','authenticated','town-b@example.invalid'),
 ('80000000-0000-4000-8000-000000000003','authenticated','authenticated','town-c@example.invalid');
insert into auth.identities(user_id,provider_id,provider,identity_data) values
 ('80000000-0000-4000-8000-000000000001','town-test-a','github','{"sub":"town-test-a"}'),
 ('80000000-0000-4000-8000-000000000002','town-test-b','github','{"sub":"town-test-b"}'),
 ('80000000-0000-4000-8000-000000000003','town-test-c','github','{"sub":"town-test-c"}');
update public.foamlab_settings set value='"on"' where key='town_enabled';
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare s jsonb; rejected boolean; begin
 s:=public.foamlab_pet();assert jsonb_array_length(s->'items')=103,'103 collectibles';
 s:=public.foamlab_town('join','{"province":"hubei"}');assert s->'resident'->>'province'='hubei','Join';
 s:=public.foamlab_town('enter','{"province":"hubei"}');
 s:=public.foamlab_town('visit_spot');assert (s->>'awarded')::integer=5,'First landmark';
 s:=public.foamlab_town('visit_spot');assert (s->>'awarded')::integer=0,'Landmark idempotency';
 s:=public.foamlab_town('settings','{"group_name":"Flow Lab"}');
 s:=public.foamlab_town_house(auth.uid());assert s->'card'->>'house_style'='bamboo-hut','Public card';
 assert jsonb_array_length(s->'badges')=1,'Spot badge';
 rejected:=false;begin perform public.foamlab_town('move','{"province":"sichuan"}');exception when raise_exception then rejected:=true;end;assert rejected,'Move cooldown';
 rejected:=false;begin perform public.foamlab_town('settings','{"house_style":"wind-tunnel"}');exception when raise_exception then rejected:=true;end;assert rejected,'Locked house';
 rejected:=false;begin insert into public.foamlab_town_bamboo(giver_id,receiver_id) values(auth.uid(),'80000000-0000-4000-8000-000000000002');exception when insufficient_privilege then rejected:=true;end;assert rejected,'Direct write rejected';
 rejected:=false;begin perform foamlab_private.town_card('80000000-0000-4000-8000-000000000002');exception when insufficient_privilege then rejected:=true;end;assert rejected,'Private helper rejected';
 s:=public.foamlab_town_street('hubei');assert jsonb_array_length(s->'residents')>=1,'Street';
 s:=public.foamlab_town_map();assert (select value->>'residents' is null from jsonb_array_elements(s->'provinces') where value->>'id'='hubei'),'Small-province statistics suppressed';
end $$;
reset role;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select public.foamlab_town('join','{"province":"hubei"}');
select public.foamlab_town('settings','{"group_name":"Ｆｌｏｗ　Ｌａｂ"}');
select public.foamlab_town('enter','{"province":"hubei"}');
do $$ declare s jsonb; rejected boolean; i integer;begin
 s:=public.foamlab_town('give_bamboo','{"user_id":"80000000-0000-4000-8000-000000000001"}');assert (s->>'given')::boolean and (s->>'awarded')::integer=2,'Bamboo reward';
 s:=public.foamlab_town('give_bamboo','{"user_id":"80000000-0000-4000-8000-000000000001"}');assert not (s->>'given')::boolean,'Bamboo duplicate';
 rejected:=false;begin perform public.foamlab_town('mail_send','{"user_id":"80000000-0000-4000-8000-000000000001","body":"https://example.com"}');exception when raise_exception then rejected:=true;end;assert rejected,'URL rejected';
 for i in 1..10 loop
 s:=public.foamlab_town('mail_send',jsonb_build_object('user_id','80000000-0000-4000-8000-000000000001','body','测试留言第'||i||'条'));
 if i=1 then perform public.foamlab_town('mail_delete',jsonb_build_object('id',s->>'id'));end if;
 end loop;
 rejected:=false;begin perform public.foamlab_town('mail_send','{"user_id":"80000000-0000-4000-8000-000000000001","body":"超过限额的一条留言"}');exception when raise_exception then rejected:=true;end;assert rejected,'Deleted mail still counts toward hourly cap';
 s:=public.foamlab_town_action('{"type":"duo-invite","action":"highfive","user_id":"80000000-0000-4000-8000-000000000001"}');assert s->>'from'=auth.uid()::text,'Server action identity';
 rejected:=false;begin perform public.foamlab_town_action('{"type":"act","action":"taichi"}');exception when raise_exception then rejected:=true;end;assert rejected,'Locked action';
end $$;
reset role;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000003',true);
set local role authenticated;
select public.foamlab_town('join','{"province":"hubei"}');
select public.foamlab_town('settings','{"group_name":"flow   lab"}');
reset role;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ declare s jsonb; rejected boolean;begin
 s:=public.foamlab_town_house(auth.uid());assert s->'card'->>'institute'='Flow Lab','Normalized institute';
 assert (s->>'mail_total')::integer=9,'Visible mail excludes deleted';
 s:=public.foamlab_town_action('{"type":"duo-accept","action":"highfive","user_id":"80000000-0000-4000-8000-000000000002"}');assert s->>'type'='duo-accept','Duo consent';
 rejected:=false;begin perform public.foamlab_town_action('{"type":"duo-accept","action":"highfive","user_id":"80000000-0000-4000-8000-000000000002"}');exception when raise_exception then rejected:=true;end;assert rejected,'Duo replay';
 s:=public.foamlab_town('settings','{"mailbox_open":false}');
 perform public.foamlab_town('leave');
 rejected:=false;begin perform public.foamlab_town('join','{"province":"sichuan"}');exception when raise_exception then rejected:=true;end;assert rejected,'Leave rejoin cooldown';
 perform public.foamlab_town('join','{"province":"hubei"}');
 s:=public.foamlab_town_house(auth.uid());assert jsonb_array_length(s->'badges')=1,'Leave retains achievements';
end $$;
reset role;
-- Answer acceptance, cancellation and moderation preserve unrelated XP.
insert into public.foamlab_threads(id,author_id,title,body) values('80000000-0000-4000-8000-000000000021','80000000-0000-4000-8000-000000000001','熊猫小镇测试问题','用于检查回答采纳奖励的测试问题内容。');
insert into public.foamlab_messages(id,thread_id,author_id,body) values('80000000-0000-4000-8000-000000000031','80000000-0000-4000-8000-000000000021','80000000-0000-4000-8000-000000000002','这是包含足够文字的完整有效测试回答。');
set local role authenticated;
do $$ declare s jsonb;rejected boolean;begin
 rejected:=false;begin update public.foamlab_threads set accepted_message_id='80000000-0000-4000-8000-000000000031' where id='80000000-0000-4000-8000-000000000021';exception when raise_exception then rejected:=true;end;assert rejected,'Direct acceptance rejected';
 s:=public.foamlab_accept_answer('80000000-0000-4000-8000-000000000021','80000000-0000-4000-8000-000000000031');assert (s->>'awarded')::integer=20,'Accepted answer';
 perform public.foamlab_accept_answer('80000000-0000-4000-8000-000000000021');
end $$;
reset role;
do $$begin
 assert (select points from public.foamlab_pet_events where event_key='reply:80000000-0000-4000-8000-000000000031')=5,'Reply retained after unaccept';
 assert (select points from public.foamlab_pet_events where event_key='accepted:80000000-0000-4000-8000-000000000031')=0,'Only accepted bonus revoked';
end $$;
-- Photographs require live, reciprocal consent and are unique per pair/day.
update public.foamlab_pets set xp=800 where user_id='80000000-0000-4000-8000-000000000001';
set local role authenticated;
select public.foamlab_town('enter','{"province":"hubei"}');
select public.foamlab_town('photo_invite','{"user_id":"80000000-0000-4000-8000-000000000002"}');
reset role;
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select public.foamlab_town('photo_accept','{"user_id":"80000000-0000-4000-8000-000000000001"}');
do $$ declare s jsonb;begin
 s:=public.foamlab_town_house(auth.uid());assert (s->>'photo_total')::integer=1,'Photo saved';
 perform public.foamlab_town('photo_hide',jsonb_build_object('id',s->'photos'->0->>'id'));
 s:=public.foamlab_town_house(auth.uid());assert (s->>'photo_total')::integer=0,'Own photo hidden';
 s:=public.foamlab_town_house('80000000-0000-4000-8000-000000000001');assert (s->>'photo_total')::integer=1,'Other photo retained';
end $$;
reset role;
insert into public.foamlab_roles(user_id,role) values('80000000-0000-4000-8000-000000000003','admin');
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000003',true);
set local role authenticated;
do $$ declare s jsonb;begin
 s:=public.foamlab_town_admin('list','{"type":"mail"}');assert (s->>'total')::integer>=10,'Admin mail list';
 perform public.foamlab_town_admin('group_save','{"province":"hubei","group_key":"flow lab","display_name":"Flow Lab","aliases":["flowlab"]}');
 s:=public.foamlab_town_admin('list','{"type":"groups"}');assert (s->>'total')::integer>=1,'Admin aliases';
 perform public.foamlab_town_admin('settings','{"town_festivals":{"2026":{"national":["2026-10-01","2026-10-07"]}}}');
end $$;
reset role;
insert into public.foamlab_roles(user_id,role) values('80000000-0000-4000-8000-000000000002','blocked');
select set_config('request.jwt.claim.sub','80000000-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$ declare rejected boolean:=false;begin
 begin perform public.foamlab_town('state');exception when insufficient_privilege then rejected:=true;end;assert rejected,'Blocked writes';
 assert not foamlab_private.town_channel_allowed('town:hubei'),'Blocked channel';
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ declare s jsonb;rejected boolean:=false;begin
 s:=public.foamlab_town_street('hubei');assert jsonb_array_length(s->'online')=0,'Visitor receives no live cards';
 s:=public.foamlab_town_map();assert (s->>'enabled')::boolean,'Public map';
 begin perform public.foamlab_town('state');exception when insufficient_privilege then rejected:=true;end;assert rejected,'Visitor cannot join';
end $$;
reset role;
rollback;
select 'Town transactions: join, privacy, cooldown, XP, unlocks, mail caps, consent, moderation and permissions passed; fixtures rolled back.' as result;
