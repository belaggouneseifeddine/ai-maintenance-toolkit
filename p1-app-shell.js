/* P1 app shell controller: five destinations and dark theme by default. */
(function(){
'use strict';
function init(){
 const root=document.documentElement,nav=document.querySelector('.nav');
 if(!nav)return;
 const $=s=>document.querySelector(s);
 const labels={
  ar:{assistant:'المساعد',knowledge:'الأعطال والمعرفة',safety:'السلامة',log:'السجل',more:'المزيد',dark:'الوضع الداكن',light:'الوضع الفاتح'},
  en:{assistant:'Assistant',knowledge:'Faults & knowledge',safety:'Safety',log:'Log',more:'More',dark:'Dark mode',light:'Light mode'},
  fr:{assistant:'Assistant',knowledge:'Pannes & savoir',safety:'Sécurité',log:'Journal',more:'Plus',dark:'Mode sombre',light:'Mode clair'}
 };
 const lang=()=>($('#languageSwitcher')||{}).value||'ar';
 const tabs=[
  ['diagnose','assistant'],['knowledge','knowledge'],['safety','safety'],['log','log'],['v03','more']
 ];
 const home=$('#homeDashboard'),diagnose=$('#diagnose');
 if(home&&diagnose){
  home.classList.remove('panel','active');
  home.classList.add('assistant-dashboard');
  diagnose.insertBefore(home,diagnose.firstChild);
 }
 const homeTab=nav.querySelector('[data-tab="homeDashboard"]');
 if(homeTab)homeTab.remove();
 const aiTab=nav.querySelector('[data-tab="ai"]');
 if(aiTab){aiTab.dataset.tab='v03';aiTab.setAttribute('aria-label',labels[lang()].more);}
 const tabButtons=tabs.map(([id,key])=>nav.querySelector('[data-tab="'+id+'"]')).filter(Boolean);
 function updateLabels(){
  const copy=labels[lang()]||labels.ar;
  tabs.forEach(([id,key])=>{
   const b=nav.querySelector('[data-tab="'+id+'"]');if(!b)return;
   const label=b.querySelector('.bottom-tab-label');if(label)label.textContent=copy[key];
   b.setAttribute('aria-label',copy[key]);
  });
  const toggle=$('#themeToggle');
  if(toggle){const dark=root.dataset.theme!=='light';toggle.textContent=dark?copy.light:copy.dark;toggle.setAttribute('aria-pressed',String(dark));}
 }
 let saved='dark';
 try{saved=localStorage.getItem('maintenance-ai-toolkit-theme-v1')||'dark'}catch{}
 root.dataset.theme=saved==='light'?'light':'dark';
 const meta=document.querySelector('meta[name="theme-color"]');
 function setTheme(value){
  root.dataset.theme=value;
  try{localStorage.setItem('maintenance-ai-toolkit-theme-v1',value)}catch{}
  if(meta)meta.content=value==='dark'?'#0b1220':'#0f766e';
  updateLabels();
 }
 const toggle=$('#themeToggle');
 if(toggle&&!toggle.dataset.p1Bound){toggle.dataset.p1Bound='1';toggle.addEventListener('click',()=>setTheme(root.dataset.theme==='dark'?'light':'dark'));}
 const language=$('#languageSwitcher');
 if(language&&!language.dataset.p1Bound){language.dataset.p1Bound='1';language.addEventListener('change',updateLabels);}
 nav.setAttribute('aria-label',lang()==='en'?'Main navigation':lang()==='fr'?'Navigation principale':'التنقل الرئيسي');
 updateLabels();
 const activateMore=()=>{
  const target=$('#v03');if(!target)return;
  document.querySelectorAll('main .panel').forEach(p=>p.classList.toggle('active',p===target));
  tabs.forEach(([id])=>{const b=nav.querySelector('[data-tab="'+id+'"]');if(b)b.classList.toggle('active',id==='v03')});
  window.scrollTo({top:0,behavior:'smooth'});
 };
 nav.addEventListener('click',e=>{
  const b=e.target.closest('.tab[data-tab="v03"]');if(!b)return;
  e.preventDefault();activateMore();
 });
 const more=nav.querySelector('[data-tab="v03"]');
 if(more)more.addEventListener('click',e=>{e.preventDefault();activateMore()});
 const current=nav.querySelector('[data-tab="diagnose"]');
 if(current){current.classList.add('active');document.querySelectorAll('main .panel').forEach(p=>p.classList.toggle('active',p===diagnose));}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();