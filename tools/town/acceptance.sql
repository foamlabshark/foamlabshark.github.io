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
