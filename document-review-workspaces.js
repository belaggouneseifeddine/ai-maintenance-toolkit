(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const library = () => window.MaintenanceDocumentLibrary;
  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const status = (id, message) => { const el = $(id); if (el) el.textContent = message; };

  async function refreshDocuments() {
    const docs = await library().list();
    const select = $("reviewDocumentSelect");
    if (select) {
      const previous = select.value;
      select.innerHTML = '<option value="">اختر وثيقة</option>' + docs.map(doc =>
        '<option value="' + escapeHtml(doc.id) + '">' + escapeHtml(doc.title) + ' — ' + escapeHtml(doc.fileName) + '</option>'
      ).join("");
      if (docs.some(doc => doc.id === previous)) select.value = previous;
    }
    const claims = await library().listClaims();
    const list = $("reviewedClaimsList");
    if (list) {
      list.innerHTML = claims.length ? claims.map(claim =>
        '<article class="document-result"><strong>' + escapeHtml(claim.text.slice(0, 180)) + '</strong>' +
        '<p class="hint">PDF page ' + claim.pageNumber +
        (claim.printedPageNumber ? ' | printed page ' + escapeHtml(claim.printedPageNumber) : '') +
        ' | ' + escapeHtml(claim.reviewStatus) + ' | rights: ' + escapeHtml(claim.rightsStatus) + '</p>' +
        '<button type="button" class="btn secondary" data-open-claim="' + escapeHtml(claim.documentId) +
        '" data-page="' + Number(claim.pageNumber) + '">فتح الصفحة الأصلية</button></article>'
      ).join("") : '<p class="hint">لا توجد ادعاءات مسجلة حتى الآن.</p>';
      list.querySelectorAll("[data-open-claim]").forEach(button => {
        button.addEventListener("click", () => library().openSourcePage(button.dataset.openClaim, Number(button.dataset.page)));
      });
    }
  }

  function mount() {
    const host = $("documentLibraryPanel");
    if (!host || $("documentReviewWorkspace")) return;
    const section = document.createElement("section");
    section.id = "documentReviewWorkspace";
    section.className = "card document-workspace";
    section.innerHTML =
      '<h2>مراجعة الوثائق والحقوق والأدلة التشخيصية</h2>' +
      '<p class="hint">كل شيء يُحفظ محليًا على هذا الجهاز. لا يصبح نص PDF دليلًا تشخيصيًا بمجرد استخراجه. يجب مراجعة الوثيقة والحقوق والادعاء والصفحة ونطاق المعدة كلٌّ على حدة.</p>' +
      '<label for="reviewDocumentSelect">الوثيقة</label><select id="reviewDocumentSelect"><option value="">اختر وثيقة</option></select>' +
      '<label for="reviewManufacturer">الشركة المصنّعة</label><input id="reviewManufacturer" placeholder="مثال: Grundfos / ABB / Schneider Electric">' +
      '<label for="reviewFamily">عائلة المعدة</label><input id="reviewFamily" placeholder="مثال: centrifugal pump / مضخة طرد مركزي">' +
      '<label for="reviewEdition">الإصدار أو السنة</label><input id="reviewEdition" placeholder="رقم الإصدار أو سنة النشر">' +
      '<label for="reviewSourceUrl">رابط المصدر الأصلي (إن وجد)</label><input id="reviewSourceUrl" type="url" placeholder="https://...">' +
      '<label for="reviewRightsEvidence">دليل حقوق الاستخدام / الترخيص</label><textarea id="reviewRightsEvidence" rows="2" placeholder="رابط الترخيص أو إثبات الملكية أو إذن المعالجة"></textarea>' +
      '<label class="check"><input id="reviewRightsVerified" type="checkbox"> راجعت حقوق الاستخدام وتسمح بالمعالجة المقصودة</label>' +
      '<label for="reviewReviewer">المراجع</label><input id="reviewReviewer" placeholder="اسم أو صفة المراجع">' +
      '<label for="reviewNotes">ملاحظات المراجعة وحدود الانطباق</label><textarea id="reviewNotes" rows="3" placeholder="ما الذي تم التحقق منه؟ وما القيود؟"></textarea>' +
      '<label class="check"><input id="reviewDocumentApproved" type="checkbox"> اعتماد الوثيقة بعد المراجعة الفنية والحقوقية</label>' +
      '<button type="button" class="btn" id="saveDocumentReview">حفظ مراجعة الوثيقة</button><p id="documentReviewStatus" role="status" aria-live="polite"></p>' +
      '<hr><h3>استخراج ادعاء تشخيصي من صفحة محددة</h3>' +
      '<p class="hint">اختر رقم صفحة PDF الأصلي، اعرض النص المستخرج، ثم اختصره إلى ادعاء واحد مع شروطه ووحداته. رقم الصفحة المطبوع يُسجل منفصلًا لأنه قد يختلف عن رقم صفحة الملف.</p>' +
      '<label for="claimPage">رقم صفحة PDF الأصلي (يبدأ من 1)</label><input id="claimPage" type="number" min="1" step="1" placeholder="مثال: 42">' +
      '<label for="claimPrintedPage">رقم الصفحة المطبوع داخل الدليل (اختياري)</label><input id="claimPrintedPage" placeholder="مثال: 37 أو A-12">' +
      '<button type="button" class="btn secondary" id="previewClaimPage">عرض النص المستخرج من الصفحة</button>' +
      '<button type="button" class="btn secondary" id="openClaimSourcePage">فتح صفحة PDF الأصلية للمقارنة</button>' +
      '<p id="claimPageStatus" class="hint" role="status" aria-live="polite"></p>' +
      '<pre id="claimPagePreview" class="document-page-preview"></pre>' +
      '<label class="check"><input id="claimOcrVisuallyVerified" type="checkbox" disabled> قارنت نص OCR مع صفحة PDF الأصلية، وتحققت من الأرقام والوحدات ورموز الموديلات</label>' +
      '<label for="claimText">الادعاء الفني بعد مراجعته</label><textarea id="claimText" rows="5" placeholder="اكتب ادعاءً محددًا، ولا تنقل فصلًا كاملًا. احتفظ بالشروط والقيم والوحدات."></textarea>' +
      '<label for="claimFamily">عائلة المعدة / نطاق الانطباق</label><input id="claimFamily" placeholder="مثال: centrifugal pump">' +
      '<label for="claimModel">الموديل أو نطاقه (اكتب Generic فقط إذا كان الادعاء عامًا فعلًا)</label><input id="claimModel" placeholder="مثال: Grundfos CR / generic">' +
      '<label for="claimEvidenceClass">فئة المصدر</label><select id="claimEvidenceClass"><option value="manufacturer_manual">دليل مصنع</option><option value="manufacturer_bulletin">نشرة فنية للمصنع</option><option value="standard">معيار</option><option value="peer_reviewed">بحث محكّم</option><option value="public_technical_reference">مرجع فني عام</option><option value="field_case">حالة ميدانية</option></select>' +
      '<label for="claimReviewer">المراجع الفني للادعاء</label><input id="claimReviewer" placeholder="اسم أو صفة المراجع">' +
      '<label for="claimNotes">ملاحظات التحقق</label><textarea id="claimNotes" rows="3" placeholder="تحقق من النص والسياق والطراز والوحدات والصفحة."></textarea>' +
      '<label class="check"><input id="claimRightsVerified" type="checkbox"> حقوق هذا الادعاء مغطاة بمراجعة الوثيقة</label>' +
      '<label class="check"><input id="claimApproved" type="checkbox"> اعتماد هذا الادعاء للاستخدام التشخيصي</label>' +
      '<button type="button" class="btn" id="savePageClaim">حفظ الادعاء المرتبط بالصفحة</button><p id="pageClaimStatus" role="status" aria-live="polite"></p>' +
      '<h3>الادعاءات المسجلة</h3><div id="reviewedClaimsList"></div>';
    host.appendChild(section);

    let ocrSourcePageOpened = false;
    $("previewClaimPage").addEventListener("click", async () => {
      try {
        const id = $("reviewDocumentSelect").value;
        if (!id) throw new Error("اختر الوثيقة أولًا.");
        ocrSourcePageOpened = false;
        $("claimOcrVisuallyVerified").checked = false;
        $("claimOcrVisuallyVerified").disabled = true;
        const evidence = await library().getPageEvidence(id, $("claimPage").value);
        if (!evidence.chunks.length) throw new Error("لم يُستخرج نص لهذه الصفحة. فعّل OCR أو تحقق من جودة الصفحة.");
        $("claimPagePreview").textContent = evidence.text;
        $("claimText").value = evidence.text;
        const methods = [...new Set(evidence.chunks.map(chunk => chunk.extractionMethod))];
        const confidences = evidence.chunks.map(chunk => chunk.ocrConfidence).filter(Number.isFinite);
        const hasOcr = methods.includes("ocr");
        $("openClaimSourcePage").disabled = !hasOcr;
        status("claimPageStatus", "تم استخراج " + evidence.chunks.length + " مقطعًا من صفحة PDF " + evidence.pageNumber +
          " | الطريقة: " + methods.join(", ") +
          (confidences.length ? " | OCR confidence: " + Math.min(...confidences) + "–" + Math.max(...confidences) + "%" : "") +
          (hasOcr ? " | افتح الصفحة الأصلية للمقارنة قبل اعتماد الادعاء." : ""));
      } catch (error) {
        $("claimPagePreview").textContent = "";
        status("claimPageStatus", error.message);
      }
    });
    $("openClaimSourcePage").addEventListener("click", async () => {
      try {
        const id = $("reviewDocumentSelect").value;
        if (!id) throw new Error("اختر الوثيقة أولًا.");
        await library().openSourcePage(id, $("claimPage").value);
        ocrSourcePageOpened = true;
        $("claimOcrVisuallyVerified").disabled = false;
        status("claimPageStatus", "تم فتح صفحة PDF الأصلية. قارن النص بصريًا ثم فعّل تأكيد المراجعة.");
      } catch (error) {
        ocrSourcePageOpened = false;
        status("claimPageStatus", error.message);
      }
    });

    $("saveDocumentReview").addEventListener("click", async () => {
      try {
        const id = $("reviewDocumentSelect").value;
        if (!id) throw new Error("اختر وثيقة أولًا.");
        await library().saveDocumentReview(id, {
          manufacturer: $("reviewManufacturer").value,
          equipmentFamily: $("reviewFamily").value,
          edition: $("reviewEdition").value,
          sourceUrl: $("reviewSourceUrl").value,
          rightsEvidence: $("reviewRightsEvidence").value,
          rightsVerified: $("reviewRightsVerified").checked,
          reviewer: $("reviewReviewer").value,
          notes: $("reviewNotes").value,
          approved: $("reviewDocumentApproved").checked
        });
        status("documentReviewStatus", "تم حفظ المراجعة محليًا. يلزم اعتماد ادعاء محدد وصفحته قبل إتاحته للتشخيص.");
        await refreshDocuments();
      } catch (error) {
        status("documentReviewStatus", error.message);
      }
    });

    $("savePageClaim").addEventListener("click", async () => {
      try {
        const id = $("reviewDocumentSelect").value;
        if (!id) throw new Error("اختر وثيقة أولًا.");
        const claim = await library().saveClaim({
          documentId: id,
          pageNumber: $("claimPage").value,
          printedPageNumber: $("claimPrintedPage").value,
          text: $("claimText").value,
          equipmentFamily: $("claimFamily").value,
          modelApplicability: $("claimModel").value,
          evidenceClass: $("claimEvidenceClass").value,
          reviewer: $("claimReviewer").value,
          notes: $("claimNotes").value,
          rightsVerified: $("claimRightsVerified").checked,
          ocrVisuallyVerified: ocrSourcePageOpened && $("claimOcrVisuallyVerified").checked,
          approved: $("claimApproved").checked
        });
        status("pageClaimStatus", claim.reviewStatus === "approved"
          ? "تم اعتماد الادعاء بعد اجتياز مراجعة الوثيقة والحقوق."
          : "تم حفظ الادعاء كمراجَع، لكنه غير مؤهل للاستخدام التشخيصي.");
        await refreshDocuments();
      } catch (error) {
        status("pageClaimStatus", error.message);
      }
    });
    refreshDocuments().catch(error => status("documentReviewStatus", error.message));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();