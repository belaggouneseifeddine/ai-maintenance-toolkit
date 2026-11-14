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
    const documentsById = new Map(docs.map(doc => [doc.id, doc]));
    const list = $("reviewedClaimsList");
    if (list) {
      list.innerHTML = claims.length ? claims.map(claim => {
        const doc = documentsById.get(claim.documentId);
        const currentReview = Boolean(doc) && claim.documentReviewRevision === Number(doc.reviewRevision || 0);
        const displayedStatus = currentReview ? claim.reviewStatus : "stale — document review changed; re-review required";
        return '<article class="document-result"><strong>' + escapeHtml(claim.text.slice(0, 180)) + '</strong>' +
        '<p class="hint">PDF page ' + claim.pageNumber +
        (claim.printedPageNumber ? ' | printed page ' + escapeHtml(claim.printedPageNumber) : '') +
        ' | ' + escapeHtml(displayedStatus) + ' | rights: ' + escapeHtml(claim.rightsStatus) + '</p>' +
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
      '<p class="hint">كل شيء يُحفظ محليًا على هذا الجهاز. لا يصبح نص PDF دليلًا تشخيصيًا بمجرد استخراجه. يجب مراجعة الوثيقة والحقوق والادعاء والصفحة ونطاق المعدة كلٌّ على حدة. أي تعديل لاحق على مراجعة الوثيقة أو حقوقها أو نطاقها يبطل اعتماد الادعاءات السابقة، ويلزم إعادة مراجعتها.</p>' +
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
      '<label class="check"><input id="claimSourcePageVerified" type="checkbox" disabled> قارنت الادعاء الفني بصفحة PDF الأصلية وتحققت من سياقه</label>' +
      '<p id="claimPageStatus" class="hint" role="status" aria-live="polite"></p>' +
      '<pre id="claimPagePreview" class="document-page-preview"></pre>' +
      '<p id="claimCriticalTokens" class="hint" aria-live="polite"></p>' +
      '<div id="claimKnowledgeCandidates" class="document-candidate-list" aria-live="polite"></div>' +
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

    let openedSourceKey = "";
    let previewedPageKey = "";
    let currentPageHasOcr = false;
    let currentKnowledgeCandidates = [];
    const candidateLabels = {
      safety: "سلامة", fault: "عطل", maintenance: "صيانة",
      procedure: "إجراء", specification: "مواصفة", component: "مكوّن",
      technical_reference: "مرجع فني"
    };
    const selectedPageKey = () => String($("reviewDocumentSelect").value || "") + ":" + String(Number($("claimPage").value));
    const selectedReviewKey = () => [
      selectedPageKey(),
      String($("claimText").value || "").trim(),
      String($("claimFamily").value || "").trim(),
      String($("claimModel").value || "").trim(),
      String($("claimEvidenceClass").value || "")
    ].join("|");
    function invalidateClaimReview() {
      if (!openedSourceKey) return;
      openedSourceKey = "";
      $("claimSourcePageVerified").checked = false;
      $("claimSourcePageVerified").disabled = true;
      $("claimOcrVisuallyVerified").checked = false;
      $("claimOcrVisuallyVerified").disabled = true;
      status("claimPageStatus", "تغيّر الادعاء أو نطاقه بعد فتح المصدر. أعد فتح الصفحة الأصلية ومراجعة النسخة النهائية قبل الاعتماد.");
    }
    ["claimText", "claimFamily", "claimModel", "claimEvidenceClass"].forEach(id => {
      $(id).addEventListener("input", invalidateClaimReview);
      $(id).addEventListener("change", invalidateClaimReview);
    });
    ["reviewDocumentSelect", "claimPage"].forEach(id => {
      $(id).addEventListener("change", () => {
        previewedPageKey = "";
        openedSourceKey = "";
        $("claimSourcePageVerified").checked = false;
        $("claimSourcePageVerified").disabled = true;
        $("claimOcrVisuallyVerified").checked = false;
        $("claimOcrVisuallyVerified").disabled = true;
        $("openClaimSourcePage").disabled = true;
      });
    });
    $("previewClaimPage").addEventListener("click", async () => {
      try {
        const id = $("reviewDocumentSelect").value;
        if (!id) throw new Error("اختر الوثيقة أولًا.");
        openedSourceKey = "";
        previewedPageKey = "";
        currentPageHasOcr = false;
        $("claimSourcePageVerified").checked = false;
        $("claimSourcePageVerified").disabled = true;
        $("claimOcrVisuallyVerified").checked = false;
        $("claimOcrVisuallyVerified").disabled = true;
        const evidence = await library().getPageEvidence(id, $("claimPage").value);
        if (!evidence.chunks.length) throw new Error("لم يُستخرج نص لهذه الصفحة. فعّل OCR أو تحقق من جودة الصفحة.");
        $("claimPagePreview").textContent = evidence.text;
        $("claimText").value = evidence.text;
        currentKnowledgeCandidates = Array.isArray(evidence.knowledgeCandidates) ? evidence.knowledgeCandidates : [];
        $("claimKnowledgeCandidates").innerHTML = currentKnowledgeCandidates.length
          ? '<h4>مقاطع مرشحة للمعرفة — تحتاج مراجعة</h4>' + currentKnowledgeCandidates.map((candidate, index) =>
            '<article class="document-result"><p class="hint">' +
            candidate.tags.map(tag => escapeHtml(candidateLabels[tag] || tag)).join(" • ") +
            ' | الصفحة ' + Number(candidate.pageNumber) +
            ' | مقاطع المصدر: ' + candidate.sourceChunkIds.length + '</p><p>' +
            escapeHtml(candidate.text) + '</p><button type="button" class="btn secondary" data-knowledge-candidate="' + index +
            '">استخدام كنص مسودة</button></article>'
          ).join("")
          : '<p class="hint">لم تُكتشف مقاطع مرشحة وفق قواعد الاستخراج الحالية. هذا لا يعني خلو الصفحة من المعرفة الفنية.</p>';
        $("claimCriticalTokens").textContent = evidence.criticalTokens.length
          ? "قيم ووحدات ورموز تستحق المقارنة مع الأصل: " + evidence.criticalTokens.join(" | ")
          : "لم يُكتشف نمط واضح لقيم ووحدات أو رموز فنية؛ تحقق من الصفحة الأصلية يدويًا.";
        const methods = [...new Set(evidence.chunks.map(chunk => chunk.extractionMethod))];
        const confidences = evidence.chunks.map(chunk => chunk.ocrConfidence).filter(Number.isFinite);
        currentPageHasOcr = methods.includes("ocr");
        previewedPageKey = selectedPageKey();
        $("openClaimSourcePage").disabled = false;
        status("claimPageStatus", "تم استخراج " + evidence.chunks.length + " مقطعًا من صفحة PDF " + evidence.pageNumber +
          " | الطريقة: " + methods.join(", ") +
          (confidences.length ? " | OCR confidence: " + Math.min(...confidences) + "–" + Math.max(...confidences) + "%" : "") +
          " | افتح الصفحة الأصلية وقارن الادعاء بالمصدر قبل اعتماده." +
          (currentPageHasOcr ? " | يتطلب OCR أيضًا تحققًا بصريًا من الأرقام والوحدات ورموز الموديل." : ""));
      } catch (error) {
        $("claimPagePreview").textContent = "";
        status("claimPageStatus", error.message);
      }
    });
    $("claimKnowledgeCandidates").addEventListener("click", event => {
      const button = event.target.closest("[data-knowledge-candidate]");
      if (!button) return;
      const candidate = currentKnowledgeCandidates[Number(button.dataset.knowledgeCandidate)];
      if (!candidate) return;
      $("claimText").value = candidate.text;
      $("claimNotes").value = "مسودة مستخرجة آليًا من الصفحة " + candidate.pageNumber +
        ". التصنيفات المقترحة: " + candidate.tags.join(", ") +
        ". لم تُعتمد؛ راجع السياق والموديل والوحدات والمصدر الأصلي.";
      openedSourceKey = "";
      $("claimSourcePageVerified").checked = false;
      $("claimSourcePageVerified").disabled = true;
      $("claimOcrVisuallyVerified").checked = false;
      $("claimOcrVisuallyVerified").disabled = true;
      status("claimPageStatus", "تم إدراج النص كمسودة فقط. افتح الصفحة الأصلية وراجع النص والسياق قبل أي اعتماد.");
    });
    $("openClaimSourcePage").addEventListener("click", async () => {
      try {
        const id = $("reviewDocumentSelect").value;
        if (!id) throw new Error("اختر الوثيقة أولًا.");
        if (!previewedPageKey || previewedPageKey !== selectedPageKey()) {
          throw new Error("اعرض نص صفحة PDF المحددة أولًا قبل فتح المصدر ومراجعته.");
        }
        const opened = await library().openSourcePage(id, $("claimPage").value);
        if (opened !== true) throw new Error("لم يتم فتح صفحة PDF الأصلية؛ لا تؤكد مراجعة OCR قبل عرضها.");
        openedSourceKey = selectedReviewKey();
        $("claimSourcePageVerified").disabled = false;
        if (currentPageHasOcr) $("claimOcrVisuallyVerified").disabled = false;
        status("claimPageStatus", "تم فتح صفحة PDF الأصلية. قارن الادعاء بالمصدر، ثم أكد مراجعة الصفحة. إذا كان النص مستخرجًا بـOCR فتحقق أيضًا من الأرقام والوحدات ورموز الموديل.");
      } catch (error) {
        openedSourceKey = "";
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
          sourcePageVerified: openedSourceKey === selectedReviewKey() && $("claimSourcePageVerified").checked,
          ocrVisuallyVerified: openedSourceKey === selectedReviewKey() && $("claimOcrVisuallyVerified").checked,
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