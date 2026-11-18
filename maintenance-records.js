/* Local maintenance-record storage, reporting and import/export UI.
 * Records stay on this device; this module does not access the network.
 */
(function (root) {
  "use strict";
  const $ = id => root.document.getElementById(id);
  const tr = key => root.MaintenanceI18n ? root.MaintenanceI18n.t(key) : key;
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

const KEY='maintenance-ai-toolkit-records-v1';function getRecords(){try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value:[]}catch(error){console.warn('Maintenance records could not be read from local storage.',error);return []}}function saveRecords(a){try{localStorage.setItem(KEY,JSON.stringify(a));return true}catch(error){console.error('Maintenance records could not be saved locally.',error);const lang=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';const message=lang==='en'?'Could not save records on this device. Storage may be unavailable or full. Export your data if possible.':lang==='fr'?'Impossible d’enregistrer les interventions sur cet appareil. Le stockage est peut-être indisponible ou plein. Exportez vos données si possible.':'تعذّر حفظ سجلات الصيانة على هذا الجهاز. قد تكون مساحة التخزين ممتلئة أو غير متاحة؛ صدّر بياناتك إن أمكن.';window.alert(message);return false}}function newRecordId(){return 'rec-'+Date.now().toString(36)+Math.random().toString(36).slice(2,10)}
function localDateString(date=new Date()){const y=date.getFullYear();const m=String(date.getMonth()+1).padStart(2,'0');const d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`;}
$('logDate').value=localDateString();
$('logForm').addEventListener('submit',e=>{e.preventDefault();const a=getRecords();a.unshift({id:newRecordId(),date:$('logDate').value,createdAt:new Date().toISOString(),machine:$('logMachine').value.trim(),fault:$('logFault').value.trim(),action:$('logAction').value.trim(),status:$('logStatus').value});if(!saveRecords(a))return;e.target.reset();$('logDate').value=localDateString();renderRecords();});
function renderRecords(){
const currentLanguage=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';
const statusText=status=>status==='قيد الفحص'?tr('statusInProgress'):status==='تم الإصلاح'?tr('statusRepaired'):status==='يتطلب قطع غيار'?tr('statusParts'):status==='تم التصعيد'?tr('statusEscalated'):status;
const all=getRecords();
const query=($('recordSearch')&&$('recordSearch').value||'').trim().toLocaleLowerCase();
const status=$('recordStatusFilter')&&$('recordStatusFilter').value||'';
const date=$('recordDateFilter')&&$('recordDateFilter').value||'';
const filtered=all.map((record,index)=>({record,index})).filter(item=>{
const machine=String(item.record.machine||'').toLocaleLowerCase();
return (!query||machine.includes(query))&&(!status||item.record.status===status)&&(!date||item.record.date===date);
});
$('records').innerHTML=filtered.length?filtered.map(item=>{const r=item.record;return '<article class="record"><h3>'+escapeHtml(r.machine)+' <span class="pill">'+escapeHtml(statusText(r.status))+'</span></h3><p>'+escapeHtml(r.date)+'</p><p><b>'+escapeHtml(tr('faultLabel'))+'</b> '+escapeHtml(r.fault)+'</p><p><b>'+escapeHtml(tr('actionLabel'))+'</b> '+escapeHtml(r.action)+'</p><div class="actions"><button class="btn secondary" data-report="'+item.index+'" type="button">تصدير تقرير السجل</button><button class="btn secondary" data-delete="'+item.index+'" type="button">'+escapeHtml(tr('deleteRecord'))+'</button></div></article>';}).join(''):('<div class="empty">'+escapeHtml(tr('noRecords'))+'</div>');
document.querySelectorAll('[data-report]').forEach(b=>b.addEventListener('click',()=>{const r=getRecords()[Number(b.dataset.report)];if(!r)return;const html='<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>تقرير صيانة</title><style>body{font-family:Arial,sans-serif;max-width:850px;margin:24px auto;padding:20px;color:#172b32;line-height:1.7}h1{font-size:24px;border-bottom:2px solid #0f766e;padding-bottom:10px}.meta{color:#52666d}section{border:1px solid #dce5e8;border-radius:10px;padding:14px;margin:12px 0;white-space:pre-wrap;overflow-wrap:anywhere}.warning{background:#fff7ed;padding:12px;border:1px solid #fed7aa}@media print{button{display:none}body{margin:0;max-width:none}}</style></head><body><h1>تقرير صيانة صناعية</h1><p class="meta">تم التصدير: '+escapeHtml(new Date().toLocaleString())+'</p><section><b>التاريخ</b><br>'+escapeHtml(r.date||'غير محدد')+'</section><section><b>المعدة / رقم الأصل</b><br>'+escapeHtml(r.machine||'غير محدد')+'</section><section><b>العطل / الملاحظة</b><br>'+escapeHtml(r.fault||'غير محدد')+'</section><section><b>الإجراء / النتيجة المسجلة</b><br>'+escapeHtml(r.action||'غير محدد')+'</section><section><b>الحالة</b><br>'+escapeHtml(r.status||'غير محدد')+'</section><p class="warning">هذا التقرير يعكس البيانات المسجلة فقط، ولا يمثل اعتمادًا هندسيًا أو تأكيدًا مستقلًا للسبب الجذري. اتبع دليل المصنع وإجراءات السلامة المعتمدة.</p><button onclick="window.print()">طباعة / حفظ PDF</button></body></html>';const blob=new Blob([html],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='maintenance-report-'+String(r.date||'record')+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);const printable=window.open('','_blank');if(printable){printable.document.open();printable.document.write(html);printable.document.close();}}));
document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{const lang=window.MaintenanceI18n?window.MaintenanceI18n.getLanguage():'ar';const message=lang==='en'?'Delete this maintenance record? This cannot be undone.':lang==='fr'?'Supprimer cet enregistrement de maintenance ? Cette action est irréversible.':'هل تريد حذف سجل الصيانة؟ لا يمكن التراجع عن هذا الإجراء.';if(!window.confirm(message))return;const x=getRecords();const index=Number(b.dataset.delete);if(!Number.isInteger(index)||index<0||index>=x.length)return;x.splice(index,1);if(!saveRecords(x))return;renderRecords();}));
}
function csvCell(value){const text=String(value??'');const safe=/^[\t\r\n ]*[=+\-@]/.test(text)?"'"+text:text;return '"'+safe.replace(/"/g,'""')+'"';}
$('exportCsv').addEventListener('click',()=>{const rows=[['Date','Machine','Fault','Action','Status'],...getRecords().map(r=>[r.date,r.machine,r.fault,r.action,r.status])];const csv='\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));const a=document.createElement('a');a.href=url;a.download='maintenance-log.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('exportJson').addEventListener('click',()=>{
  const backup={schema:'maintenance-ai-toolkit-backup',version:1,exportedAt:new Date().toISOString(),records:getRecords()};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='maintenance-backup-'+localDateString()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$('importJson').addEventListener('click',()=>$('importJsonFile').click());
$('importJsonFile').addEventListener('change',async e=>{
  const file=e.target.files&&e.target.files[0];e.target.value='';if(!file)return;
  if(file.size>2*1024*1024){alert('حجم ملف النسخة الاحتياطية يتجاوز 2 ميغابايت.');return;}
  let backup;try{backup=JSON.parse(await file.text());}catch{alert('الملف ليس JSON صالحًا.');return;}
  if(!backup||backup.schema!=='maintenance-ai-toolkit-backup'||backup.version!==1||!Array.isArray(backup.records)||backup.records.length>5000){alert('تنسيق النسخة الاحتياطية غير مدعوم أو عدد السجلات كبير.');return;}
  const valid=backup.records.every(r=>r&&typeof r==='object'&&!Array.isArray(r)&&
    ['date','machine','fault','action','status'].every(k=>typeof r[k]==='string'&&r[k].length<=4000));
  if(!valid){alert('تحتوي النسخة على سجل غير صالح أو حقول غير نصية. لم يتم استيراد شيء.');return;}
  if(!confirm('سيتم دمج '+backup.records.length+' سجلًا مع السجلات الحالية. هل تريد المتابعة؟'))return;
  const current=getRecords(),seen=new Set(current.map(r=>JSON.stringify(r)));
  let added=0;
  for(const record of backup.records){const clean={date:record.date,machine:record.machine,fault:record.fault,action:record.action,status:record.status};if(record.createdAt&&typeof record.createdAt==='string'&&record.createdAt.length<=80)clean.createdAt=record.createdAt;const key=JSON.stringify(clean);if(!seen.has(key)){current.push(clean);seen.add(key);added++;}}
  if(current.length>5000){alert('عدد السجلات بعد الدمج سيتجاوز 5000. قلّل حجم النسخة ثم أعد المحاولة.');return;}
  try{if(!saveRecords(current))return;renderRecords();alert('اكتمل الاستيراد. السجلات الجديدة المضافة: '+added+'.');}catch{alert('تعذّر حفظ السجلات؛ قد تكون مساحة التخزين ممتلئة.');}
});
$('clearRecords').addEventListener('click',()=>{
  if(!confirm('تحذير: سيتم حذف جميع سجلات الصيانة المحفوظة على هذا الجهاز.'))return;
  if(prompt('للتأكيد النهائي، اكتب حذف')!=='حذف'){alert('تم إلغاء الحذف.');return;}
  localStorage.removeItem(KEY);renderRecords();
});


  root.getRecords = getRecords;
  root.saveRecords = saveRecords;
  root.newRecordId = newRecordId;
  root.localDateString = localDateString;
  root.renderRecords = renderRecords;
  root.MaintenanceRecords = Object.freeze({
    getRecords, saveRecords, newRecordId, localDateString, renderRecords
  });
  renderRecords();
})(window);
