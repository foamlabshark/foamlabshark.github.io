'use strict';
importScripts('/assets/vendor/highlight-core.js');
const aliases={foam:'openfoam',dict:'openfoam',c:'cpp',h:'cpp',hpp:'cpp','c++':'cpp',shell:'bash',sh:'bash',console:'bash',py:'python',yml:'yaml',make:'makefile',text:'plaintext',txt:'plaintext'};
self.onmessage=event=>{
 const {id,language,code}=event.data;try{
  const name=aliases[language]||language;
  if(typeof code!=='string'||code.length>32768||!self.foamHighlight.getLanguage(name)){self.postMessage({id,plain:true});return;}
  const html=self.foamHighlight.highlight(code,{language:name,ignoreIllegals:true}).value;
  self.postMessage({id,html,language:name});
 }catch{self.postMessage({id,plain:true});}
};
