(function () {
  "use strict";

  const CORE = window.MaintenanceDocumentCore;
  if (!CORE) return;
  const DB_NAME = "maintenance-ai-document-library";
  const DB_VERSION = 3;
  const PDFJS_VERSION = "4.10.38";
  const TESSERACT_VERSION = "5.1.1";
  const MAX_FILE_BYTES = 40 * 1024 * 1024;
  const MAX_PAGES = 1200;
  const MAX_OCR_PAGES = 150;
  const MAX_OCR_PIXELS = 4000000;
  const MAX_RESULTS = 12;
  let dbPromise;
  let pdfjsPromise;
  let tesseractPromise;
  let currentObjectUrls = [];

  const $ = id => document.getElementById(id);
  const status = message => { const el = $("documentLibraryStatus"); if (el) el.textContent = message; };

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("هذا المتصفح لا يدعم IndexedDB."));
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = event => {
        const database = request.result;
        const upgradeTransaction = request.transaction;
        if (!database.objectStoreNames.contains("documents")) database.createObjectStore("documents", { keyPath: "id" });
        if (!database.objectStoreNames.contains("chunks")) {
          const chunks = database.createObjectStore("chunks", { keyPath: "id" });
          chunks.createIndex("documentId", "documentId", { unique: false });
        }
        if (!database.objectStoreNames.contains("postings")) database.createObjectStore("postings", { keyPath: "term" });
        if (!database.objectStoreNames.contains("files")) database.createObjectStore("files", { keyPath: "documentId" });
        if (!database.objectStoreNames.contains("claims")) { const claims = database.createObjectStore("claims", { keyPath: "id" }); claims.createIndex("documentId", "documentId", { unique: false }); }
        if (event.oldVersion < 2 && database.objectStoreNames.contains("documents")) {
          const documents = upgradeTransaction.objectStore("documents");
          const files = upgradeTransaction.objectStore("files");
          const cursorRequest = documents.openCursor();
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (!cursor) return;
            const record = cursor.value;
            if (record && record.fileBlob) {
              files.put({ documentId: record.id, blob: record.fileBlob });
              delete record.fileBlob;
              cursor.update(record);
            }
            cursor.continue();
          };
        }
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

  async function loadTesseract() {
    if (window.Tesseract) return window.Tesseract;
    if (tesseractPromise) return tesseractPromise;
    tesseractPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@" + TESSERACT_VERSION + "/dist/tesseract.min.js";
      script.async = true;
      script.onload = () => window.Tesseract
        ? resolve(window.Tesseract)
        : reject(new Error("لم يتم تحميل مكتبة OCR بصورة صحيحة."));
      script.onerror = () => reject(new Error("تعذر تحميل محرك OCR. تحقق من الاتصال بالإنترنت ثم أعد المحاولة."));
      document.head.appendChild(script);
    }).catch(error => {
      tesseractPromise = null;
      throw error;
    });
    return tesseractPromise;
  }

  async function renderPageForOcr(page) {
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(1.6, Math.sqrt(MAX_OCR_PIXELS / Math.max(1, baseViewport.width * baseViewport.height)));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.ceil(viewport.width));
    canvas.height = Math.max(1, Math.ceil(viewport.height));
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("تعذر تجهيز صورة الصفحة لمعالجة OCR.");
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas;
  }

  function appendPageChunks(chunks, documentId, pageNumber, pageText, extractionMethod, confidence) {
    const parts = CORE.chunkPage(pageText);
    parts.forEach((part, index) => {
      chunks.push({
        id: documentId + ":p" + pageNumber + ":c" + index,
        documentId,
        pageNumber,
        pdfPageNumber: pageNumber,
        chunkIndex: index,
        text: part.text,
        tokens: part.tokens,
        charStart: part.start,
        charEnd: part.end,
        extractionMethod,
        ocrConfidence: Number.isFinite(confidence) ? Math.round(confidence * 10) / 10 : null
      });
    });
    return parts.length;
  }

  async function parsePdf(file, fileBuffer, documentId, options) {
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
    let pagesWithOcr = 0;
    let ocrAttemptedPages = 0;
    let pagesNeedingOcr = 0;
    let pagesWithoutText = 0;
    let ocrSkippedByLimit = 0;
    let ocrWorker = null;
    let ocrCurrentPage = 0;
    const ocrEnabled = Boolean(options && options.ocrEnabled);
    const languages = String(options && options.ocrLanguages || "eng").split("+").filter(Boolean);
    try {
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        status("استخراج الصفحة " + pageNumber + " من " + pageCount + "…");
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent({ includeMarkedContent: false });
        let pageText = extractPageLines(content.items);
        let extractionMethod = "pdf-text";
        let confidence = null;
        if (!pageText || pageText.length < 8) {
          pagesNeedingOcr++;
          if (ocrEnabled && ocrAttemptedPages < MAX_OCR_PAGES) {
            ocrAttemptedPages++;
            if (!ocrWorker) {
              status("تحميل محرك OCR وبيانات اللغة: " + languages.join("+") + "…");
              const Tesseract = await loadTesseract();
              ocrWorker = await Tesseract.createWorker(languages, 1, {
                logger: message => {
                  if (message && message.status === "recognizing text") {
                    const percent = Number.isFinite(message.progress) ? Math.round(message.progress * 100) : 0;
                    status("OCR — الصفحة " + ocrCurrentPage + "/" + pageCount + " — " + percent + "%");
                  }
                }
              });
            }
            ocrCurrentPage = pageNumber;
            const canvas = await renderPageForOcr(page);
            const recognized = await ocrWorker.recognize(canvas);
            pageText = String(recognized && recognized.data && recognized.data.text || "").trim();
            confidence = recognized && recognized.data ? recognized.data.confidence : null;
            canvas.width = 1;
            canvas.height = 1;
            if (pageText.length >= 8) {
              pagesWithOcr++;
              extractionMethod = "ocr";
            } else {
              pageText = "";
              pagesWithoutText++;
            }
          } else {
            if (ocrEnabled) ocrSkippedByLimit++;
            pagesWithoutText++;
          }
        } else {
          pagesWithText++;
        }
        page.cleanup();
        if (pageText.length >= 8) appendPageChunks(chunks, documentId, pageNumber, pageText, extractionMethod, confidence);
      }
    } finally {
      if (ocrWorker) await ocrWorker.terminate();
      await pdf.destroy();
    }
    if (!chunks.length) throw new Error(ocrEnabled
      ? "لم يُستخرج نص قابل للبحث حتى بعد OCR. جرّب لغة OCR أخرى أو تحقق من جودة المسح."
      : "لم يُستخرج نص قابل للبحث. فعّل OCR للوثائق الممسوحة ضوئيًا.");
    return { pageCount, pagesWithText, pagesWithOcr, pagesNeedingOcr, pagesWithoutText, ocrAttemptedPages, ocrSkippedByLimit, ocrEnabled, ocrLanguages: languages, chunks };
  }

  async function persistDocument(documentRecord, chunks) {
    const db = await openDb();
    const grouped = CORE.buildPostings(chunks);
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["documents", "chunks", "postings", "files"], "readwrite");
      const metadata = Object.assign({}, documentRecord);
      const originalPdf = metadata.fileBlob;
      delete metadata.fileBlob;
      tx.objectStore("documents").put(metadata);
      tx.objectStore("files").put({ documentId: metadata.id, blob: originalPdf });
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
    const ocrEnabled = Boolean($("documentOcrEnabled") && $("documentOcrEnabled").checked);
    const ocrLanguages = $("documentOcrLanguage") ? $("documentOcrLanguage").value : "eng";
    const extracted = await parsePdf(file, fileBuffer, id, { ocrEnabled, ocrLanguages });
    const record = {
      id,
      title: file.name.replace(/\.pdf$/i, ""),
      fileName: file.name,
      fileSize: file.size,
      sha256: digest,
      importedAt: new Date().toISOString(),
      pageCount: extracted.pageCount,
      pagesWithText: extracted.pagesWithText,
      pagesWithOcr: extracted.pagesWithOcr,
      pagesNeedingOcr: extracted.pagesNeedingOcr,
      pagesWithoutText: extracted.pagesWithoutText,
      ocrAttemptedPages: extracted.ocrAttemptedPages,
      ocrSkippedByLimit: extracted.ocrSkippedByLimit,
      ocrLanguages: extracted.ocrEnabled ? extracted.ocrLanguages : [],
      chunkCount: extracted.chunks.length,
      parser: "pdf.js-" + PDFJS_VERSION,
      extractionStatus: extracted.pagesWithOcr > 0 ? (extracted.pagesWithText + extracted.pagesWithOcr < extracted.pageCount ? "partial-text-and-ocr" : "text-and-ocr") : (extracted.pagesWithText < extracted.pageCount ? "partial-text-pages" : "text-extracted"),
      rightsStatus: "user-supplied-rights-not-verified",
      eligibleForDiagnosis: false
    };
    status("حفظ النص والفهرس والملف محليًا…");
    await persistDocument(Object.assign({}, record, { fileBlob: file.slice(0, file.size, "application/pdf") }), extracted.chunks);
    status("اكتمل الاستيراد: " + record.title + " — نص PDF: " + record.pagesWithText + " صفحة، OCR: " + record.pagesWithOcr + " صفحة، بلا نص: " + record.pagesWithoutText + " صفحة، " + record.chunkCount + " مقطعًا. لم تُرسل الوثيقة إلى خادم." + (record.ocrSkippedByLimit ? " تم تجاوز OCR لعدد " + record.ocrSkippedByLimit + " صفحة بسبب حد الهاتف." : ""));
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
        sourceUrl: doc ? doc.sourceUrl || null : null,
        manufacturer: doc ? doc.manufacturer || null : null,
        equipmentFamily: doc ? doc.equipmentFamily || null : null,
        modelApplicability: doc ? doc.modelApplicability || null : null,
        edition: doc ? doc.edition || null : null,
        citation: CORE.makeCitation(doc, item.doc.pageNumber),
        sha256: doc ? doc.sha256 : null,
        rightsStatus: doc ? doc.rightsStatus : "unknown",
        reviewStatus: doc ? doc.reviewStatus || "unreviewed" : "unknown",
        evidenceClass: doc ? doc.evidenceClass || null : null,
        eligibleForDiagnosis: doc ? doc.eligibleForDiagnosis === true : false,
        extractionStatus: doc ? doc.extractionStatus : "unknown",
        extractionMethod: item.doc.extractionMethod || "unknown",
        ocrConfidence: item.doc.ocrConfidence == null ? null : item.doc.ocrConfidence
      });
    });
  }

  async function openSourcePage(documentId, pageNumber) {
    const docs = await getAll("documents");
    const doc = docs.find(item => item.id === documentId);
    if (!doc) throw new Error("الوثيقة غير موجودة في المكتبة المحلية.");
    const targetPage = CORE.normalizePageNumber(pageNumber, doc.pageCount);
    if (!targetPage) throw new Error("رقم صفحة PDF غير صالح لهذه الوثيقة.");
    const db = await openDb();
    const fileRecord = await requestResult(db.transaction("files", "readonly").objectStore("files").get(documentId));
    if (!fileRecord || !fileRecord.blob) throw new Error("الملف الأصلي غير متاح محليًا.");
    const viewer = window.open("about:blank", "_blank");
    if (!viewer) {
      status("اسمح بالنوافذ المنبثقة لفتح ملف PDF.");
      return;
    }
    try {
      viewer.opener = null;
      const url = URL.createObjectURL(fileRecord.blob);
      currentObjectUrls.push(url);
      viewer.location.replace(url + "#page=" + targetPage);
    } catch (error) {
      try { viewer.close(); } catch (_) {}
      throw error;
    }
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
      const tx = db.transaction(["documents", "chunks", "postings", "files", "claims"], "readwrite");
      tx.objectStore("documents").delete(documentId);
      const claimStore = tx.objectStore("claims");
      const claimCursor = claimStore.index("documentId").openCursor(IDBKeyRange.only(documentId));
      claimCursor.onsuccess = () => { const cursor = claimCursor.result; if (cursor) { cursor.delete(); cursor.continue(); } };
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
      ("استخراج نص PDF: " + (doc.pagesWithText || 0) + " صفحة، OCR: " + (doc.pagesWithOcr || 0) + " صفحة، بلا نص: " + (doc.pagesWithoutText || 0)) +
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
        '</p><p class="hint">المصدر: ' + escapeHtml(item.citation) + ' — طريقة الاستخراج: ' + escapeHtml(item.extractionMethod === "ocr" ? "OCR" : "نص PDF") + (item.ocrConfidence == null ? "" : " — ثقة OCR: " + item.ocrConfidence + "%") + ' — لم تتم مراجعة المقطع فنيًا.</p>' +
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
    version: 2,
    search: searchDocuments,
    retrieve: async (query, options) => {
      const consumer = options && options.consumer;
      if (!["research", "study", "diagnostics", "library"].includes(consumer)) {
        throw new Error("يجب تحديد المستهلك: research أو study أو diagnostics أو library.");
      }
      if (consumer === "diagnostics") {
        const [documents, claims] = await Promise.all([getAll("documents"), getAll("claims")]);
        const byId = new Map(documents.map(doc => [doc.id, doc]));
        const terms = CORE.tokenize(query);
        const context = options && options.context || {};
        const equipmentTerms = CORE.tokenize(context.equipment || "");
        const modelTerms = CORE.tokenize(context.model || "");
        const overlaps = (scope, observed) => {
          const wanted = CORE.tokenize(scope || "");
          return wanted.length > 0 && wanted.some(term => observed.includes(term));
        };
        const genericModelScope = value => /generic|all models|family[- ]wide|not model specific|غير مرتبط بموديل|جميع الموديلات|كل الموديلات|عام/i.test(String(value || ""));
        return claims.filter(claim => {
          const doc = byId.get(claim.documentId);
          const claimTerms = CORE.tokenize(claim.text);
          const family = claim.equipmentFamily || (doc && doc.equipmentFamily) || "";
          const modelScope = claim.modelApplicability || (doc && doc.modelApplicability) || "";
          const familyMatches = overlaps(family, equipmentTerms);
          const modelMatches = genericModelScope(modelScope) || overlaps(modelScope, modelTerms);
          return doc && familyMatches && modelMatches &&
            doc.eligibleForDiagnosis === true && doc.reviewStatus === "approved" &&
            doc.rightsStatus === "verified" && claim.reviewStatus === "approved" &&
            claim.rightsStatus === "verified" && terms.some(term => claimTerms.includes(term));
        }).slice(0, MAX_RESULTS).map(claim => {
          const doc = byId.get(claim.documentId);
          const item = { documentId: doc.id, pageNumber: claim.pageNumber, text: claim.text, extractionMethod: claim.extractionMethod || "human-reviewed-page-claim", ocrConfidence: null };
          return Object.assign({}, item, {
            consumer, score: 1, documentTitle: doc.title, fileName: doc.fileName,
            citation: CORE.makeCitation(doc, claim.pageNumber), sha256: doc.sha256,
            rightsStatus: claim.rightsStatus, reviewStatus: claim.reviewStatus,
            evidenceClass: claim.evidenceClass, eligibleForDiagnosis: true,
            sourceRef: Object.assign(CORE.makeSourceRef(doc, item), {
              pdfPageNumber: claim.pdfPageNumber || claim.pageNumber,
              printedPageNumber: claim.printedPageNumber || null,
              claimId: claim.id, claimText: claim.text, reviewer: claim.reviewer,
              reviewedAt: claim.reviewedAt, evidenceClass: claim.evidenceClass,
              sourceUrl: doc.sourceUrl || null, edition: doc.edition || null,
              rightsEvidence: doc.rightsEvidence || null,
              manufacturer: doc.manufacturer || "", equipmentFamily: claim.equipmentFamily || "",
              modelApplicability: claim.modelApplicability || "", documentModelApplicability: doc.modelApplicability || "",
              sourceOrigin: doc.sourceOrigin || ""
            }),
            evidenceRole: "approved-page-claim"
          });
        });
      }
      const results = await searchDocuments(query);
      return results.map(item => Object.assign({}, item, {
        consumer,
        evidenceRole: item.reviewStatus === "approved" ? "reviewed-source-passage" : "unreviewed-source-passage",
        sourceRef: Object.assign(CORE.makeSourceRef({
          id: item.documentId, fileName: item.fileName, sha256: item.sha256,
          extractionStatus: item.extractionStatus, reviewStatus: item.reviewStatus,
          rightsStatus: item.rightsStatus, evidenceClass: item.evidenceClass,
          eligibleForDiagnosis: false
        }, item), { sourceUrl: item.sourceUrl, sourceOrigin: item.sourceOrigin, manufacturer: item.manufacturer, equipmentFamily: item.equipmentFamily, modelApplicability: item.modelApplicability, edition: item.edition })
      }));
    },
    list: getAll.bind(null, "documents"),
    listClaims: getAll.bind(null, "claims"),
    saveDocumentReview: async (documentId, review) => {
      const db = await openDb();
      const docs = await getAll("documents");
      const doc = docs.find(item => item.id === documentId);
      if (!doc) throw new Error("الوثيقة غير موجودة.");
      const reviewer = String(review && review.reviewer || "").trim();
      const notes = String(review && review.notes || "").trim();
      const rightsEvidence = String(review && review.rightsEvidence || "").trim();
      const manufacturer = String(review && review.manufacturer || "").trim();
      const equipmentFamily = String(review && review.equipmentFamily || "").trim();
      const modelApplicability = String(review && review.modelApplicability || "").trim();
      const edition = String(review && review.edition || "").trim();
      const sourceUrl = String(review && review.sourceUrl || "").trim();
      const sourceOrigin = String(review && review.sourceOrigin || "").trim();
      if (!reviewer || notes.length < 10 || rightsEvidence.length < 10) throw new Error("أدخل المراجع وملاحظات المراجعة ودليل الحقوق (10 أحرف على الأقل).");
      if (sourceUrl && !CORE.isHttpsUrl(sourceUrl)) throw new Error("رابط المصدر يجب أن يكون HTTPS صالحًا.");
      if (review.approved === true && (!manufacturer || !equipmentFamily || !modelApplicability || !edition || (!sourceUrl && sourceOrigin.length < 6))) throw new Error("لا يمكن اعتماد الوثيقة دون الشركة المصنّعة وعائلة المعدة ونطاق الموديل والإصدار ومصدر موثق (رابط HTTPS أو وصف جهة الحصول).");
      Object.assign(doc, {
        manufacturer,
        equipmentFamily,
        modelApplicability,
        edition,
        sourceUrl,
        sourceOrigin,
        rightsStatus: review.rightsVerified === true ? "verified" : "user-supplied-rights-not-verified",
        rightsEvidence, reviewer, reviewNotes: notes,
        reviewStatus: review.approved === true ? "approved" : "reviewed",
        eligibleForDiagnosis: false
      });
      await new Promise((resolve,reject)=>{const tx=db.transaction("documents","readwrite");tx.objectStore("documents").put(doc);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
      await renderDocuments();
      return doc;
    },
    saveClaim: async claim => {
      const db = await openDb();
      const docs = await getAll("documents");
      const doc = docs.find(item => item.id === claim.documentId);
      if (!doc) throw new Error("الوثيقة غير موجودة.");
      const textValue = String(claim.text || "").trim();
      const pageNumber = CORE.normalizePageNumber(claim.pageNumber, doc.pageCount);
      const printedPageNumber = String(claim.printedPageNumber || "").trim();
      const reviewer = String(claim.reviewer || "").trim();
      const notes = String(claim.notes || "").trim();
      if (textValue.length < 20 || !pageNumber || !reviewer || notes.length < 10) throw new Error("الادعاء أو رقم صفحة PDF أو المراجع أو ملاحظات التحقق غير مكتملة.");
      if (claim.approved === true && (!String(claim.equipmentFamily || doc.equipmentFamily || "").trim() || !String(claim.modelApplicability || "").trim())) throw new Error("لا يمكن اعتماد ادعاء دون تحديد عائلة المعدة ونطاق الموديل أو التصريح بأنه عام.");
      const rightsStatus = claim.rightsVerified === true && doc.rightsStatus === "verified" ? "verified" : "unverified";
      const approved = claim.approved === true && doc.reviewStatus === "approved" && rightsStatus === "verified";
      const record = {
        id: String(claim.id || (doc.id + ":claim:" + Date.now())),
        documentId: doc.id, pageNumber, pdfPageNumber: pageNumber, printedPageNumber, text: textValue,
        equipmentFamily: String(claim.equipmentFamily || doc.equipmentFamily || "").trim(),
        modelApplicability: String(claim.modelApplicability || "").trim(),
        evidenceClass: String(claim.evidenceClass || "manufacturer_manual"),
        rightsStatus, reviewStatus: approved ? "approved" : "reviewed",
        reviewer, notes, reviewedAt: new Date().toISOString(),
        extractionMethod: "human-reviewed-page-claim"
      };
      await new Promise((resolve,reject)=>{const tx=db.transaction("claims","readwrite");tx.objectStore("claims").put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
      if (approved) {
        const approvedClaims=(await getAll("claims")).filter(item=>item.documentId===doc.id&&item.reviewStatus==="approved"&&item.rightsStatus==="verified");
        if (approvedClaims.length && doc.rightsStatus==="verified" && doc.reviewStatus==="approved") {
          doc.eligibleForDiagnosis=true;
          await new Promise((resolve,reject)=>{const tx=db.transaction("documents","readwrite");tx.objectStore("documents").put(doc);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
        }
      }
      return record;
    },
    openSourcePage,
    importFile
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
