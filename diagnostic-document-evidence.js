(function(){
"use strict";
const $=id=>document.getElementById(id);
const safe=value=>String(value==null?"":value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function mount(){
 const anchor=$("dynamicSessionPanel");
 if(!anchor||$("diagnosticDocumentEvidence"))return;
 const panel=document.createElement("section");
 panel.id="diagnosticDocumentEvidence";
 panel.className="result";
 panel.innerHTML='<h3>الأدلة المعتمدة من وثائقك</h3><p class="hint">يبحث هذا المسار في الادعاءات التي راجعها شخص محدد واعتمد حقوقها وصفحتها ونطاقها. لا يستبدل بوابة السلامة ولا يؤكد سبب العطل.</p><button type="button" class="btn secondary" id="retrieveDiagnosticClaims">استرجاع الأدلة المعتمدة فقط</button><div id="diagnosticClaimResults" aria-live="polite"></div>';
 anchor.insertAdjacentElement("afterend",panel);
 $("retrieveDiagnosticClaims").addEventListener("click",async()=>{
  const output=$("diagnosticClaimResults");
  const query=[$("aiMachine")?.value,$("aiSymptom")?.value,$("aiCode")?.value,$("aiObservations")?.value].filter(Boolean).join(" ");
  if(!query.trim()){output.textContent="أدخل نوع المعدة والعَرَض أولًا.";return;}
  const api=window.MaintenanceDocumentRetrieval;
  if(!api){output.textContent="طبقة استرجاع الوثائق غير متاحة.";return;}
  output.textContent="جارٍ البحث في الادعاءات المعتمدة فقط…";
  const result=await api.forDiagnostics(query);
  if(!result.ok){output.textContent="تعذر استرجاع الأدلة: "+result.status;return;}
  if(!result.results.length){output.textContent="لا توجد ادعاءات معتمدة مطابقة. لا تُستخدم المقاطع الخام أو الوثائق غير المراجعة في التشخيص.";return;}
  output.innerHTML=result.results.map((item,i)=>'<article class="document-result"><div class="document-result-meta"><strong>'+safe(item.documentTitle)+'</strong><span>الصفحة '+Number(item.sourceRef.pageNumber||0)+'</span></div><p>'+safe(item.text)+'</p><p class="hint">المصنّع: '+safe(item.sourceRef.manufacturer||"غير محدد")+' | نطاق المعدة: '+safe(item.sourceRef.equipmentFamily||"غير محدد")+' | الموديل: '+safe(item.sourceRef.modelApplicability||"غير محدد")+'</p><p class="hint">فئة الدليل: '+safe(item.sourceRef.evidenceClass||"غير محددة")+' | المراجع: '+safe(item.sourceRef.reviewer||"غير محدد")+' | '+safe(item.citation||"")+'</p><button type="button" class="btn secondary" data-diagnostic-source="'+i+'">فتح الصفحة الأصلية</button></article>').join("");
  output.querySelectorAll("[data-diagnostic-source]").forEach(button=>{const item=result.results[Number(button.dataset.diagnosticSource)];button.addEventListener("click",()=>window.MaintenanceDocumentLibrary.openSourcePage(item.sourceRef.documentId,item.sourceRef.pageNumber));});
 });
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();