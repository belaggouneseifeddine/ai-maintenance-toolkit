(function(){
"use strict";
const RECORDS="maintenance-ai-toolkit-records-v1", REVIEWS="maintenance-ai-toolkit-knowledge-review-v1";
const $=id=>document.getElementById(id);
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch(_){return fallback}};
const records=()=>{const x=read(RECORDS,[]);return Array.isArray(x)?x:[]};
const reviews=()=>{const x=read(REVIEWS,{});return x&&typeof x==="object"&&!Array.isArray(x)?x:{}};
const key=(r,i)=>String(r.id||("legacy-"+i+"-"+(r.date||"")+"-"+(r.machine||"")));
const label=r=>[r.date,r.machine,r.fault].filter(Boolean).join(" — ");
function render(){
 const list=records(),state=reviews(),select=$("krRecord"),old=select.value;
 select.textContent="";
 const empty=document.createElement("option");empty.value="";empty.textContent=list.length?"اختر سجلًا":"لا توجد سجلات";select.appendChild(empty);
 list.forEach((r,i)=>{const o=document.createElement("option");o.value=key(r,i);o.textContent=label(r);select.appendChild(o)});
 select.value=list.some((r,i)=>key(r,i)===old)?old:(list[0]?key(list[0],0):"");
 load();
 const out=$("krReviewList");out.textContent="";
 list.forEach((r,i)=>{const p=document.createElement("p"),v=state[key(r,i)]||{};p.textContent=label(r)+" — "+(v.status==="reviewed_for_consideration"?"تمت المراجعة":v.status==="rejected"?"مرفوض":v.status==="candidate"?"مرشح للمراجعة":"لم تتم المراجعة");out.appendChild(p)});
}
function load(){const list=records(),id=$("krRecord").value,i=list.findIndex((r,n)=>key(r,n)===id),r=list[i];if(!r){$("krRecordPreview").hidden=true;$("krSave").disabled=true;return}const v=reviews()[id]||{};$("krSave").disabled=false;$("krStatus").value=v.status||"candidate";$("krReviewer").value=v.reviewer||"";$("krNotes").value=v.notes||"";$("krRecordPreview").hidden=false;$("krRecordPreview").textContent=label(r)+"\n"+(r.action||"")}
function save(){const id=$("krRecord").value;if(!id)return;const status=$("krStatus").value,reviewer=$("krReviewer").value.trim(),notes=$("krNotes").value.trim();if(status==="reviewed_for_consideration"&&(!reviewer||notes.length<10)){$("krStatusMessage").textContent="أدخل المراجع وملاحظات من 10 أحرف على الأقل.";return}const state=reviews();state[id]={status,reviewer,notes,updatedAt:new Date().toISOString(),policy:"reviewed_candidates_only_no_automatic_publication"};try{localStorage.setItem(REVIEWS,JSON.stringify(state));$("krStatusMessage").textContent="حُفظت المراجعة محليًا؛ لم يُنشر أي سجل.";render()}catch(_){$("krStatusMessage").textContent="تعذر حفظ المراجعة محليًا."}}
function exportReviewed(){const list=records(),state=reviews(),out=[];list.forEach((r,i)=>{const v=state[key(r,i)];if(v&&v.status==="reviewed_for_consideration"&&v.reviewer&&String(v.notes||"").trim().length>=10)out.push({record:r,review:v})});$("krExportOutput").value=out.length?JSON.stringify({schemaVersion:1,exportType:"human-reviewed-knowledge-candidates",policy:"reviewed_candidates_only_no_automatic_publication",exportedAt:new Date().toISOString(),records:out},null,2):"";$("krStatusMessage").textContent=out.length?"تم إنشاء JSON للسجلات المراجَعة فقط. لا توجد إضافة تلقائية للمعرفة.":"لا توجد سجلات مستوفية للمراجعة."}
function init(){if(!$("knowledgeReviewCard"))return;render();$("krRecord").addEventListener("change",load);$("krSave").addEventListener("click",save);$("krRefresh").addEventListener("click",render);$("krExport").addEventListener("click",exportReviewed);$("logForm")?.addEventListener("submit",render);$("saveDraft")?.addEventListener("click",render);$("clearRecords")?.addEventListener("click",render);$("importJsonFile")?.addEventListener("change",()=>setTimeout(render,0));document.addEventListener("maintenance-language-changed",render)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
