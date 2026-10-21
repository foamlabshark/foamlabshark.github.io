'use strict';
(() => {
 const runtime=document.currentScript.dataset.excelRuntime;
 let library=null,exporting=false;
 function loadLibrary(){
  if(window.ExcelJS)return Promise.resolve(window.ExcelJS);
  if(!library)library=new Promise((resolve,reject)=>{
   const script=document.createElement('script');script.src=runtime;script.async=true;
   const timer=setTimeout(()=>fail(),45000);
   function fail(){clearTimeout(timer);script.remove();library=null;reject(Error('Excel 导出组件加载失败，请重试。'));}
   script.onerror=fail;script.onload=()=>{clearTimeout(timer);if(window.ExcelJS)resolve(window.ExcelJS);else fail();};document.head.append(script);
  });
  return library;
 }
 // Excel stores dates without a timezone. Preserve the local wall-clock time shown in the admin table.
 function date(value){
  if(!value)return null;const d=new Date(value);if(Number.isNaN(d.getTime()))return null;
  return new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes(),d.getSeconds()));
 }
 async function run(C,view,button,collect){
  if(exporting){C.notice('另一项导出正在进行，请稍候。');return;}
  if(!C.admin||C.L.role!=='admin'){C.notice('只有管理员可以导出这些信息。',true);return;}
  const user=C.L.user?.id,original=button.textContent,status=view.querySelector('[data-export-status]');
  const active=()=>view.isConnected&&user&&C.L.user?.id===user&&C.L.role==='admin';
  const assertActive=()=>{if(!active())throw Error('导出已取消。');};
  const progress=text=>{assertActive();status.textContent=text;};
  exporting=true;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='正在导出…';
  try{
   C.notice('');
   progress('正在读取全部符合筛选条件的记录…');const data=await collect({progress,assertActive});assertActive();
   if(!data.rows.length)throw Error('没有符合当前筛选条件的记录，请调整筛选后重试。');
   if(data.rows.length>1048575)throw Error('记录数超过 Excel 单张工作表的上限，请缩小筛选范围。');
   progress('正在生成 Excel 表格…');const Excel=await loadLibrary();assertActive();
   const now=new Date(),book=new Excel.Workbook();book.creator='FoamLab';book.created=now;book.modified=now;
   const sheet=book.addWorksheet(data.name,{views:[{state:'frozen',ySplit:1}]});
   sheet.columns=data.columns.map(([header,width,type])=>({header,width,style:{font:{name:'Microsoft YaHei',size:11},alignment:{vertical:'top',wrapText:true},...(type==='date'?{numFmt:'yyyy-mm-dd hh:mm:ss'}:type==='number'?{numFmt:'#,##0'}:{numFmt:'@'})}}));
   for(const values of data.rows){
    // Only strings, numbers and dates are accepted; user text never becomes an Excel formula or hyperlink.
    if(values.some(v=>v!==null&&v!==undefined&&typeof v!=='string'&&typeof v!=='number'&&!(v instanceof Date)))throw Error('导出数据格式有误，请刷新后重试。');
    if(values.some(v=>typeof v==='string'&&v.length>32767))throw Error('某条记录超过 Excel 单元格的文字上限，请缩小筛选范围后重试。');
    sheet.addRow(values);
   }
   const header=sheet.getRow(1);header.height=30;header.font={name:'Microsoft YaHei',size:11,bold:true,color:{argb:'FFFFFFFF'}};header.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF244C49'}};header.alignment={vertical:'middle',wrapText:true};
   sheet.autoFilter={from:{row:1,column:1},to:{row:sheet.rowCount,column:data.columns.length}};
   const info=book.addWorksheet('导出说明');info.columns=[{width:20},{width:85}];
   info.addRows([['项目','内容'],['导出内容',data.name],['记录数',data.rows.length],['导出时间',date(now)],['时间所在时区',Intl.DateTimeFormat().resolvedOptions().timeZone||'当前设备时区'],...data.details]);
   info.getCell('B4').numFmt='yyyy-mm-dd hh:mm:ss';
   info.eachRow(row=>{row.font={name:'Microsoft YaHei',size:11};row.alignment={vertical:'top',wrapText:true};});info.getRow(1).font={name:'Microsoft YaHei',size:11,bold:true};
   const bytes=await book.xlsx.writeBuffer();assertActive();
   const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
   const pad=n=>String(n).padStart(2,'0'),stamp=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes())+pad(now.getSeconds());
   const link=document.createElement('a');link.href=url;link.download=data.name+'_'+stamp+'.xlsx';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
   progress('已导出 '+data.rows.length+' 条记录。');
  }catch(error){if(active()){status.textContent=error.message||'导出失败，请重试。';C.notice(status.textContent,true);}}
  finally{exporting=false;button.disabled=false;button.removeAttribute('aria-busy');button.textContent=original;}
 }
 window.FoamCMSExcel={run,date};
})();
