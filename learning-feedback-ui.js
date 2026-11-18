(function(root){
"use strict";
function el(tag, text){const node=root.document.createElement(tag);if(text)node.textContent=text;return node;}
function render(detail){
 const host=root.document.getElementById("diagnosticChatLearningFeedback");if(!host)return;host.replaceChildren();
 const diagnosis=detail&&detail.diagnosis;const results=diagnosis&&Array.isArray(diagnosis.results)?diagnosis.results.slice(0,5):[];
 if(!detail.caseId||!results.length||!root.MaintenanceLearningMemory)return;
 const form=el("form");const heading=el("strong","ما نتيجة الفحص الفعلي؟ ساعد في تحسين جودة التشخيص.");
 const outcome=el("select");[["confirmed","تم تأكيد عطل مقترح"],["not_confirmed","لم يتأكد أي عطل مقترح"],["inconclusive","النتيجة غير حاسمة"]].forEach(([v,t])=>{const o=el("option",t);o.value=v;outcome.appendChild(o);});
 const fault=el("select");const blank=el("option","اختر العطل المؤكد");blank.value="";fault.appendChild(blank);
 results.forEach(item=>{const o=el("option",String(item.title||item.id||"فرضية"));o.value=String(item.id||"").slice(0,120);fault.appendChild(o);});
 const evidence=el("textarea");evidence.required=true;evidence.maxLength=1000;evidence.rows=3;evidence.placeholder="اكتب دليل الفحص أو نتيجة الإصلاح دون بيانات شخصية."; 
 const submit=el("button","حفظ النتيجة محليًا");submit.type="submit";submit.className="btn secondary";
 const note=el("p","تُحفظ المساهمة على هذا الجهاز فقط. لا تغيّر قاعدة الأعطال ولا تدرب النموذج تلقائيًا.");note.className="hint";
 outcome.addEventListener("change",()=>{fault.disabled=outcome.value!=="confirmed";});fault.disabled=outcome.value!=="confirmed";
 form.addEventListener("submit",async event=>{event.preventDefault();if(outcome.value==="confirmed"&&!fault.value){note.textContent="اختر العطل المؤكد.";return;}if(!evidence.value.trim()){note.textContent="أضف دليل المعاينة أو الإصلاح.";return;}submit.disabled=true;try{await root.MaintenanceLearningMemory.recordOutcome({caseId:detail.caseId,outcome:outcome.value,confirmedFaultId:outcome.value==="confirmed"?fault.value:"",evidenceSummary:evidence.value.trim(),verificationMethod:"technician-reported-inspection-or-repair",contributorConfirmed:true});form.replaceChildren();note.textContent="حُفظت الحالة كمرشح للمراجعة. لم يتغير محرك التشخيص.";form.appendChild(note);}catch(error){submit.disabled=false;note.textContent=error&&error.message?error.message:"تعذر حفظ النتيجة.";}});
 host.append(heading,form);form.append(outcome,fault,evidence,submit,note);
}
root.addEventListener("maintenance-diagnostic-learning-case",event=>render(event.detail||{}));
})(typeof globalThis!=="undefined"?globalThis:this);