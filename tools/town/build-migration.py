from pathlib import Path
import json,runpy
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'tools/town'
runpy.run_path(str(BASE/'build-data.py'))
runpy.run_path(str(BASE/'pet-extension.py'))
def quote(s): return "'"+str(s).replace("'","''")+"'" if s is not None else 'null'
parts=[(BASE/'schema.sql').read_text(encoding='utf-8')]
items=json.loads((BASE/'catalog-new.json').read_text(encoding='utf-8'))
parts.append('insert into foamlab_private.pet_items(id,category,title,description,required_level,requirement,festival) values\n'+',\n'.join('('+','.join([quote(i['id']),quote(i['category']),quote(i['title']),quote(i['description']),str(i['required_level']),quote(json.dumps(i['requirement'],ensure_ascii=False)) if i['requirement'] else 'null',quote(i['festival'])])+')' for i in items)+';')
for name in ['read','api','acceptance','admin','pet-extension','security']:parts.append((BASE/(name+'.sql')).read_text(encoding='utf-8'))
migration=ROOT/'supabase/migrations/20261003163225_panda_town.sql'
migration.write_text('\n\n'.join(parts),encoding='utf-8')
print('Built migration:',len(migration.read_bytes()),'bytes')
