(function () {
  "use strict";

  const CORE = window.MaintenanceDocumentCore;
  if (!CORE) return;
  const DB_NAME = "maintenance-ai-document-library";
  const DB_VERSION = 1;
  const PDFJS_VERSION = "4.10.38";
  const MAX_FILE_BYTES = 40 * 1024 * 1024;
  const MAX_PAGES = 1200;
  const MAX_RESULTS = 12;
  let dbPromise;
  let pdfjsPromise;
  let currentObjectUrls = [];

  const $ = id => document.getElementById(id);
  const status = message => { const el = $("documentLibraryStatus"); if (el) el.textContent = message; };

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("هذا المتصفح لا يدعم IndexedDB."));
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains("documents")) database.createObjectStore("documents", { keyPath: "id" });
        if (!database.objectStoreNames.contains("chunks")) {
          const chunks = database.createObjectStore("chunks", { keyPath: "id" });
          chunks.createIndex("documentId", "documentId", { unique: false });
        }
        if (!database.objectStoreNames.contains("postings")) database.createObjectStore("postings", { keyPath: "term" });
        if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", { keyPath: "documentId" });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("تعذر فتح قاعدة الوثائق."));
      request.onblocked = () => reject(new Error("قاعدة الوثائق مشغولة في تبويب آخر. أغلق التبويبات القديمة ثم أعد المحاولة."));
    });
    return dbPromise;
  }

  function requestResult(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("فشل طلب قاعدة البيانات."));
    });
  }

  async function getAll(storeName) {
    const db = await openDb();
    const tx = db.transaction(storeName, "readonly");
    return requestResult(tx.objectStore(storeName).getAll());
  }

  async function loadPdfJs() {
    if (window.pdfjsLib) return window.pdfjsLib;
    if (pdfjsPromise) return pdfjsPromise;
    pdfjsPromise = import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" + PDFJS_VERSION + "/pdf.min.mjs")
      .then(lib => {
        lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/" + PDFJS_VERSION + "/pdf.worker.min.mjs";
        return lib;
      })
      .catch(error => {
        pdfjsPromise = null;
        throw new Error("تعذر تحميل محرك قراءة PDF. اتصل بالإنترنت مرة واحدة ثم أعد المحاولة. " + (error && error.message ? error.message : ""));
      });
    return pdfjsPromise;
  }

  async function sha256(buffer) {
    if (!window.crypto || !window.crypto.subtle) throw new Error("يلزم فتح التطبيق عبر HTTPS لحساب بصمة الملف والتحقق من التكرار.");
    const digest = await window.crypto.subtle.digest("SHA-256", buffer);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function extractPageLines(items) {
    const lines = [];
    let current = "";
    let previousY = null;
    for (const item of items || []) {
      if (!item || typeof item.str !== "string" || !item.str.trim()) continue;
      const y = item.transform && Number.isFinite(item.transform[5]) ? item.transform[5] : null;
      if (previousY !== null && y !== null && Math.abs(previousY - y) > 2.5 && current.trim()) {
        lines.push(current.trim());
        current = "";
      }
      const part = item.str.trim();
      current += (current && !/[\s-]$/.test(current) && !/^[،؛:.)\]}]/.test(part) ? " " : "") + part;
      if (y !== null) previousY = y;
    }
    if (current.trim()) lines.push(current.trim());
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  async function parsePdf(file, fileBuffer, documentId) {
    const pdfjs = await loadPdfJs();
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(fileBuffer), isEvalSupported: false, useWorkerFetch: false });
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    if (!pageCount || pageCount > MAX_PAGES) {
      await pdf.destroy();
      throw new Error("عدد الصفحات غير مدعوم. الحد الحالي " + MAX_PAGES + " صفحة.");
    }
    const chunks = [];
    let pagesWithText = 0;
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
      status("استخراج الصفحة " + pageNumber + " من " + pageCount + "…");
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent({ includeMarkedContent: false });
      const pageText = extractPageLines(content.items);
      page.cleanup();
      if (!pageText || pageText.length < 8) continue;
      pagesWithText++;
      const pageChunks = CORE.chunkPage(pageText);
      pageChunks.forEach((part, index) => {
        chunks.push({
          id: documentId + ":p" + pageNumber + ":c" + index,
          documentId,
          pageNumber,
          chunkIndex: index,
          text: part.text,
          tokens: part.tokens,
          charStart: part.start,
          charEnd: part.end
        });
      });
    }
    await pdf.destroy();
    if (!chunks.length) throw new Error("لم يُستخرج نص قابل للبحث. قد يكون PDF ممسوحًا ضوئيًا كصور؛ OCR غير مفعّل في هذه النسخة.");
    return { pageCount, pagesWithText, chunks };
  }

  async function persistDocument(documentRecord, chunks) {
    const db = await openDb();
    const grouped = CORE.buildPostings(chunks);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["documents", "chunks", "postings", "files"], "readwrite");
      tx.objectStore("documents").put(documentRecord);
      tx.objectStore("files").put({ documentId: documentRecord.id, blob: documentRecord.fileBlob });
      const chunkStore = tx.objectStore("chunks");
      chunks.forEach(chunk => chunkStore.put(chunk));
      const postingStore = tx.objectStore("postings");
      for (const [term, ids] of grouped) {
        const get = postingStore.get(term);
        get.onsuccess = () => {
          const old = get.result && Array.isArray(get.result.chunkIds) ? get.result.chunkIds : [];
          postingStore.put({ term, chunkIds: [...new Set(old.concat(ids))] });
        };
      }
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("تعذر حفظ الوثيقة. قد تكون مساحة التخزين غير كافية."));
      tx.onabort = () => reject(tx.error || new Error("أُلغي حفظ الوثيقة."));
    });
  }

  async function importFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) throw new Error("اختر ملف PDF فقط.");
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) throw new Error("حجم الملف يجب ألا يتجاوز 40 ميغابايت.");
    const fileBuffer = await file.arrayBuffer();
    status("حساب بصمة الملف والتحقق من التكرار…");
    const digest = await sha256(fileBuffer);
    const existing = (await getAll("documents")).find(item => item.sha256 === digest);
    if (existing) {
      status("هذه الوثيقة موجودة مسبقًا: " + existing.title);
      return;
    }
    const id = "doc-" + digest.slice(0, 24);
    const extracted = await parsePdf(file, fileBuffer, id);
    const record = {
      id,
      title: file.name.replace(/\.pdf$/i, ""),
      fileName: file.name,
      fileSize: file.size,
      sha256: digest,
      importedAt: new Date().toISOString(),
      pageCount: extracted.pageCount,
      pagesWithText: extracted.pagesWithText,
      chunkCount: extracted.chunks.length,
      parser: "pdf.js-" + PDFJS_VERSION,
      extractionStatus: extracted.pagesWithText < extracted.pageCount ? "partial-text-pages" : "text-extracted",
      rightsStatus: "user-supplied-rights-not-verified",
      eligibleForDiagnosis: false
    };
    status("حفظ النص والفهرس والملف محليًا…");
    await persistDocument(Object.assign({}, record, { fileBlob: file.slice(0, file.size, "application/pdf") }), extracted.chunks);
    status("اكتمل الاستيراد: " + record.title + " — " + record.pagesWithText + "/" + record.pageCount + " صفحة نصية، " + record.chunkCount + " مقطعًا. لم تُرسل الوثيقة إلى خادم.");
    await renderDocuments();
  }

  async function searchDocuments(query) {
    const terms = [...new Set(CORE.tokenize(query))];
    if (!terms.length) return [];
    const db = await openDb();
    const postings = await new Promise((resolve, reject) => {
      const tx = db.transaction("postings", "readonly");
      const store = tx.objectStore("postings");
      const result = [];
      let remaining = terms.length;
      terms.forEach(term => {
        const request = store.get(term);
        request.onsuccess = () => {
          if (request.result) result.push(...request.result.chunkIds);
          if (--remaining === 0) resolve([...new Set(result)]);
        };
        request.onerror = () => reject(request.error);
      });
      if (!remaining) resolve([]);
    });
    if (!postings.length) return [];
    const chunks = await new Promise((resolve, reject) => {
      const tx = db.transaction("chunks", "readonly");
      const store = tx.objectStore("chunks");
      const found = [];
      let remaining = postings.length;
      postings.forEach(id => {
        const request = store.get(id);
        request.onsuccess = () => {
          if (request.result) found.push(request.result);
          if (--remaining === 0) resolve(found);
        };
        request.onerror = () => reject(request.error);
      });
    });
    const ranked = CORE.rankChunks(query, chunks, MAX_RESULTS);
    const documents = await getAll("documents");
    const byId = new Map(documents.map(doc => [doc.id, doc]));
    return ranked.map(item => {
      const doc = byId.get(item.doc.documentId);
      return Object.assign({}, item.doc, {
        score: item.score,
        matchedTerms: item.matched,
        documentTitle: doc ? doc.title : item.doc.documentId,
        fileName: doc ? doc.fileName : "",
        citation: CORE.makeCitation(doc, item.doc.pageNumber),
        extractionStatus: doc ? doc.extractionStatus : "unknown"
      });
    });
  }

  async function openSourcePage(documentId, pageNumber) {
    const docs = await getAll("documents");
    const doc = docs.find(item => item.id === documentId);
    const db = await openDb();
    const fileRecord = await requestResult(db.transaction("files", "readonly").objectStore("files").get(documentId));
    if (!doc || !fileRecord || !fileRecord.blob) throw new Error("الملف الأصلي غير متاح محليًا.");
    const url = URL.createObjectURL(fileRecord.blob);
    currentObjectUrls.push(url);
    const opened = window.open(url + "#page=" + Number(pageNumber || 1), "_blank", "noopener");
    if (!opened) status("منع المتصفح فتح نافذة جديدة. اسمح بالنوافذ المنبثقة لفتح PDF.");
  }

  async function deleteDocument(documentId) {
    const db = await openDb();
    const chunks = await new Promise((resolve, reject) => {
      const tx = db.transaction("chunks", "readonly");
      const request = tx.objectStore("chunks").index("documentId").getAll(documentId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    const remaining = (await getAll("chunks")).filter(chunk => chunk.documentId !== documentId);
    const documents = (await getAll("documents")).filter(doc => doc.id !== documentId);
    const postings = CORE.buildPostings(remaining);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["documents", "chunks", "postings", "files"], "readwrite");
      tx.objectStore("documents").delete(documentId);
      tx.objectStore("files").delete(documentId);
      const chunkStore = tx.objectStore("chunks");
      chunks.forEach(chunk => chunkStore.delete(chunk.id));
      const postingStore = tx.objectStore("postings");
      postingStore.clear();
      for (const [term, ids] of postings) postingStore.put({ term, chunkIds: ids });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error("تعذر حذف الوثيقة."));
    });
    await renderDocuments();
  }

  async function renderDocuments() {
    const list = $("documentLibraryList");
    if (!list) return;
    const docs = await getAll("documents");
    if (!docs.length) {
      list.innerHTML = '<p class="hint">لا توجد وثائق مستوردة بعد.</p>';
      return;
    }
    list.innerHTML = docs.map(doc => '<article class="document-card" data-doc="' + escapeHtml(doc.id) + '">' +
      '<div><strong>' + escapeHtml(doc.title) + '</strong><p class="hint">' +
      escapeHtml(doc.fileName) + ' • ' + doc.pageCount + ' صفحة • ' + doc.chunkCount + ' مقطع • ' +
      new Date(doc.importedAt).toLocaleDateString() + '</p><p class="hint">' +
      (doc.extractionStatus === "text-extracted" ? "استخراج نصي كامل" : "استخراج جزئي؛ بعض الصفحات بلا نص") +
      ' — غير معتمد فنيًا، وغير مؤهل للتشخيص تلقائيًا.</p></div>' +
      '<div class="actions"><button type="button" class="btn secondary" data-open-doc="' + escapeHtml(doc.id) + '">فتح PDF</button>' +
      '<button type="button" class="btn danger" data-delete-doc="' + escapeHtml(doc.id) + '">حذف</button></div></article>').join("");
    list.querySelectorAll("[data-open-doc]").forEach(button => button.addEventListener("click", () => openSourcePage(button.dataset.openDoc, 1).catch(error => status(error.message))));
    list.querySelectorAll("[data-delete-doc]").forEach(button => button.addEventListener("click", () => {
      if (window.confirm("حذف الوثيقة ونصوصها المفهرسة من هذا الجهاز؟")) deleteDocument(button.dataset.deleteDoc).catch(error => status(error.message));
    }));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function renderResults(results) {
    const output = $("documentSearchResults");
    if (!output) return;
    if (!results.length) {
      output.innerHTML = '<p class="hint">لا توجد مقاطع مطابقة. جرّب كلمات أخرى أو مرادفًا فنيًا.</p>';
      return;
    }
    output.innerHTML = results.map((item, index) => {
      const excerpt = item.text.length > 620 ? item.text.slice(0, 620) + "…" : item.text;
      return '<article class="document-result"><div class="document-result-meta"><strong>' + escapeHtml(item.documentTitle) +
        '</strong><span>' + escapeHtml("الصفحة " + item.pageNumber) + '</span></div><p>' + escapeHtml(excerpt) +
        '</p><p class="hint">المصدر: ' + escapeHtml(item.citation) + ' — المقطع مستخرج آليًا ولم تتم مراجعته فنيًا.</p>' +
        '<button class="btn secondary" type="button" data-open-result="' + index + '">فتح المصدر عند الصفحة</button></article>';
    }).join("");
    output.querySelectorAll("[data-open-result]").forEach(button => {
      button.addEventListener("click", () => {
        const item = results[Number(button.dataset.openResult)];
        if (item) openSourcePage(item.documentId, item.pageNumber).catch(error => status(error.message));
      });
    });
  }

  function init() {
    if (!$("documentImportForm")) return;
    $("documentImportForm").addEventListener("submit", async event => {
      event.preventDefault();
      const input = $("documentPdfFile");
      const file = input && input.files && input.files[0];
      if (!file) return status("اختر ملف PDF أولًا.");
      const button = $("documentImportButton");
      button.disabled = true;
      try { await importFile(file); input.value = ""; }
      catch (error) { status(error && error.message ? error.message : "فشل استيراد الوثيقة."); }
      finally { button.disabled = false; }
    });
    $("documentSearchForm").addEventListener("submit", async event => {
      event.preventDefault();
      const query = $("documentSearchQuery").value.trim();
      if (!query) return status("اكتب كلمات البحث أولًا.");
      try {
        status("البحث في فهرس الوثائق المحلي…");
        const results = await searchDocuments(query);
        renderResults(results);
        status("نتائج البحث: " + results.length + ". الاسترجاع محلي ولا يرسل نصوص الوثائق.");
      } catch (error) { status(error && error.message ? error.message : "تعذر البحث."); }
    });
    renderDocuments().catch(error => status(error.message));
  }

  window.MaintenanceDocumentLibrary = {
    search: searchDocuments,
    list: getAll.bind(null, "documents"),
    openSourcePage,
    importFile
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
