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
