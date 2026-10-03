"""Build a manual rollback for the Town migration. Never executes it."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[2];BASE=ROOT/'tools/town'
ids=[i['id'] for i in json.loads((BASE/'catalog-new.json').read_text(encoding='utf-8'))]
quoted=','.join("'"+i+"'" for i in ids)
sql="""-- Emergency procedure: back up the database and exported Town records first.
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
"""
sql+=f"update public.foamlab_pets set form='cub' where form in ({quoted});\nupdate public.foamlab_pets set outfit='none' where outfit in ({quoted});\nupdate public.foamlab_pets set action='wave' where action in ({quoted});\ndelete from foamlab_private.pet_items where id in ({quoted});\n"
sql+=(BASE/'rollback/pet_api.sql').read_text(encoding='utf-8').strip()+';\n'
sql+="""do $$ declare f record; begin
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
"""
(BASE/'rollback/town-down.sql').write_text(sql,encoding='utf-8')
print('Built emergency rollback; not executed.')
