(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const library = () => window.MaintenanceDocumentLibrary;
  const retrieval = () => window.MaintenanceDocumentRetrieval;
  function field(label, id, type, placeholder) {
    return '<label for="'+id+'">'+label+'</label>'+(type==="textarea"?'<textarea id="'+id+'" rows="3" placeholder="'+(placeholder||"")+'"></textarea>':'<input id="'+id+'" type="'+(type||"text")+'" placeholder="'+(placeholder||"")+'">');
  }
  function panel(title, body) { const el=document.createElement("section");el.className="card document-workspace";el.innerHTML="<h2>"+title+"</h2>"+body;return el; }
  function status(id,message){const el=$(id);if(el)el.textContent=message;}
  async function fillDocuments() {
    const docs=await library().list();
    const options=docs.map(d=>'<option value="'+escapeHtml(d.id)+'">'+escapeHtml(d.title)+' — '+escapeHtml(d.fileName)+'</option>').join("");
    ["reviewDocumentSelect","researchDocumentFilter","studyDocumentFilter"].forEach(id=>{const el=$(id);if(el)el.innerHTML='<option value="">كل الوثائق</option>'+options;});
    const claims=await library().listClaims();
    const claimList=$("reviewedClaimsList");
    if(claimList) claimList.innerHTML=claims.length?claims.map(c=>'<article class="document-result"><strong>'+escapeHtml(c.documentId)+' — الصفحة '+c.pageNumber+'</strong><p>'+escapeHtml(c.text)+'</p><p class="hint">حالة الادعاء: '+escapeHtml(c.reviewStatus)+' | الحقوق: '+escapeHtml(c.rightsStatus)+' | الفئة: '+escapeHtml(c.evidenceClass)+'</p><button type="button" class="btn secondary" data-claim-open="'+escapeHtml(c.documentId)+'" data-claim-page="'+c.pageNumber+'">فتح صفحة المصدر</button></article>').join(""):'<p class="hint">لا توجد ادعاءات مسجلة.</p>';
    claimList?.querySelectorAll("[data-claim-open]").forEach(b=>b.addEventListener("click",()=>library().openSourcePage(b.dataset.claimOpen,Number(b.dataset.claimPage))));
  }
  function mount() {
    const host=$("documentLibraryPanel");
    if(!host||$("documentReviewWorkspace"))return;
    const review=panel("مراجعة الوثائق والحقوق والادعاءات المرتبطة بالصفحات",
      '<p class="hint">المراجعة تحفظ محليًا على الجهاز. لا يصبح أي نص دليلًا للتشخيص إلا بعد اعتماد الوثيقة والحقوق والادعاء المحدد مع الصفحة والمراجع.</p>'+
      '<label for="reviewDocumentSelect">الوثيقة</label><select id="reviewDocumentSelect"></select>'+
      field("الشركة المصنّعة","reviewManufacturer","text","مثال: ABB / Siemens / Grundfos")+
      field("عائلة المعدة","reviewFamily","text","مثال: مضخات طرد مركزي")+
      field("الموديل / نطاق الانطباق","reviewModel","text","الموديلات أو السلسلة المحددة")+
      field("الإصدار / السنة","reviewEdition","text","رقم الإصدار أو سنة النشر")+
      field("رابط المصدر الأصلي","reviewSourceUrl","url","https://...")+
      field("دليل الحقوق أو الترخيص","reviewRightsEvidence","textarea","رابط الترخيص أو إذن الاستخدام أو إثبات الملكية")+
      '<label class="check"><input id="reviewRightsVerified" type="checkbox"> تحققت من أن حقوق الاستخدام تسمح بالمعالجة المطلوبة</label>'+
      field("اسم / صفة المراجع","reviewReviewer","text","المراجع الفني")+
      field("ملاحظات مراجعة الوثيقة","reviewNotes","textarea","ما الذي تم التحقق منه؟ وما القيود؟")+
      '<label class="check"><input id="reviewDocumentApproved" type="checkbox"> اعتماد الوثيقة فنيًا بعد المراجعة</label>'+
      '<button id="saveDocumentReview" class="btn" type="button">حفظ مراجعة الوثيقة</button><p id="documentReviewStatus" role="status" aria-live="polite"></p>'+
      '<hr><h3>إضافة ادعاء فني من صفحة محددة</h3>'+
      '<p class="hint">انسخ ادعاءً واحدًا قابلًا للتحقق، لا فصلًا كاملًا. اربطه برقم الصفحة ونطاق المعدة والموديل والفئة الفنية.</p>'+
      field("رقم الصفحة الأصلي","claimPage","number","1")+
      field("نص الادعاء الفني","claimText","textarea","الادعاء كما ورد في المصدر مع الحفاظ على الوحدات والشروط")+
      field("عائلة المعدة / نطاق الانطباق","claimFamily","text","عائلة المعدة")+
      field("الموديل أو القيود","claimModel","text","الموديلات أو الشروط المحددة")+
      '<label for="claimEvidenceClass">فئة الدليل</label><select id="claimEvidenceClass"><option value="manufacturer_manual">دليل مصنع</option><option value="manufacturer_bulletin">نشرة فنية للمصنع</option><option value="standard">معيار</option><option value="peer_reviewed">بحث محكّم</option><option value="public_technical_reference">مرجع فني عام</option><option value="field_case">حالة ميدانية</option></select>'+
      field("المراجع","claimReviewer","text","اسم / صفة المراجع")+
      field("ملاحظات التحقق","claimNotes","textarea","تحقق من النص والسياق والصفحة والوحدات وحدود الانطباق")+
      '<label class="check"><input id="claimRightsVerified" type="checkbox"> تأكيد حقوق استخدام هذا الادعاء وفق مراجعة الوثيقة</label>'+
      '<label class="check"><input id="claimApproved" type="checkbox"> اعتماد هذا الادعاء للاستخدام التشخيصي</label>'+
      '<button id="savePageClaim" class="btn" type="button">حفظ الادعاء المرتبط بالصفحة</button><p id="pageClaimStatus" role="status" aria-live="polite"></p>'+
      '<h3>الادعاءات المسجلة</h3><div id="reviewedClaimsList"></div>');
    review.id="documentReviewWorkspace";
    const research=panel("مساحة البحث الفني — Deep Research",
      '<p class="hint">استرجاع محلي من الوثائق المفهرسة مع إظهار المصدر والصفحة. هذه الواجهة لا تدّعي تنفيذ بحث ويب أو توليد استنتاجات نموذجية.</p>'+
      field("سؤال البحث","researchQuery","textarea","مثال: أسباب Cavitation وشروط التحقق منها في المضخات")+
      '<button id="runDocumentResearch" class="btn" type="button">استرجاع مصادر البحث</button><div id="documentResearchResults" aria-live="polite"></div>');
    research.id="documentResearchWorkspace";
    const study=panel("مساحة الدراسة — Study",
      '<p class="hint">استخراج مقاطع مرجعية للدراسة، مع حفظ مصدر كل مقطع وصفحته. لا تخلط هذه النتائج مع الأدلة المعتمدة للتشخيص.</p>'+
      field("موضوع الدراسة","studyQuery","textarea","اكتب المفهوم أو المهارة التي تريد دراستها")+
      '<button id="runDocumentStudy" class="btn" type="button">إنشاء مجموعة دراسة من المصادر</button><div id="documentStudyResults" aria-live="polite"></div>');
    study.id="documentStudyWorkspace";
    host.append(review,research,study);
    $("saveDocumentReview").addEventListener("click",async()=>{
      try{
        const id=$("reviewDocumentSelect").value;if(!id)throw new Error("اختر وثيقة أولًا.");
        await library().saveDocumentReview(id,{manufacturer:$("reviewManufacturer").value,equipmentFamily:$("reviewFamily").value,edition:$("reviewEdition").value,sourceUrl:$("reviewSourceUrl").value,rightsEvidence:$("reviewRightsEvidence").value,rightsVerified:$("reviewRightsVerified").checked,reviewer:$("reviewReviewer").value,notes:$("reviewNotes").value,approved:$("reviewDocumentApproved").checked});
        status("documentReviewStatus","حُفظت مراجعة الوثيقة. الاعتماد لا يفعّل التشخيص قبل اعتماد ادعاء محدد.");
        await fillDocuments();
      }catch(e){status("documentReviewStatus",e.message);}
    });
    $("savePageClaim").addEventListener("click",async()=>{
      try{
        const id=$("reviewDocumentSelect").value;if(!id)throw new Error("اختر وثيقة أولًا.");
        const claim=await library().saveClaim({documentId:id,pageNumber:$("claimPage").value,text:$("claimText").value,equipmentFamily:$("claimFamily").value,modelApplicability:$("claimModel").value,evidenceClass:$("claimEvidenceClass").value,reviewer:$("claimReviewer").value,notes:$("claimNotes").value,rightsVerified:$("claimRightsVerified").checked,approved:$("claimApproved").checked});
        status("pageClaimStatus",claim.reviewStatus==="approved"?"اعتمد الادعاء والحقوق؛ أصبح مؤهلًا لمسار التشخيص بعد اجتياز بوابة الوثيقة.":"حُفظ الادعاء كمراجَع، لكنه غير مؤهل للتشخيص.");
        await fillDocuments();
      }catch(e){status("pageClaimStatus",e.message);}
    });
    $("runDocumentResearch").addEventListener("click",()=>runWorkspace("researchQuery","documentResearchResults","research"));
    $("runDocumentStudy").addEventListener("click",()=>runWorkspace("studyQuery","documentStudyResults","study"));
    fillDocuments().catch(e=>status("documentReviewStatus",e.message));
  }
  async function runWorkspace(inputId,outputId,consumer){
    const out=$(outputId),query=$(inputId).value.trim();if(!query){out.textContent="أدخل سؤالًا أو موضوعًا أولًا.";return;}
    const api=retrieval();if(!api){out.textContent="طبقة الاسترجاع غير متاحة.";return;}
    out.textContent="جارٍ البحث في الفهرس المحلي…";
    const result=await api.retrieveFor(consumer,query);
    if(!result.ok){out.textContent="تعذر الاسترجاع: "+result.status;return;}
    if(!result.results.length){out.textContent=consumer==="diagnostics"?"لا توجد ادعاءات معتمدة تطابق البحث.":"لم يُعثر على مقاطع مطابقة.";return;}
    out.innerHTML=result.results.map((r,i)=>'<article class="document-result"><div class="document-result-meta"><strong>'+escapeHtml(r.documentTitle)+'</strong><span>الصفحة '+Number(r.sourceRef.pageNumber||0)+'</span></div><p>'+escapeHtml(r.text)+'</p><p class="hint">'+escapeHtml(r.citation||"")+' | '+escapeHtml(r.evidenceRole||"")+' | '+escapeHtml(r.extractionMethod||"")+'</p><button class="btn secondary" type="button" data-workspace-source="'+i+'">فتح المصدر عند الصفحة</button></article>').join("");
    out.querySelectorAll("[data-workspace-source]").forEach(b=>{const item=result.results[Number(b.dataset.workspaceSource)];b.addEventListener("click",()=>library().openSourcePage(item.sourceRef.documentId,item.sourceRef.pageNumber));});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();