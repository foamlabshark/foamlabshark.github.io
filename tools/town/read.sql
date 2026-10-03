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
