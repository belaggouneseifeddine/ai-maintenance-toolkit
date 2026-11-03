(function(root) {
  "use strict";
  const $ = id => root.document && root.document.getElementById(id);
  let session = null;
  let flowKey = "";
  let flowNotice = "";

  function lang() {
    const value = root.MaintenanceI18n && root.MaintenanceI18n.getLanguage
      ? root.MaintenanceI18n.getLanguage() : "ar";
    return ["ar", "en", "fr"].includes(value) ? value : "ar";
  }

  function copy(ar, en, fr) {
    const language = lang();
    return language === "en" ? en : language === "fr" ? fr : ar;
  }

  function resolve() {
    const machine = ($("aiMachine")?.value || "").trim().toLowerCase();
    const symptom = ($("aiSymptom")?.value || "").trim().toLowerCase();
    const equipmentAliases = {
      pump:[/pump|مضخ|pompe/],
      motor:[/motor|محرك|محرّك|moteur/],
      vfd:[/\bvfd\b|variable frequency|variat(?:or|eur)|مغير السرعة|مغيّر السرعة/],
      compressor:[/compressor|ضاغط|compresseur/],
      valve:[/\bvalve\b|صمام|صمامات|vanne/],
      pneumatic:[/pneumatic|هوائي|هوائية|pneumatique/],
      gearbox:[/gearbox|علبة التروس|مخفض السرعة|réducteur/],
      bearing:[/bearing|محمل|رولمان|roulement/],
      plc:[/\bplc\b|متحكم منطقي|automate/],
      conveyor:[/conveyor|سير ناقل|ناقل|convoyeur/],
      thermal:[/thermal|heat exchanger|مبادل حراري|échangeur thermique/]
    };
    const symptomAliases = {
      not_start:[/not[\s-]?start|won.?t start|doesn.?t start|لا يعمل|لا تعمل|لا تبدأ|لا يبدأ|ne démarre pas/],
      trip:[/\btrip(?:ped)?\b|overload|فصل|إنذار|déclenchement|défaut/],
      low_pressure:[/low[\s-]?pressure|ضغط منخفض|pression basse|pression faible/],
      low_flow:[/low[\s-]?flow|weak flow|تدفق ضعيف|débit faible/],
      overheat:[/overheat|overheating|high temperature|ارتفاع الحرارة|حرارة مرتفعة|surchauffe|température élevée/],
      vibration:[/vibration|اهتزاز|vibrations/],
      tracking:[/tracking|belt drift|انحراف السير|dérive.*bande|déport.*bande/]
    };
    const equipment = Object.keys(equipmentAliases).find(id => equipmentAliases[id].some(pattern => pattern.test(machine)));
    let symptomId = Object.keys(symptomAliases).find(id => symptomAliases[id].some(pattern => pattern.test(symptom)));
    if (equipment === "pump" && symptomId === "low_pressure") symptomId = "low_flow";
    if (equipment === "compressor" && symptomId === "low_flow") symptomId = "low_pressure";
    const key = equipment && symptomId ? equipment + "|" + symptomId : "";
    const registry = root.MAINTENANCE_DIAGNOSTIC_FLOWS && root.MAINTENANCE_DIAGNOSTIC_FLOWS.flows;
    return key && registry && registry[key] ? key : "";
  }

  function ensureProgress(panel) {
    let progress = $("dynamicSessionProgress");
    if (progress) return progress;
    progress = root.document.createElement("div");
    progress.id = "dynamicSessionProgress";
    progress.className = "diagnostic-progress";
    progress.setAttribute("role", "status");
    progress.setAttribute("aria-live", "polite");
    const status = $("dynamicSessionStatus");
    panel.insertBefore(progress, status ? status.nextSibling : panel.firstChild);
    return progress;
  }

  function addEvidenceList(parent, label, values, className) {
    if (!Array.isArray(values) || !values.length) return;
    const section = root.document.createElement("div");
    section.className = "hypothesis-evidence " + className;
    const heading = root.document.createElement("strong");
    heading.textContent = label;
    section.appendChild(heading);
    const list = root.document.createElement("ul");
    values.forEach(value => {
      const item = root.document.createElement("li");
      item.textContent = value;
      list.appendChild(item);
    });
    section.appendChild(list);
    parent.appendChild(section);
  }

  function render() {
    const panel = $("dynamicSessionPanel");
    const status = $("dynamicSessionStatus");
    const question = $("dynamicQuestionText");
    const select = $("dynamicAnswer");
    const button = $("recordDynamicAnswer");
    const hypotheses = $("dynamicHypotheses");
    if (!panel || !status || !question || !select || !button || !hypotheses) return;

    const progress = ensureProgress(panel);
    select.replaceChildren();
    hypotheses.replaceChildren();

    if (!session) {
      const translationPending = flowNotice === "flow_translation_pending";
      status.textContent = translationPending
        ? copy("هذا المسار متاح حاليًا بالعربية فقط؛ بدّل اللغة إلى العربية لتجنب ترجمة فنية غير مراجعة.", "This curated check is currently available in Arabic only. Switch to Arabic to avoid unreviewed technical translation.", "Ce contrôle guidé est actuellement disponible uniquement en arabe. Passez en arabe pour éviter une traduction technique non vérifiée.")
        : copy("لا يوجد مسار تشخيص موجّه معتمد لهذه المدخلات؛ يمكنك استخدام التحليل المحلي العام.", "No curated guided flow matches these inputs; the general local engine remains available.", "Aucun parcours guidé validé ne correspond ; le moteur local général reste disponible.");
      progress.textContent = translationPending
        ? copy("المحتوى الفني لم يُراجع بعد بالفرنسية أو الإنجليزية.", "Technical wording has not yet been reviewed in French or English.", "Le contenu technique n’a pas encore été révisé en français ou en anglais.")
        : copy("أدخل المعدة والعَرَض لبدء المسار عند توفره.", "Enter equipment and symptom to start a matching flow.", "Saisissez l’équipement et le symptôme pour lancer un parcours adapté.");
      question.textContent = "";
      select.hidden = button.hidden = true;
      return;
    }

    const answered = Array.isArray(session.answeredQuestionIds) ? session.answeredQuestionIds.length : 0;
    const completed = session.status === "evidence_review";
    status.textContent = completed
      ? copy("اكتمل جمع الأدلة — الفرضيات لا تزال أولية.", "Evidence collection complete — hypotheses remain provisional.", "Collecte terminée — les hypothèses restent provisoires.")
      : copy("جلسة محلية: الإجابات تبقى على الجهاز وتوجّه ترتيب الفرضيات.", "Local session: answers stay on this device and guide hypothesis ranking.", "Session locale : les réponses restent sur cet appareil et orientent les hypothèses.");
    progress.textContent = copy(
      "الإجابات المسجلة: " + answered + " · " + (completed ? "مراجعة الأدلة" : "جمع الأدلة"),
      "Answers recorded: " + answered + " · " + (completed ? "Evidence review" : "Evidence collection"),
      "Réponses enregistrées : " + answered + " · " + (completed ? "Revue des indices" : "Collecte des indices")
    );

    question.textContent = session.nextQuestion
      ? session.nextQuestion.text
      : (session.summary?.message || copy("لا توجد أسئلة إضافية في هذا المسار.", "No further questions in this flow.", "Aucune autre question dans ce parcours."));

    if (session.nextQuestion) {
      const placeholder = root.document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = copy("اختر إجابة معروفة", "Select a known answer", "Choisissez une réponse connue");
      select.appendChild(placeholder);
      session.nextQuestion.options.forEach(option => {
        const item = root.document.createElement("option");
        item.value = option.id;
        item.textContent = option.label;
        select.appendChild(item);
      });
      select.hidden = button.hidden = false;
      button.textContent = copy("تسجيل الإجابة والمتابعة", "Record answer and continue", "Enregistrer et continuer");
    } else {
      select.hidden = button.hidden = true;
    }

    const heading = root.document.createElement("h4");
    heading.className = "hypotheses-heading";
    heading.textContent = session.flowMode === "registry_single_step"
      ? copy("الإجابة المسجلة والإرشاد المرتبط بها", "Recorded answer and related guidance", "Réponse enregistrée et consigne associée")
      : copy("الفرضيات الحالية", "Current hypotheses", "Hypothèses actuelles");
    hypotheses.appendChild(heading);
    if (session.selectedAnswer) {
      const answerLabel = root.document.createElement("p");
      answerLabel.className = "hypothesis-status";
      answerLabel.textContent = session.selectedAnswer.label;
      hypotheses.appendChild(answerLabel);
      const guidance = root.document.createElement("p");
      guidance.className = "guided-answer-guidance";
      guidance.textContent = session.selectedAnswer.guidance;
      hypotheses.appendChild(guidance);
    }

    session.hypotheses.forEach((hypothesis, index) => {
      const item = root.document.createElement("li");
      item.className = "hypothesis-card";
      const title = root.document.createElement("div");
      title.className = "hypothesis-title";
      const name = root.document.createElement("strong");
      name.textContent = hypothesis.label;
      const rank = root.document.createElement("span");
      rank.className = "hypothesis-rank";
      rank.textContent = "#" + (index + 1);
      title.append(name, rank);
      item.appendChild(title);

      const state = hypothesis.status === "supported_by_current_evidence"
        ? copy("تدعمها الأدلة الحالية", "Supported by current evidence", "Étayée par les indices actuels")
        : hypothesis.status === "weakened_by_current_evidence"
          ? copy("تضعفها الأدلة الحالية", "Weakened by current evidence", "Affaiblie par les indices actuels")
          : hypothesis.status === "mixed_evidence"
            ? copy("أدلة متعارضة", "Mixed evidence", "Indices contradictoires")
            : copy("لم تُحسم بعد", "Not yet resolved", "Pas encore déterminée");
      const band = hypothesis.supportBand === "higher_relative_support"
        ? copy("دعم نسبي أعلى", "Higher relative support", "Soutien relatif supérieur")
        : hypothesis.supportBand === "moderate_relative_support"
          ? copy("دعم نسبي متوسط", "Moderate relative support", "Soutien relatif modéré")
          : hypothesis.supportBand === "lower_relative_support"
            ? copy("دعم نسبي أقل", "Lower relative support", "Soutien relatif inférieur") : "";
      const summary = root.document.createElement("p");
      summary.className = "hypothesis-status";
      summary.textContent = state + (band ? " · " + band : "");
      item.appendChild(summary);

      addEvidenceList(item, copy("أدلة مؤيدة", "Supporting evidence", "Indices favorables"), hypothesis.supportingEvidence, "supports");
      addEvidenceList(item, copy("أدلة معارضة", "Contradicting evidence", "Indices défavorables"), hypothesis.contradictingEvidence, "contradicts");
      if (Array.isArray(hypothesis.checks) && hypothesis.checks.length) {
        const details = root.document.createElement("details");
        const summaryNode = root.document.createElement("summary");
        summaryNode.textContent = copy("فحوص مقترحة", "Suggested checks", "Contrôles suggérés");
        const list = root.document.createElement("ul");
        hypothesis.checks.forEach(check => {
          const line = root.document.createElement("li");
          line.textContent = typeof check === "string" ? check : JSON.stringify(check);
          list.appendChild(line);
        });
        details.append(summaryNode, list);
        item.appendChild(details);
      }
      hypotheses.appendChild(item);
    });

    const note = root.document.createElement("p");
    note.className = "diagnostic-disclaimer";
    note.textContent = session.flowMode === "registry_single_step"
      ? copy("هذا فحص موجّه من خطوة واحدة؛ الإجابة والإرشاد لا يمثلان ترتيب فرضيات ولا يثبتان سبب العطل.", "This is a single-step guided check; the answer and guidance are not a hypothesis ranking and do not confirm a cause.", "Il s’agit d’un contrôle guidé en une étape ; la réponse et la consigne ne constituent pas un classement d’hypothèses et ne confirment pas une cause.")
      : copy(
        "ترتيب نسبي استدلالي وليس احتمالاً معايراً. لا يثبت سبب العطل؛ تحقّق من دليل المصنع وإجراءات الموقع قبل أي تدخل.",
        "This is a heuristic relative ranking, not calibrated probability. It does not confirm a fault; verify the OEM manual and site procedures before intervention.",
        "Classement relatif heuristique, pas une probabilité calibrée. Il ne confirme pas une panne ; vérifiez le manuel constructeur et les procédures du site."
      );
    hypotheses.appendChild(note);

    let saveButton = $("saveGuidedDiagnosticReport");
    if (!saveButton) {
      saveButton = root.document.createElement("button");
      saveButton.id = "saveGuidedDiagnosticReport";
      saveButton.type = "button";
      saveButton.className = "btn";
      saveButton.addEventListener("click", () => {
        const save = root.saveGuidedDiagnosticReport;
        if (typeof save !== "function") {
          status.textContent = copy("تعذّر الوصول إلى وظيفة حفظ التقرير.", "The maintenance report saver is unavailable.", "La fonction d’enregistrement du rapport est indisponible.");
          return;
        }
        if (save(getPayload())) {
          saveButton.disabled = true;
          saveButton.textContent = copy("تم حفظ التقرير في سجل الصيانة", "Report saved to maintenance log", "Rapport enregistré dans le journal");
        }
      });
      panel.appendChild(saveButton);
    }
    saveButton.hidden = !completed;
    saveButton.disabled = false;
    saveButton.textContent = copy("إنشاء تقرير وحفظه في سجل الصيانة", "Create report and save to maintenance log", "Créer un rapport et l’enregistrer");
  }

  function start() {
    const key = resolve();
    if (key === flowKey) return;
    flowKey = key;
    session = null;
    flowNotice = "";
    if (key && root.MaintenanceDiagnosticSession) {
      const [equipment, symptom] = key.split("|");
      const result = root.MaintenanceDiagnosticSession.createSession({ equipment, symptom, language: lang() });
      if (result.ok) session = result;
      else flowNotice = result.code || "";
    }
    render();
  }

  function answer() {
    const select = $("dynamicAnswer");
    if (!session || !select || !select.value) return;
    const result = root.MaintenanceDiagnosticSession.answer(session, select.value);
    if (result.ok) session = result.session;
    render();
  }

  function getPayload() {
    if (!session) return {};
    return {
      diagnosticFlowId: session.flowId,
      diagnosticFlowMode: session.flowMode || "adaptive_hypothesis",
      diagnosticSelectedAnswer: session.selectedAnswer ? {
        id:session.selectedAnswer.id,
        label:session.selectedAnswer.label,
        guidance:session.selectedAnswer.guidance
      } : null,
      diagnosticEvidence: [...new Set((Array.isArray(session.evidence) ? session.evidence : []).flatMap(entry => Array.isArray(entry.evidence) ? entry.evidence : []))],
      diagnosticAnswers: (Array.isArray(session.evidence) ? session.evidence : []).map(entry => ({
        questionId: entry.questionId,
        answerId: entry.answerId,
        evidence: Array.isArray(entry.evidence) ? entry.evidence.slice() : []
      })),
      diagnosticHypotheses: session.hypotheses.map(hypothesis => ({
        id: hypothesis.id,
        label: hypothesis.label,
        status: hypothesis.status,
        score: hypothesis.score,
        supportingEvidence: Array.isArray(hypothesis.supportingEvidence) ? hypothesis.supportingEvidence.slice() : [],
        contradictingEvidence: Array.isArray(hypothesis.contradictingEvidence) ? hypothesis.contradictingEvidence.slice() : [],
        checks: Array.isArray(hypothesis.checks) ? hypothesis.checks.slice() : []
      }))
    };
  }

  function onLanguageChanged() {
    if (!flowKey || !root.MaintenanceDiagnosticSession) return;
    const previous = session;
    const [equipment, symptom] = flowKey.split("|");
    const fresh = root.MaintenanceDiagnosticSession.createSession({ equipment, symptom, language: lang() });
    if (!fresh.ok) {
      session = null;
      flowNotice = fresh.code || "";
      render();
      return;
    }
    flowNotice = "";
    session = fresh;
    if (previous && Array.isArray(previous.evidence)) {
      previous.evidence.forEach(entry => {
        const result = root.MaintenanceDiagnosticSession.answer(session, entry.answerId);
        if (result.ok) session = result.session;
      });
    }
    render();
  }

  function init() {
    ["aiMachine", "aiSymptom"].forEach(id => {
      const field = $(id);
      if (field) {
        field.addEventListener("input", start);
        field.addEventListener("change", start);
      }
    });
    $("recordDynamicAnswer")?.addEventListener("click", answer);
    root.document?.addEventListener("maintenance-language-changed", onLanguageChanged);
    start();
  }

  root.MaintenanceDiagnosticSessionUI = Object.freeze({ getPayload, init });
  if (typeof module !== "undefined" && module.exports) module.exports = root.MaintenanceDiagnosticSessionUI;
  if (root.document) init();
})(typeof globalThis !== "undefined" ? globalThis : this);
