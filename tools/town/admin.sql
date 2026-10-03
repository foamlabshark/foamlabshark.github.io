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
