(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  function mount() {
    const anchor = $("dynamicSessionPanel");
    if (!anchor || $("diagnosticDocumentEvidence")) return;
    const panel = document.createElement("section");
    panel.id = "diagnosticDocumentEvidence";
    panel.className = "result";
    panel.innerHTML =
      '<h3>الأدلة المعتمدة من وثائق PDF</h3>' +
      '<p class="hint">يسترجع هذا الجزء الادعاءات التي روجعت مع صفحة PDF ونطاق المعدة وحقوق الاستخدام. لا يستخدم نصوص OCR الخام كدليل، ولا يؤكد سبب العطل أو يتجاوز بوابة السلامة.</p>' +
      '<button type="button" class="btn secondary" id="retrieveDiagnosticClaims">استرجاع الأدلة المعتمدة فقط</button>' +
      '<div id="diagnosticClaimResults" aria-live="polite"></div>';
    anchor.insertAdjacentElement("afterend", panel);
    $("retrieveDiagnosticClaims").addEventListener("click", async () => {
      const output = $("diagnosticClaimResults");
      const equipment = String($("aiMachine")?.value || "").trim();
      const model = String($("aiModel")?.value || "").trim();
      const query = [$("aiSymptom")?.value, $("aiCode")?.value, $("aiObservations")?.value]
        .filter(Boolean).join(" ");
      if (!equipment || !query.trim()) {
        output.textContent = "أدخل نوع المعدة والعَرَض أولًا.";
        return;
      }
      const api = window.MaintenanceDocumentRetrieval;
      if (!api) {
        output.textContent = "طبقة استرجاع الوثائق غير متاحة.";
        return;
      }
      output.textContent = "جارٍ البحث في الادعاءات المعتمدة فقط…";
      const result = await api.forDiagnostics(query, { equipment, model });
      if (!result.ok) {
        output.textContent = "تعذر استرجاع الأدلة: " + result.status;
        return;
      }
      if (!result.results.length) {
        output.textContent = "لا توجد ادعاءات معتمدة مطابقة لهذا النطاق. المقاطع الخام والوثائق غير المراجعة لا تدخل التشخيص.";
        return;
      }
      output.innerHTML = result.results.map((item, index) => {
        const ref = item.sourceRef || {};
        const pageLabel = "PDF page " + Number(ref.pageNumber || 0) +
          (ref.printedPageNumber ? " | printed page " + escapeHtml(ref.printedPageNumber) : "");
        return '<article class="document-result"><div class="document-result-meta"><strong>' +
          escapeHtml(item.documentTitle) + '</strong><span>' + pageLabel + '</span></div><p>' +
          escapeHtml(item.text) + '</p><p class="hint">المصنّع: ' + escapeHtml(ref.manufacturer || "غير محدد") +
          ' | عائلة المعدة: ' + escapeHtml(ref.equipmentFamily || "غير محددة") +
          ' | الموديل: ' + escapeHtml(ref.modelApplicability || "غير محدد") +
          '</p><p class="hint">الفئة: ' + escapeHtml(ref.evidenceClass || "غير محددة") +
          ' | المراجع: ' + escapeHtml(ref.reviewer || "غير محدد") +
          ' | ' + escapeHtml(item.citation || "") + '</p><button type="button" class="btn secondary" data-diagnostic-source="' +
          index + '">فتح صفحة المصدر الأصلية</button></article>';
      }).join("");
      output.querySelectorAll("[data-diagnostic-source]").forEach(button => {
        const item = result.results[Number(button.dataset.diagnosticSource)];
        button.addEventListener("click", () =>
          window.MaintenanceDocumentLibrary.openSourcePage(item.sourceRef.documentId, item.sourceRef.pageNumber)
        );
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
