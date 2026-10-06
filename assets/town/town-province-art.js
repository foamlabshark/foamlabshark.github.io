/* Enamel science illustrations on the map; painted garden exhibits in town. */
'use strict';
(()=>{
 const ink='#456675',blue='#4c9cbb',light='#ccecf1',white='#fffbed',copper='#d7a15b',red='#d96f53',green='#78a98d';
 const p=(d,f='none',s=ink,w=1.6)=>`<path d="${d}" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
 const r=(x,y,w,h,f=white,rx=2)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${ink}" stroke-width="1.5"/>`;
 const c=(x,y,z,f=white,s=ink)=>`<circle cx="${x}" cy="${y}" r="${z}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`;
 const e=(x,y,rx,ry,f,s=ink)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${s}" stroke-width="1.5"/>`;
 const flow=(d,col=blue,w=2.4)=>p(d,'none',col,w);
 const arrow=(x,y,w=22,col=blue)=>flow(`M${x} ${y}h${w}m-5-4 5 4-5 4`,col);
 const curl=(x,y,z=1,col=blue)=>`<g transform="translate(${x} ${y}) scale(${z})">${flow('M-16 9C-29-12 7-29 19-11C35 12 4 31-10 16C-24 1 2-11 10-2C18 8 2 17-2 8',col,2)}</g>`;
 const tank=inside=>r(14,27,72,51,light,5)+inside+flow('M20 31h58M19 34v35','#fff',1.7)+r(9,77,82,6,copper)+p('M23 83v7m54-7v7');
 const tube=inside=>r(10,31,80,45,light,5)+inside+r(9,28,8,51,copper)+r(83,28,8,51,copper)+flow('M21 36h56','#fff',2)+p('M22 79v10h-9m65-10v10h10');
 const scenes={
 beijing:r(17,27,66,62,'#243d52',4)+[25,20,15,10,5].map((z,i)=>e(51+i*.6,56-i*.7,z,z*.86,'none',['#529dd1','#5fcac9','#b1d785','#efd26a','#e9986c'][i])).join('')+c(24,80,3,'none',blue)+c(77,81,2,'none',blue)+arrow(23,19,50,copper),
 tianjin:tank(p('M17 53q18-17 35-3t31-8v33H17Z',blue,'none')+p('M29 48h42l-7 12H36Z',copper)+r(42,36,17,12)+p('M49 36V24l12 5-12 3',red)+flow('M22 65q9-5 18 0t18 0 18 0','#e7fcff',1.7))+flow('M24 92q26 8 51-2',copper,3),
 hebei:c(50,55,34,copper)+c(50,55,27,light)+c(50,55,14,copper)+c(50,55,7,white)+flow('M30 70a25 25 0 0 1 10-38m-6-1 6 1-2 6M70 39a25 25 0 0 1-10 39m6 1-6-1 2-6')+flow('M24 32q12-16 32-13','#fff',2),
 shanxi:p('M24 87V24h52v63',white)+r(18,85,64,5,copper)+flow('M50 28v51',copper,4)+[12,22,31].map(z=>e(50,53,z,z*.78,'none',blue)).join('')+[28,78].map(y=>r(44,y-2,12,5,'#d0dacf')).join('')+c(50,53,3,red),
 neimenggu:e(50,71,35,16,copper)+p('M17 65v13q33 19 66 0V65',light)+e(50,65,32,14,blue)+flow('M50 27v39',ink,4)+[0,120,240].map(a=>`<g transform="translate(50 58) rotate(${a})">${p('M0 0Q-9-26 2-29Q14-26 0 0',copper)}</g>`).join('')+c(50,58,5,copper)+p('M19 48V21h62v27','none',copper,4),
 liaoning:tube(p('M27 71 73 56v15Z',copper)+flow('M27 70 77 38',red)+flow('M22 47h17m-17 10h12M48 51l28-7M62 57l14-4')),
 jilin:tank(r(21,61,22,12,red)+[24,30,36].map(x=>flow(`M${x} 62v9`,white,1)).join('')+flow('M38 54q-5-19 13-19q25 0 24 21q0 13-17 13')+p('m40 46-2 8-5-6',blue,blue)+p('m62 64-5 5 8 2',blue,blue)),
 heilongjiang:tank(curl(34,54,.68)+`<g transform="translate(100 0) scale(-1 1)">${curl(33,54,.68)}</g>`)+flow('M16 28h68',blue,5)+flow('M16 77h68',red,5),
 shanghai:r(18,48,20,39,'#a7c7c9')+r(44,22,20,65,white)+p('m44 22 10-8 10 8',copper)+r(70,37,15,50,'#bad4c7')+[28,39,50,61,72].map(y=>flow(`M49 ${y}h10`,blue,2)).join('')+flow('M8 44q15-8 33-7m26-5q18-7 29-2M6 65q19-8 30-2t33-6 25-2',blue,2),
 jiangsu:r(30,17,40,69,light,13)+p('M34 46q16 7 32 0v32q-16 12-32 0Z',blue,'none')+[[42,69,5],[57,56,4],[45,43,4],[56,32,3],[44,22,2]].map(v=>c(...v,white,blue)).join('')+r(25,84,50,6,copper)+flow('M34 28v37','#fff',2),
 zhejiang:tank(p('M16 51q16-8 34-12t34 10v28H16Z',blue,'none')+p('M15 74h24V59h22v15h24v4H15Z',copper)+flow('M19 54q16-8 32-10t29 8','#eefaff',2)),
 anhui:e(50,63,39,22,copper)+e(50,58,36,20,blue)+p('M38 45q7-12 20 4t27 4q-1 15-21 17t-27-5q-17-4 1-20Z','#8ac29a','none')+e(44,54,6,3,'#c5e6ae','none')+p('M26 54V24h48v12','none',copper,4)+r(25,25,14,6)+flow('M32 33v15',green,3),
 fujian:[24,34,66,76].map((y,i)=>flow(`M6 ${y}Q29 ${y} 35 ${i<2?y-9:y+9}T68 ${y}T94 ${y}`)).join('')+e(50,67,17,9,copper)+r(36,37,28,31,white)+e(50,37,14,7,white)+flow('M40 41v21','#c6d9d6',2)+arrow(5,50,19)+arrow(77,50,17),
 jiangxi:e(51,69,35,16,copper)+p('M16 51v18q35 23 70 0V51Z',white)+e(51,51,35,18,light)+e(40,50,15,9,blue)+r(26,30,28,20,white)+e(40,30,14,7,copper)+flow('M65 43q20 10-3 19m-33 10 8 3',blue,2)+flow('M20 65h7m8 9h8m9 0h8m8-8h8',blue,3),
 shandong:tube([43,52,63].map(y=>flow(`M18 ${y}Q50 ${y-8} 82 ${y}`,blue,1.8)).join(''))+p('M24 26V16h52v10','none',copper,5)+arrow(38,16,19,ink),
 henan:tube(r(42,36,24,35,copper)+[0,1,2,3].map(y=>[0,1,2].map(x=>c(46+x*8,41+y*8,2,white)).join('')).join('')+arrow(20,54,15)+arrow(68,54,13)),
 hubei:r(14,35,28,48,blue)+r(42,26,7,57,copper)+p('M49 65q12-8 22 7t20-1v12H49Z',blue)+r(68,69,9,14,white)+flow('M18 43h19M52 71q9-6 16 3',white,2)+p('M45 20v-9m-4 4 4-4 4 4','none',copper,2.6),
 hunan:p('M18 18h28v37q0 9 12 9h28v26H52Q18 90 18 60Z',copper)+p('M26 19v38q0 23 30 23h29','none',blue,11)+flow('M30 25v33q0 15 24 17h23','#e8faff',2)+p('m74 71 5 4-5 4',white,white),
 guangdong:c(50,54,33,copper)+c(50,54,24,'#eecc83')+c(50,54,15,red)+c(50,54,9,white)+[0,90,180,270].map(a=>`<g transform="rotate(${a} 50 54)">${c(50,27,3,white)}</g>`).join('')+[17,83].map(x=>flow(`M${x} 31q-5 8 0 16t0 16`,blue,2)).join(''),
 guangxi:p('M10 24h31v15h48v34H41v15H10Z',copper)+p('M13 29h25v15h48v24H38v15H13Z',light)+flow('M15 38Q35 38 42 50h39M15 73Q35 73 42 58h39',blue,2)+arrow(53,54,24),
 hainan:p('M9 33Q27 37 34 46Q40 48 53 36v36Q40 60 34 62Q25 71 9 76Z',copper)+p('M9 40Q31 44 35 52Q42 53 53 43v20Q42 55 35 57Q30 65 9 69Z',light)+flow('M53 44 68 62 83 44 97 61M53 63 68 45 83 63 97 46',blue,2)+p('M25 77v11h35'),
 chongqing:p('M10 29h19v25q0 12 26 12h35v21H51Q10 87 10 56Z',blue)+p('M67 19h20v25L56 75 41 61 67 34Z',green)+flow('M19 38v17q0 21 35 21h28','#eaf9ec',2)+flow('M77 24v14L54 61','#eaf9ec',2),
 sichuan:[30,41,72,82].map((y,i)=>flow(`M7 ${y}Q44 ${y-(i<2?14:3)} 93 ${y-2}`,i<2?red:blue,2)).join('')+p('M15 60C20 44 47 43 87 56C53 58 24 66 15 60Z',white)+flow('M21 59q24-5 56-3','#a9bec9',1.5)+flow('M50 36V20',green,3)+p('m44 25 6-8 6 8',green,green),
 guizhou:tank(p('M19 48q31 8 62 0v27H19Z',blue,'none')+flow('M50 30v35',ink,4)+p('M29 61q12-9 21 2q12-9 22-2l-5 8H34Z',copper)+flow('M24 71q25 7 53-1','#dcf5fa',1.8))+p('M19 24V15h62v9','none',copper,4)+r(39,12,22,16,green),
 yunnan:p('M13 71h75v16H13Z',blue)+[[24,11,57],[47,8,42],[67,5,25]].map(([x,w,y])=>r(x,18,w,66,light,1)+r(x+1,y,w-2,83-y,blue,0)+flow(`M${x+1} ${y}q${w/2-1} 4 ${w-2} 0`,white,1)).join('')+flow('M15 72h9m12 0h11m9 0h11m6 0h12',white,2),
 xizang:r(18,33,56,49,copper,12)+r(25,45,36,23,light,6)+p('M29 56h28v8H29Z',blue,'none')+p('M73 50h15v10H73Z',copper)+flow('M87 58q7 4 5 21',blue,3)+c(47,26,11,white)+flow('M47 26l5-6',red,2)+p('M28 83v7m34-7v7'),
 shaanxi:tube(r(18,38,32,31,'#67abc6',0)+r(50,38,32,31,'#d3eef1',0)+flow('M52 36v35',red,2.6)+[0,1,2].map(i=>p(`M${61+i*7} 44l6 10-6 10`,'none',blue,1.5)).join('')),
 gansu:tube(p('M18 71V65h34V53h30v18Z',copper)+flow('M52 53 75 36',red,2.4)+flow('M20 42h24M20 51h19M60 49l18-7',blue,2)),
 qinghai:tube(arrow(24,55,48))+p('M29 31V13h43v18H61V24H40v7Z',copper)+flow('M39 29v10m10-10v10m11-10v10',green,2)+r(25,27,16,11,red)+r(59,27,17,11,blue),
 ningxia:p('M21 31 49 18l31 13v47L50 92 21 78Z',light)+p('m21 31 29 15 30-15M50 46v46','none','#86b9c3',1.3)+curl(46,59,.8)+curl(68,69,.36)+flow('M27 34v35','#fff',2),
 xinjiang:tube(p('M17 49h26v22h39v5H17Z',copper)+curl(58,61,.44)+flow('M21 43h31q15 0 27 5',blue,2)+flow('M45 54q14-6 34 0',blue,1.5)),
 taiwan:tube(flow('M21 38 53 71 79 40',red,2.5)+flow('M20 47 41 47M59 50h18M27 58h12',blue,1.5)+flow('M18 72h64',ink,2)),
 hongkong:r(12,25,76,61,light)+[0,1,2,3,4].map(i=>flow(`M17 ${33+i*11}Q49 ${21+i*12} 84 ${33+i*11}`,blue,1)).join('')+[0,1,2,3,4].map(i=>flow(`M${20+i*14} 29Q${4+i*18} 56 ${20+i*14} 82`,blue,1)).join('')+p('M34 70 52 39l17 31Z',copper)+arrow(34,18,31,copper),
 macao:`<g transform="rotate(-14 49 54)">${r(11,30,40,46,light)}${flow('M15 56q17-9 34 0',blue,3)}</g>`+r(48,39,42,40,light)+flow('M51 60q17 9 35-1',blue,3)+flow('M50 25v59',copper,3)+c(50,83,5,copper)
 };
 const names=['北京','天津','河北','山西','内蒙古','辽宁','吉林','黑龙江','上海','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','广西','海南','重庆','四川','贵州','云南','西藏','陕西','甘肃','青海','宁夏','新疆','台湾','香港','澳门'];
 const keys=Object.keys(scenes),name=id=>names[keys.indexOf(id)]||'',safe=id=>keys.includes(id)?id:'beijing';
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const scene=id=>`<g stroke-linecap="round" stroke-linejoin="round">${scenes[safe(id)]}</g>`;
 let seq=0;
 function medal(id,gold=false,label=''){
  const clip='province-enamel-'+(++seq),inside=`<defs><clipPath id="${clip}"><circle cx="60" cy="56" r="43"/></clipPath></defs><g clip-path="url(#${clip})"><g transform="translate(15 8) scale(.9)">${scene(id)}</g></g>`;
  const frame=window.FoamTownMedalFrame(inside,{field:['#e2f2ed','#bfdcda'],ribbon:gold?['#3e867d','#e7b954']:['#768d82','#c18b63'],metal:gold?null:['#f1d7bc','#bc8b60','#785139'],w:120,h:138,cx:60,cy:56,r:50});
  return `<svg class="province-medal" viewBox="0 0 120 140" role="img" aria-label="${esc(label||name(id)+(gold?'省勋章':'到访章'))}">${frame}<path d="M23 90h74l-5 8 5 8H23l5-8Z" fill="${gold?'#c9433a':'#a65f49'}" stroke="#7a3728" stroke-width="1.5"/><path d="M30 94h60" stroke="#fff6dd" opacity=".35"/><text x="60" y="102" text-anchor="middle" font-family="'Microsoft YaHei',sans-serif" font-size="11" font-weight="700" letter-spacing="1.5" fill="#fff6dd">${name(id)}</text></svg>`;
 }
 function landmark(id){return `<img class="province-landmark" src="/assets/town/province-landmarks/${safe(id)}.webp" width="220" height="220" alt="" decoding="async" draggable="false">`;}
 function island(id,difficulty='basic',complete=false,home=false){const rim={intro:'#779465',basic:'#658f9e',advanced:'#9180a8'}[difficulty]||'#779465';return `<svg class="province-island" viewBox="18 0 184 174" aria-hidden="true"><ellipse cx="110" cy="151" rx="79" ry="17" fill="#55795f" opacity=".22"/><path d="M30 134v11q80 38 160 0v-11Z" fill="#91ac8a" stroke="${rim}" stroke-width="2"/><ellipse cx="110" cy="133" rx="80" ry="23" fill="#d0dbaf" stroke="${rim}" stroke-width="3"/><path d="M40 132q10-8 22-8M154 141l18-3" stroke="#fff5cf" stroke-width="3" stroke-linecap="round"/><g transform="translate(52 14) scale(1.16)">${scene(id)}</g>${home?window.FoamTownArt.homeFlag(171,139):''}${complete?'<path class="town-completion-flag" d="M43 136V94l22 5-7 9 7 9-22-5" fill="#e6bd63" stroke="#937643" stroke-width="2"/><path d="m47 102 4 4 7-5" fill="none" stroke="#fff9de" stroke-width="2"/>':''}</svg>`;}
 window.FoamProvinceArt={medal,landmark,island,has:id=>!!scenes[id],name};
})();
