(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const state = { records: [], loaded: false, error: false };
  const labels = {
    ar: { title:"بحث موثّق في أكواد وأعطال المصنّعين", hint:"99 سجلًا اجتاز مراجعة الادعاء الفني مقابل دليل رسمي. لم تُتحقق ميدانيًا ولا تنطبق تلقائيًا على كل آلة من العلامة نفسها.", search:"ابحث برمز الإنذار أو الشركة أو الطراز أو وحدة التحكم", controller:"وحدة التحكم / المنصة", count:n=>"عدد النتائج: "+n, loading:"جارٍ تحميل السجلات…", empty:"لا توجد مطابقة. تحقق من كتابة الرمز والطراز كما يظهران على الجهاز.", error:"تعذر تحميل قاعدة الأدلة. اتصل بالإنترنت ثم أعد تحميل الصفحة.", code:"الرمز / الحدث", model:"العائلة والنطاق", source:"الدليل الرسمي", section:"القسم", page:"الصفحة المطبوعة", revision:"الإصدار", date:"تاريخ المراجعة", checks:"فحوصات آمنة", escalation:"متى يجب التصعيد", open:"فتح الدليل الرسمي", scope:"تنبيه: طابق رقم الطراز والبرنامج الثابت وإصدار الدليل مع الجهاز الفعلي." },
    en: { title:"Source-reviewed OEM alarm and fault lookup", hint:"99 records have claim-level review against official manuals. They are not field-validated and do not apply automatically to every machine from the same brand.", search:"Search alarm code, manufacturer, model, or controller", controller:"Controller / platform", count:n=>"Results: "+n, loading:"Loading records…", empty:"No match. Check the code and model spelling as shown on the machine.", error:"Could not load the evidence database. Connect to the internet and reload.", code:"Code / event", model:"Family and scope", source:"Official manual", section:"Section", page:"Printed page", revision:"Revision", date:"Review date", checks:"Safe checks", escalation:"Escalation", open:"Open official manual", scope:"Important: match the actual model, firmware, and manual revision before using this record." },
    fr: { title:"Recherche des alarmes et pannes OEM avec sources", hint:"99 fiches ont fait l’objet d’une vérification des affirmations dans des manuels officiels. Elles ne sont pas validées sur le terrain et ne s'appliquent pas automatiquement à toute machine de la marque.", search:"Rechercher code, fabricant, modèle ou commande", controller:"Commande / plateforme", count:n=>"Résultats : "+n, loading:"Chargement des fiches…", empty:"Aucun résultat. Vérifiez le code et le modèle tels qu'affichés sur la machine.", error:"Impossible de charger la base documentaire. Connectez-vous puis rechargez la page.", code:"Code / événement", model:"Famille et portée", source:"Manuel officiel", section:"Section", page:"Page imprimée", revision:"Révision", date:"Date de révision", checks:"Contrôles sûrs", escalation:"Escalade", open:"Ouvrir le manuel officiel", scope:"Important : faites correspondre le modèle, le firmware et la révision du manuel." }
  };
  function language() { const value = $("languageSwitcher")?.value || "ar"; return labels[value] ? value : "ar"; }
  function textNode(tag, value, className) { const el = document.createElement(tag); if (className) el.className = className; el.textContent = value == null ? "" : String(value); return el; }
  function localized(value, lang) { if (typeof value === "string") return value; if (value && typeof value === "object") return value[lang] || value.ar || value.en || value.fr || ""; return ""; }
  function addMeta(card, label, value) {
    if (value === null || value === undefined || value === "") return;
    const p = document.createElement("p");
    p.append(textNode("strong", label + ": "), document.createTextNode(String(value)));
    card.appendChild(p);
  }
  function render() {
    const lang = language(), t = labels[lang], host = $("oemLookupResults"), query = ($("oemLookupSearch")?.value || "").trim().toLocaleLowerCase();
    if (!host) return;
    if ($("oemLookupTitle")) $("oemLookupTitle").textContent = t.title;
    if ($("oemLookupHint")) $("oemLookupHint").textContent = t.hint;
    const searchLabel = document.querySelector('label[for="oemLookupSearch"]');
    if (searchLabel) searchLabel.textContent = t.search;
    if ($("oemLookupSearch")) $("oemLookupSearch").placeholder = t.search;
    host.replaceChildren();
    if (!state.loaded) { host.appendChild(textNode("p", state.error ? t.error : t.loading, "hint")); return; }
    const filtered = state.records.filter(record => record.evidenceStatus === "verified-source-exact-scope").filter(record => {
      const src = record.source || {};
      const haystack = [record.id, record.manufacturer, record.productFamily, record.modelScope, record.controllerModel, record.alarmCode, record.errorCode, record.eventCode, record.diagnosticCode, record.eventId, record.title?.[lang], record.title?.ar, record.title?.en, record.title?.fr, record.meaning?.[lang], record.meaning?.ar, record.meaning?.en, record.meaning?.fr, src.manualTitle, src.section, src.revision].join(" ").toLocaleLowerCase();
      return !query || haystack.includes(query);
    }).slice(0, 30);
    host.appendChild(textNode("p", t.count(filtered.length) + (filtered.length === 30 ? " (max 30)" : ""), "hint"));
    if (!filtered.length) { host.appendChild(textNode("p", t.empty, "notice")); return; }
    for (const record of filtered) {
      const card = textNode("article", "", "card");
      card.appendChild(textNode("h4", localized(record.title, lang) || record.id));
      const code = record.alarmCode || record.errorCode || record.eventCode || record.diagnosticCode || record.eventId;
      if (code !== undefined && code !== null && code !== "") addMeta(card, t.code, code);
      addMeta(card, t.model, record.manufacturer + " — " + record.productFamily + (record.modelScope ? " / " + record.modelScope : ""));
      addMeta(card, t.controller, record.controllerModel || "");
      card.appendChild(textNode("p", localized(record.meaning, lang), ""));
      const src = record.source || {};
      addMeta(card, t.source, src.manualTitle);
      addMeta(card, t.revision, src.revision);
      addMeta(card, t.section, src.section);
      addMeta(card, t.page, src.printedPageLabel || src.printedPage || src.pdfPage || "");
      addMeta(card, t.date, record.reviewDate || "");
      const checks = localized(record.safeChecks, lang);
      if (Array.isArray(checks) && checks.length) {
        card.appendChild(textNode("h5", t.checks));
        const list = document.createElement("ul");
        checks.forEach(item => list.appendChild(textNode("li", item)));
        card.appendChild(list);
      }
      const escalation = localized(record.escalation, lang);
      if ((Array.isArray(escalation) && escalation.length) || (typeof escalation === "string" && escalation.trim())) {
        card.appendChild(textNode("h5", t.escalation));
        if (Array.isArray(escalation)) {
          const list = document.createElement("ul");
          escalation.forEach(item => list.appendChild(textNode("li", item)));
          card.appendChild(list);
        } else {
          card.appendChild(textNode("p", escalation));
        }
      }
      if (src.manualUrl && /^https:\/\//i.test(src.manualUrl)) {
        const link = document.createElement("a");
        link.href = src.manualUrl; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = t.open;
        card.appendChild(link);
      }
      card.appendChild(textNode("p", t.scope, "hint"));
      host.appendChild(card);
    }
  }
  async function init() {
    const host = $("oemLookupResults");
    if (!host) return;
    try {
      const response = await fetch("./knowledge/oem-verified-faults.json", { cache: "no-cache" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!Array.isArray(data.records) || data.records.length !== data.recordCount) throw new Error("Invalid OEM record inventory");
      state.records = data.records; state.loaded = true;
    } catch (_) { state.error = true; }
    render();
    $("oemLookupSearch")?.addEventListener("input", render);
    $("languageSwitcher")?.addEventListener("change", render);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();