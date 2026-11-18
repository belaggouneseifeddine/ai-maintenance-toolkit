/* Home dashboard content and localization only.
 * Primary navigation is owned by navigation-redesign.js.
 */
(function(){
'use strict';
const $=selector=>document.querySelector(selector);
const records=()=>{try{return JSON.parse(localStorage.getItem('maintenance-ai-toolkit-records-v1')||'[]')}catch{return []}};
const tasks=()=>{try{return JSON.parse(localStorage.getItem('maintenance-ai-toolkit-pm-v1')||'[]')}catch{return []}};
const lang=()=>window.MaintenanceI18n&&window.MaintenanceI18n.getLanguage?window.MaintenanceI18n.getLanguage():(($('#languageSwitcher')||{}).value||'ar');
const copy={
ar:{
 eyebrow:'مركز الصيانة الصناعية • محلي أولًا',title:'ماذا تحتاج أن تفعل الآن؟',
 sub:'شخّص بأمان، وثّق العمل، واسترجع المعرفة الفنية من مكان واحد.',
 badge:'نسخة أولية • الإرشادات لا تستبدل إجراءات المصنع والسلامة',
 overview:'نظرة عامة',workspaces:'مساحات العمل',total:'إجمالي السجلات',open:'قيد المتابعة',due:'مهام مستحقة',
 recent:'أحدث السجلات',all:'عرض سجل الصيانة',empty:'لا توجد سجلات بعد. ابدأ بتسجيل أول بلاغ.',
 diagnose:'ابدأ تشخيصًا',diagnoseSub:'اجمع السياق والأعراض والقياسات ورتّب الفرضيات',
 knowledge:'المعرفة والوثائق',knowledgeSub:'استورد PDF والصور وابحث مع مرجع الصفحة',
 safety:'السلامة',safetySub:'قوائم التحقق وموانع التدخل',
 log:'سجل الصيانة',logSub:'راجع البلاغات والإجراءات ونتائج الإصلاح',
 handover:'أدوات إضافية',handoverSub:'الصيانة الوقائية والتقارير والإعدادات',
 ai:'مساعد AI',aiSub:'مراجعة خارجية اختيارية بعد موافقتك',
 safetyTitle:'السلامة قبل التشخيص',
 safetyText:'اتبع إجراء LOTO المعتمد، وتحقق من الطاقة المخزنة. لا تفتح نظامًا مضغوطًا أو تلمس أجزاء حية أو تتجاوز interlocks.',
 howTitle:'كيف يعمل المساعد؟',
 howLocal:'المحرك المحلي يبدأ بجمع بيانات المعدة والسياق والأعراض والقياسات.',
 howHypotheses:'يرتب الفرضيات ويقترح الفحص التالي مع توضيح عدم اليقين.',
 howDocs:'يسترجع الوثائق المعتمدة مع مرجع الصفحة الأصلية.',
 howAI:'الذكاء التوليدي خدمة خارجية اختيارية؛ لا تُرسل الحالة إلا بعد موافقة واضحة.',
 howLearning:'تُحفظ ملاحظات الفني محليًا؛ لا يحدث تدريب لأوزان النموذج تلقائيًا.',
 status:'الحالة',machine:'المعدة',date:'التاريخ',unknown:'غير محدد'
},
fr:{
 eyebrow:'Centre de maintenance industrielle • local d’abord',title:'Que devez-vous faire maintenant ?',
 sub:'Diagnostiquez en sécurité, documentez le travail et retrouvez les connaissances techniques au même endroit.',
 badge:'Version initiale • Les conseils ne remplacent pas les procédures du fabricant et de sécurité',
 overview:'Vue d’ensemble',workspaces:'Espaces de travail',total:'Entrées totales',open:'En cours',due:'Tâches échues',
 recent:'Entrées récentes',all:'Ouvrir le journal',empty:'Aucune entrée. Créez le premier signalement.',
 diagnose:'Commencer un diagnostic',diagnoseSub:'Contexte, symptômes, mesures et hypothèses',
 knowledge:'Connaissances et documents',knowledgeSub:'Importer PDF/images et rechercher avec la page source',
 safety:'Sécurité',safetySub:'Contrôles et conditions d’arrêt',
 log:'Journal de maintenance',logSub:'Signalements, actions et résultats des réparations',
 handover:'Outils supplémentaires',handoverSub:'Préventif, rapports et paramètres',
 ai:'Assistant IA',aiSub:'Relecture externe facultative après consentement',
 safetyTitle:'La sécurité avant le diagnostic',
 safetyText:'Appliquez la procédure LOTO et vérifiez les énergies stockées. N’ouvrez pas un système sous pression, ne touchez pas de pièces sous tension et ne contournez pas les interverrouillages.',
 howTitle:'Comment fonctionne l’assistant ?',
 howLocal:'Le moteur local recueille l’équipement, le contexte, les symptômes et les mesures.',
 howHypotheses:'Il classe les hypothèses et propose le prochain contrôle en explicitant l’incertitude.',
 howDocs:'Il retrouve les documents approuvés avec la référence de la page originale.',
 howAI:'L’IA générative est un service externe facultatif ; aucune donnée n’est envoyée sans consentement explicite.',
 howLearning:'Les observations restent locales ; les poids du modèle ne sont pas entraînés automatiquement.',
 status:'Statut',machine:'Équipement',date:'Date',unknown:'Non précisé'
},
en:{
 eyebrow:'Industrial maintenance hub • local first',title:'What do you need to do next?',
 sub:'Diagnose safely, document work, and retrieve technical knowledge in one place.',
 badge:'Prototype • Guidance does not replace OEM or site safety procedures',
 overview:'Overview',workspaces:'Workspaces',total:'Total records',open:'In progress',due:'Tasks due',
 recent:'Recent records',all:'Open maintenance log',empty:'No records yet. Create your first report.',
 diagnose:'Start diagnosis',diagnoseSub:'Capture context, symptoms and readings; rank hypotheses',
 knowledge:'Knowledge and documents',knowledgeSub:'Import PDFs/images and search with source-page references',
 safety:'Safety',safetySub:'Checklists and stop conditions',
 log:'Maintenance log',logSub:'Reports, actions and repair outcomes',
 handover:'More tools',handoverSub:'Preventive maintenance, reports and settings',
 ai:'AI assistant',aiSub:'Optional external review after your consent',
 safetyTitle:'Safety before diagnosis',
 safetyText:'Follow the approved LOTO procedure and verify stored energy. Never open a pressurized system, touch live parts, or bypass interlocks.',
 howTitle:'How does the assistant work?',
 howLocal:'The local engine starts with equipment, operating context, symptoms and available readings.',
 howHypotheses:'It ranks hypotheses and suggests the next check while showing uncertainty.',
 howDocs:'It retrieves approved documents with the original page reference.',
 howAI:'Generative AI is an optional external service; the case is sent only after explicit consent.',
 howLearning:'Technician observations stay local; model weights are not trained automatically.',
 status:'Status',machine:'Equipment',date:'Date',unknown:'Unspecified'
}
};
function text(key){const language=copy[lang()]||copy.ar;return language[key]||copy.ar[key]||key}
function safe(value){return String(value==null?'':value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function renderCopy(){
 const home=$('#homeDashboard');if(!home)return;
 home.querySelectorAll('[data-ux-key]').forEach(element=>{element.textContent=text(element.dataset.uxKey)});
 document.documentElement.lang=lang();
 document.documentElement.dir=lang()==='ar'?'rtl':'ltr';
}
function renderDashboard(){
 const home=$('#homeDashboard');if(!home)return;
 const entries=records();
 const openStatuses=['قيد الفحص','يتطلب قطع غيار','تم التصعيد','In progress','Needs parts','Escalated','En cours'];
 const open=entries.filter(record=>openStatuses.includes(record.status)).length;
 const pm=tasks(),today=new Date();
 const day=value=>{const date=new Date(value+'T12:00:00');return Number.isNaN(date.getTime())?null:date};
 const due=pm.filter(task=>{
  const last=day(task.last);if(!last)return false;
  const next=new Date(last);
  if(task.repeat==='monthly')next.setMonth(next.getMonth()+1);
  else next.setDate(next.getDate()+Number(task.days||0));
  return next.toISOString().slice(0,10)<=today.toISOString().slice(0,10);
 }).length;
 const totalNode=$('#ux-total'),openNode=$('#ux-open'),dueNode=$('#ux-due');
 if(totalNode)totalNode.textContent=String(entries.length);
 if(openNode)openNode.textContent=String(open);
 if(dueNode)dueNode.textContent=String(due);
 const list=$('#ux-recent-list');if(!list)return;
 if(!entries.length){
  list.innerHTML='<div class="ux-empty"><span aria-hidden="true">▤</span><p>'+safe(text('empty'))+'</p><button type="button" class="btn" data-go="diagnose">'+safe(text('diagnose'))+'</button></div>';
  return;
 }
 list.innerHTML=entries.slice(0,4).map(record=>
  '<article class="ux-record"><div class="ux-record-top"><b>'+safe(record.machine||text('unknown'))+'</b><span class="ux-status">'+safe(record.status||text('unknown'))+'</span></div><p>'+safe(record.fault||'—')+'</p><small>'+safe(record.date||'—')+'</small></article>'
 ).join('');
}
function initialize(){
 if(!$('#homeDashboard'))return;
 renderCopy();renderDashboard();
 const language=$('#languageSwitcher');
 if(language)language.addEventListener('change',()=>{renderCopy();renderDashboard()});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderDashboard()});
 window.addEventListener('focus',renderDashboard);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
})();
