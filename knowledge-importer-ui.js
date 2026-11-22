/* Accessible local-only knowledge import UI. No network or runtime publication. */
(function (root) {
  "use strict";
  function init() {
    const doc = root.document;
    const importer = root.MaintenanceKnowledgeImporter;
    const storage = root.MaintenanceKnowledgeStagingStore;
    if (!doc || !importer || !storage) return;
    const form = doc.getElementById("knowledgeImportForm");
    if (!form || form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    const status = doc.getElementById("knowledgeImportStatus");
    const list = doc.getElementById("knowledgeImportList");
    const say = message => { if (status) status.textContent = message; };

    function render(records) {
      if (!list) return;
      list.replaceChildren();
      if (!records.length) {
        const empty = doc.createElement("p");
        empty.className = "hint";
        empty.textContent = "لا توجد بيانات مستوردة في منطقة الاستقبال على هذا الجهاز.";
        list.appendChild(empty);
        return;
      }
      records.forEach(record => {
        const card = doc.createElement("article");
        card.className = "record";
        const heading = doc.createElement("h4");
        heading.textContent = record.source.title + " — " + record.source.sourceId;
        const detail = doc.createElement("p");
        detail.textContent = record.format.toUpperCase() + " · " + record.itemCount + " عناصر · " + record.createdAt;
        const gate = doc.createElement("p");
        gate.className = "hint";
        gate.textContent = "مرشح غير معتمد — غير متاح لمحرك التشخيص";
        const remove = doc.createElement("button");
        remove.type = "button";
        remove.className = "btn secondary";
        remove.textContent = "حذف من منطقة الاستقبال";
        remove.addEventListener("click", async () => {
          remove.disabled = true;
          try { await storage.remove(record.importId); await refresh(); say("تم حذف سجل الاستقبال المحلي."); }
          catch (_) { remove.disabled = false; say("تعذر حذف سجل الاستقبال."); }
        });
        card.append(heading, detail, gate, remove);
        list.appendChild(card);
      });
    }
    async function refresh() {
      try { render(await storage.list()); }
      catch (_) { say("تعذر الوصول إلى التخزين المحلي. تحقق من دعم IndexedDB ومساحة المتصفح."); }
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      const file = doc.getElementById("knowledgeImportFile")?.files?.[0];
      if (!file) { say("اختر ملفًا أولًا."); return; }
      if (file.size > importer.MAX_BYTES) { say("حجم الملف يتجاوز حد 5 MiB."); return; }
      const source = {
        sourceId: doc.getElementById("knowledgeSourceId").value.trim(),
        title: doc.getElementById("knowledgeSourceTitle").value.trim(),
        owner: doc.getElementById("knowledgeSourceOwner").value.trim(),
        url: doc.getElementById("knowledgeSourceUrl").value.trim(),
        version: doc.getElementById("knowledgeSourceVersion").value.trim(),
        sourceDate: doc.getElementById("knowledgeSourceDate").value.trim() || null,
        sourceType: doc.getElementById("knowledgeSourceType").value,
        codeLicense: doc.getElementById("knowledgeCodeLicense").value.trim(),
        dataLicense: doc.getElementById("knowledgeDataLicense").value.trim(),
        attribution: doc.getElementById("knowledgeAttribution").value.trim(),
        reuseStatus: doc.getElementById("knowledgeReuseStatus").value
      };
      const format = String(file.name.split(".").pop() || "").toLowerCase();
      const allowed = ["json", "csv", "md", "markdown", "txt"];
      if (!allowed.includes(format)) { say("الصيغ المدعومة: JSON وCSV وMarkdown وTXT. ملفات PDF تبقى في مكتبة الوثائق."); return; }
      const normalizedFormat = format === "md" ? "markdown" : format;
      const button = doc.getElementById("knowledgeImportButton");
      button.disabled = true;
      say("جارٍ قراءة الملف والتحقق من البيانات الوصفية...");
      try {
        const content = await file.text();
        const result = importer.importContent({ format: normalizedFormat, content, source });
        if (!result.ok) { say("رُفض الاستيراد: " + result.errors.join("، ")); return; }
        await storage.save(result);
        form.reset();
        say("تم حفظ " + result.itemCount + " عنصرًا في منطقة الاستقبال المحلية فقط. لم تُضف إلى قاعدة التشخيص.");
        await refresh();
      } catch (error) {
        say("فشل الاستيراد المحلي: " + String(error && error.message || error));
      } finally {
        button.disabled = false;
      }
    });
    refresh();
  }
  if (root.document) {
    if (root.document.readyState === "loading") root.document.addEventListener("DOMContentLoaded", init, { once: true });
    else init();
  }
  const api = Object.freeze({ init });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.MaintenanceKnowledgeImporterUI = api;
})(typeof window !== "undefined" ? window : globalThis);
