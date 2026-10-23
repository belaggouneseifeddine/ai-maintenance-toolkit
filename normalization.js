/* Shared multilingual normalization for the offline diagnostic engine and Worker retrieval.
 * Review-only aliases are deliberately not auto-mapped to a canonical equipment/symptom.
 */
(function (root) {
  "use strict";
  function normalizeText(value) {
    return String(value == null ? "" : value).toLocaleLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
      .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ـ]/g, "")
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ").trim().replace(/\s+/g, " ");
  }
  const ALIASES = {
    equipment: {
      pump: { confirmed:["pump","pumps","pompe","pompes","مضخه","مضخة","مضخات","pompe a eau","water pump"], review:["pompa","pompe eau","بومبة","بومبا","بمبه"] },
      motor: { confirmed:["motor","electric motor","electric_motor","moteur","moteur electrique","محرك","محرك كهربائي","موتور"], review:["motour","moteur elec","motor el kahraba","موتور الكتريك"] },
      hydraulic: { confirmed:["hydraulic","hydraulic system","hydraulique","systeme hydraulique","هيدروليك","نظام هيدروليكي"], review:["hydrolique","هيدروليك سيستم"] },
      pneumatic: { confirmed:["pneumatic","pneumatic system","pneumatique","هوائي","نظام هوائي"], review:["pnomatique","نيوماتيك"] },
      gearbox: { confirmed:["gearbox","gear box","reducer","reducteur","علبة تروس","جيربوكس"], review:["boite vitesse"] },
      instrumentation: { confirmed:["instrumentation","sensor","capteur","حساس","مجس","جهاز قياس"], review:["capteur pression","سونسر"] },
      electrical_control: { confirmed:["plc","control panel","armoire electrique","لوحة كهربائية","متحكم منطقي"], review:["api automate","لوحة كونترول"] },
      thermal: { confirmed:["heat exchanger","heat_exchanger","echangeur thermique","مبادل حراري","نظام تبريد","cooling","refrigeration","تبريد","تبريد صناعي"], review:["chiller","شيلر"] },
      mechanical: { confirmed:["bearing","roulement","محمل","رولمان بلي"], review:["roulement a billes","رولمان"] },
      vfd: { confirmed:["vfd","variable frequency drive","frequency inverter","drive","inverter","variateur","variateur de frequence","مغير التردد","مغير تردد","انفرتر","إنفرتر"], review:["variateur vitesse","درايف"] },
      compressor: { confirmed:["compressor","air compressor","compresseur","ضاغط","ضاغط هواء","كمبروسر"], review:["compresseur air","كمبرسور"] },
      valve: { confirmed:["valve","check valve","non return valve","clapet","vanne","صمام","صمام عدم الرجوع"], review:["vanne eau","فالف"] },
      conveyor: { confirmed:["conveyor","convoyeur","ناقل","سير ناقل"], review:["tapis roulant","سير"] }
    },
    symptom: {
      not_start: { confirmed:["not start","not starting","fails to start","wont start","does not start","no start","ne demarre pas","refus de demarrer","ne demarre plus","لا يبدأ","لا يعمل","لا يقلع","لا ينطلق","فشل التشغيل"], review:["ma yhabch ydemarri","ma ydemarrich","ما يحبش يشعل","ما يقلعش"] },
      trip: { confirmed:["trip","tripping","fault trip","disjonction","declenchement","se declenche","يفصل","فصل حماية","يفصل حماية","انذار فصل"], review:["ytrip","يطريب","يطيح الديجونكتور"] },
      overheat: { confirmed:["overheating","overheat","hot","temperature high","surchauffe","temperature elevee","ارتفاع الحرارة","سخونة","حرارة مرتفعة"], review:["moteur yskhon","يسخن بزاف"] },
      noise: { confirmed:["noise","noisy","abnormal noise","bruit","bruit anormal","ضجيج","صوت غير طبيعي","صوت غريب"], review:["kayen sawt","كاين صوت"] },
      low_flow: { confirmed:["low flow","no flow","reduced flow","debit faible","absence de debit","faible debit","ضعف التدفق","انعدام التدفق","تدفق ضعيف"], review:["ma kaynach debit","ma ykharjch lma","lma ma ykhrjch","ما يخرجش الماء","الدبي ضعيف"] },
      low_pressure: { confirmed:["low pressure","pressure low","pression faible","basse pression","ضغط منخفض","ضعف الضغط"], review:["pression habta","الضغط طايح"] },
      bad_signal: { confirmed:["signal loss","lost signal","incorrect reading","perte de signal","mauvaise mesure","فقدان اشارة","قراءة غير منطقية"], review:["signal ma ywaselch","السيڨنال مقطوع"] },
      slow_cycle: { confirmed:["slow cycle","slow movement","cycle lent","mouvement lent","حركة بطيئة","دورة بطيئة"], review:["yetharek bchwiya","يتحرك بشوية"] },
      high_pressure: { confirmed:["high pressure","pression elevee","ضغط مرتفع","ضغط عالي"], review:["pression tal3a","الضغط طالع"] },
      consumption: { confirmed:["high consumption","overconsumption","surconsommation","استهلاك مرتفع","استهلاك غير طبيعي"], review:["consommation tal3a","يستهلك بزاف"] },
      leak: { confirmed:["leak","leaking","leakage","fuite","تسرب","تسرّب"], review:["rah yserreb","راه يسرب","يفوت الزيت"] },
      vibration: { confirmed:["vibration","vibrating","vibrations","vibrations anormales","اهتزاز","رجة"], review:["yereg","ترج بزاف"] },
      intermittent: { confirmed:["intermittent","intermittently","sporadic","متقطع","بشكل متقطع"], review:["marra yekhdem marra la","مرة يخدم مرة لا"] }
    }
  };
  const confirmedLookup = { equipment:new Map(), symptom:new Map() };
  const reviewLookup = { equipment:new Map(), symptom:new Map() };
  for (const domain of Object.keys(ALIASES)) for (const [canonical, group] of Object.entries(ALIASES[domain])) {
    for (const alias of group.confirmed) confirmedLookup[domain].set(normalizeText(alias), canonical);
    for (const alias of group.review) reviewLookup[domain].set(normalizeText(alias), canonical);
  }
  function canonicalize(value, domain) {
    const normalized = normalizeText(value);
    if (!normalized || !confirmedLookup[domain]) return { canonical:normalized, normalized, status:"unknown", alias:normalized };
    if (confirmedLookup[domain].has(normalized)) {
      let canonical = confirmedLookup[domain].get(normalized);
      if (domain === "symptom" && ["noise","vibration"].includes(canonical)) canonical = "noise_vibration";
      if (domain === "symptom" && ["low_flow","low_pressure"].includes(canonical)) canonical = "low_flow_pressure";
      return { canonical, normalized, status:"confirmed", alias:normalized };
    }
    if (reviewLookup[domain].has(normalized)) return { canonical:null, normalized, status:"review_required", suggestedCanonical:reviewLookup[domain].get(normalized), alias:normalized };
    return { canonical:normalized, normalized, status:"unknown", alias:normalized };
  }
  function getReviewAliases() {
    const result = [];
    for (const [domain, groups] of Object.entries(ALIASES)) for (const [canonical, group] of Object.entries(groups))
      for (const alias of group.review) result.push({ domain, canonical, alias, status:"review_required" });
    return result;
  }
  function expandQuery(value) {
    const normalized = normalizeText(value), tokens = new Set(normalized.split(" ").filter(Boolean)), reviewCandidates = [];
    for (const [domain, groups] of Object.entries(ALIASES)) for (const [canonical, group] of Object.entries(groups)) {
      for (const alias of group.confirmed) {
        const a = normalizeText(alias);
        if (a && (normalized === a || normalized.includes(" " + a + " ") || normalized.startsWith(a + " ") || normalized.endsWith(" " + a))) {
          tokens.add(canonical);
          for (const token of a.split(" ")) if (token) tokens.add(token);
        }
      }
      for (const alias of group.review) {
        const a = normalizeText(alias);
        if (a && (normalized === a || normalized.includes(" " + a + " ") || normalized.startsWith(a + " ") || normalized.endsWith(" " + a)))
          reviewCandidates.push({ domain, canonical, alias, status:"review_required" });
      }
    }
    return { normalized, tokens:Array.from(tokens), reviewCandidates };
  }
  root.MaintenanceNormalization = { normalizeText, canonicalize, expandQuery, getReviewAliases, aliasReviewCount:getReviewAliases().length };
})(typeof globalThis !== "undefined" ? globalThis : this);
