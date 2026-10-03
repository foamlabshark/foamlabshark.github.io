const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../..');global.window={};
vm.runInThisContext(fs.readFileSync(path.join(root,'themes/foam-lab/source/assets/town/town-art.js'),'utf8'));
const out=path.join(root,'source-openfoam/assets/town/landmarks');fs.mkdirSync(out,{recursive:true});
for(const id of ['dam','wind','ship','airfoil','heat','cavity'])fs.writeFileSync(path.join(out,id+'.svg'),window.FoamTownArt.spot(id).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
console.log('Exported six original SVG exhibit illustrations.');
