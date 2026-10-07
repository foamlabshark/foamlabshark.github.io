'use strict';
/* Fishing reads the painted water outlines. Banks and floats therefore follow the same geometry. */
(() => {
 function survey(g) {
  const areas = [...g.world.querySelectorAll('.town-game-ground [data-fishing-water]')].map((node,index) => {
   const root = node.ownerSVGElement;
   const matrix = root.getScreenCTM().inverse().multiply(node.getScreenCTM()), inverse = matrix.inverse();
   const transform = p => new DOMPoint(p.x,p.y).matrixTransform(matrix);
   const exclusions = (node.dataset.fishingExclude || '').split(';').filter(Boolean).map(s=>s.split(',').map(Number));
   const contains = point => {
    if(exclusions.some(([x,y,w,h])=>point.x>=x&&point.x<=x+w&&point.y>=y&&point.y<=y+h))return false;
    const local = new DOMPoint(point.x,point.y).matrixTransform(inverse);
    return node.dataset.fishingStroke ? node.isPointInStroke(local) : node.isPointInFill(local);
   };
   return {id:'water-'+index,name:node.dataset.fishingWater,node,transform,contains,stroke:!!node.dataset.fishingStroke};
  });
  const inWater = p => areas.some(a=>a.contains(p)), banks = [];
  for(const area of areas){
   const length = area.node.getTotalLength();
   for(let at=2;at<length-2;at+=18){
    const edge=area.transform(area.node.getPointAtLength(at)), a=area.transform(area.node.getPointAtLength(at-1)), b=area.transform(area.node.getPointAtLength(at+1));
    const distance=Math.hypot(b.x-a.x,b.y-a.y)||1, normal={x:-(b.y-a.y)/distance,y:(b.x-a.x)/distance};
    for(const side of [-1,1]){
     const target=area.stroke?edge:[32,18,8].map(d=>({x:edge.x-normal.x*side*d,y:edge.y-normal.y*side*d})).find(p=>area.contains(p));
     if(!target||!area.contains(target))continue;
     for(const offset of [24,36,48,64,80]){
      const bank={x:edge.x+normal.x*side*offset,y:edge.y+normal.y*side*offset};
      if(!g.walkable(bank.x,bank.y)||inWater(bank))continue;
      // Reject points across the water from this bank, and casts obscured by bridge decking.
      const justOutside={x:edge.x+normal.x*side*4,y:edge.y+normal.y*side*4};
      if(!area.stroke&&area.contains(justOutside))continue;
      if(banks.some(s=>s.area===area&&Math.hypot(s.x-bank.x,s.y-bank.y)<15))break;
      banks.push({...bank,target,area});break;
     }
    }
   }
  }
  const nearest = () => {
   if(inWater(g.me))return null;
   let result=null, best=62;
   for(const bank of banks){const d=Math.hypot(g.me.x-bank.x,g.me.y-bank.y);
    if(d>=best||Math.hypot(g.me.x-bank.target.x,g.me.y-bank.target.y)>145||!g.clear(g.me,bank))continue;
    best=d;result=bank;
   }
   return result;
  };
  return {areas,banks,inWater,nearest};
 }
 window.FoamTownWater={survey};
})();
