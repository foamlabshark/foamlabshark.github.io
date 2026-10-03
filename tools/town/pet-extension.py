"""Patch the preserved pre-town pet API without duplicating its existing XP logic."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
s=(ROOT/'tools/town/rollback/pet_api.sql').read_text(encoding='utf-8')
s=s.replace("result jsonb;", "result jsonb; unlocked text[]; favorite text; festival_item foamlab_private.pet_items; festival_key text; calendar jsonb; dates jsonb;")
s=s.replace("-- Import existing completed lessons once.","""-- Permanent claims are recorded only inside the configured festival window.
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
 -- Import existing completed lessons once.""")
s=s.replace("if not found or item.required_level>lvl then", "if not found or not foamlab_private.town_unlocked(who,item.id) then")
s=s.replace("elsif item.category='action' then update public.foamlab_pets set action=item.id where user_id=who; end if;", """elsif item.category='action' then update public.foamlab_pets set action=item.id where user_id=who;
  elsif item.category='ride' then update public.foamlab_pets set ride=item.id where user_id=who;
  elsif item.category in ('house','title') then perform foamlab_private.town_api('settings',jsonb_build_object(case when item.category='house' then 'house_style' else 'title_id' end,item.id));
  else raise exception '请在小镇动作栏中选择表情或互动；纪念章会自动展示。'; end if;""")
s=s.replace("if payload ? 'name' and", """if payload ? 'quickbar' then
   if jsonb_typeof(payload->'quickbar')<>'array' or jsonb_array_length(payload->'quickbar')<>6 then raise exception '快捷栏包含六个动作。'; end if;
   for favorite in select jsonb_array_elements_text(payload->'quickbar') loop
    if not exists(select 1 from foamlab_private.pet_items where id=favorite and category in ('action','duo','emote')) or not foamlab_private.town_unlocked(who,favorite) then raise exception '快捷栏中有尚未解锁的动作。'; end if;
   end loop;
   update public.foamlab_pets set quickbar=array(select jsonb_array_elements_text(payload->'quickbar')) where user_id=who;
  end if;
  if payload ? 'show_town_entry' then update public.foamlab_pets set show_town_entry=(payload->>'show_town_entry')::boolean where user_id=who; end if;
  if payload ? 'name' and""")
s=s.replace("-- Moderated/deleted contributions can lower XP; equipment follows the current level.","""select array_agg(id) into unlocked from foamlab_private.pet_unlocked(who) id;
 -- Moderated/deleted contributions can lower XP; equipment follows current unlocks.""")
s=s.replace("and required_level<=lvl)","and id=any(unlocked))")
s=s.replace("update public.foamlab_pets set form=p.form", """if not p.ride=any(unlocked) then p.ride:='walk'; end if;
 if exists(select 1 from unnest(p.quickbar) id where not id=any(unlocked)) then p.quickbar:=array['wave','highfive','smile','heart','thumb','give-bamboo']; end if;
 update public.foamlab_pets set ride=p.ride,quickbar=p.quickbar,form=p.form""")
s=s.replace("jsonb_build_object('unlocked',required_level<=lvl)","jsonb_build_object('unlocked',i.id=any(unlocked))")
(ROOT/'tools/town/pet-extension.sql').write_text(s.rstrip()+';\n',encoding='utf-8')
