/* Real navigation model: dedicated home, diagnosis workspace, and preserved feature panels. */
(function(){
'use strict';
function initializeNavigation(){
const $=s=>document.querySelector(s);
const nav=$('.nav'), main=$('main');
if(!nav||!main)return;
const tabFor=id=>nav.querySelector('.tab[data-tab="'+id+'"]');
const panel=id=>document.getElementById(id);
const homeTab=tabFor('homeDashboard');
const diagnoseTab=tabFor('diagnose');
const aiTab=tabFor('ai');
const faultsTab=tabFor('knowledge');
const safetyTab=tabFor('safety');
const historyTab=tabFor('log');
const moreTab=tabFor('v03');
if(![homeTab,diagnoseTab,aiTab,faultsTab,safetyTab,historyTab,moreTab].every(Boolean))return;
const home=panel('homeDashboard'), diagnose=panel('diagnose'), ai=panel('ai');
if(home){home.classList.add('panel');}
if(ai&&diagnose){ai.classList.remove('panel','active');ai.setAttribute('aria-label','AI maintenance assistant');diagnose.appendChild(ai);}
const tabs=[
 {button:homeTab,id:'homeDashboard',icon:'⌂',labels:{ar:'الرئيسية',fr:'Accueil',en:'Home'}},
 {button:diagnoseTab,id:'diagnose',icon:'⌕',labels:{ar:'التشخيص',fr:'Diagnostic',en:'Diagnose'}},
 {button:faultsTab,id:'knowledge',icon:'⚙',labels:{ar:'الأعطال',fr:'Pannes',en:'Faults'}},
 {button:safetyTab,id:'safety',icon:'⬡',labels:{ar:'السلامة',fr:'Sécurité',en:'Safety'}},
 {button:historyTab,id:'log',icon:'▤',labels:{ar:'السجل',fr:'Historique',en:'History'}},
 {button:moreTab,id:'v03',icon:'⋯',labels:{ar:'المزيد',fr:'Plus',en:'More'}}
];
tabs.forEach(t=>{
 t.button.classList.add('bottom-tab');
 t.button.dataset.tab=t.id;
 t.button.innerHTML='<span class="bottom-tab-icon" aria-hidden="true">'+t.icon+'</span><span class="bottom-tab-label"></span>';
 t.button.type='button';
});
function language(){return ($('#languageSwitcher')||{}).value||document.documentElement.lang||'ar'}
function applyLabels(){
 const lang=language();
 tabs.forEach(t=>{const label=t.button.querySelector('.bottom-tab-label');if(label)label.textContent=t.labels[lang]||t.labels.ar;t.button.setAttribute('aria-label',t.labels[lang]||t.labels.ar)});
 const copy={
 ar:{label:'حالة القياسات المتاحة',unknown:'لا أعرف / لست متأكدًا',none:'لا توجد قراءة متاحة',available:'توجد قراءات مسجلة بالفعل',hint:'لا تنفّذ قياسًا حيًا أو تلمس معدات خطرة لمجرد الإجابة. استخدم فقط المعلومات والقراءات المتاحة بالفعل.'},
 en:{label:'Measurement availability',unknown:"I don't know / not sure",none:'No reading available',available:'Existing readings are available',hint:'Do not perform a live measurement or touch hazardous equipment just to answer. Use only information and readings already available.'},
 fr:{label:'Disponibilité des mesures',unknown:'Je ne sais pas / incertain',none:'Aucune mesure disponible',available:'Des mesures déjà relevées sont disponibles',hint:'N’effectuez pas de mesure en direct et ne touchez pas un équipement dangereux pour répondre. Utilisez uniquement les informations déjà disponibles.'}
 };
 const c=copy[lang]||copy.ar, label=document.querySelector('label[for="aiMeasurementStatus"]'),select=$('#aiMeasurementStatus'),hint=$('#aiMeasurementHint');
 if(label)label.textContent=c.label;
 if(select&&select.options.length>=3){select.options[0].textContent=c.unknown;select.options[1].textContent=c.none;select.options[2].textContent=c.available}
 if(hint)hint.textContent=c.hint;
 nav.setAttribute('aria-label',lang==='en'?'Main navigation':lang==='fr'?'Navigation principale':'التنقل الرئيسي');
}
function activate(id,scroll){
 const target=panel(id);if(!target)return;
 document.querySelectorAll('main .panel').forEach(p=>p.classList.toggle('active',p===target));
 tabs.forEach(t=>t.button.classList.toggle('active',t.id===id));
 if(scroll)window.scrollTo({top:0,behavior:'smooth'});
}
nav.addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;const item=tabs.find(t=>t.button===b);if(item){e.preventDefault();activate(item.id,true)}});
document.addEventListener('click',e=>{
 const go=e.target.closest('[data-go]');if(!go)return;
 const key=go.getAttribute('data-go');
 const map={diagnose:'diagnose',log:'log',v03:'v03',ai:'diagnose'};
 if(map[key]){activate(map[key],true);if(key==='ai'){setTimeout(()=>{const input=$('#aiSymptom');if(input)input.focus({preventScroll:true})},180)}}
});
const langSwitch=$('#languageSwitcher');if(langSwitch)langSwitch.addEventListener('change',applyLabels);
applyLabels();
nav.classList.add('bottom-navigation');
activate('homeDashboard',false);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initializeNavigation,{once:true});
else initializeNavigation();
})();