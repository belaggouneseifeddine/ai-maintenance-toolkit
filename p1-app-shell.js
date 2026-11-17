/* Theme controller only. Navigation ownership belongs to navigation-redesign.js. */
(function(){
'use strict';
function init(){
 const root=document.documentElement;
 const $=selector=>document.querySelector(selector);
 const labels={
  ar:{dark:'الوضع الداكن',light:'الوضع الفاتح'},
  en:{dark:'Dark mode',light:'Light mode'},
  fr:{dark:'Mode sombre',light:'Mode clair'}
 };
 const lang=()=>($('#languageSwitcher')||{}).value||'ar';
 function updateThemeLabel(){
  const copy=labels[lang()]||labels.ar;
  const toggle=$('#themeToggle');
  if(toggle){
   const dark=root.dataset.theme!=='light';
   toggle.textContent=dark?copy.light:copy.dark;
   toggle.setAttribute('aria-pressed',String(dark));
  }
 }
 let saved='dark';
 try{saved=localStorage.getItem('maintenance-ai-toolkit-theme-v1')||'dark'}catch{}
 root.dataset.theme=saved==='light'?'light':'dark';
 const meta=document.querySelector('meta[name="theme-color"]');
 function setTheme(value){
  root.dataset.theme=value==='light'?'light':'dark';
  try{localStorage.setItem('maintenance-ai-toolkit-theme-v1',root.dataset.theme)}catch{}
  if(meta)meta.content=root.dataset.theme==='dark'?'#0b1422':'#f3f6fb';
  updateThemeLabel();
 }
 const toggle=$('#themeToggle');
 if(toggle)toggle.onclick=()=>setTheme(root.dataset.theme==='dark'?'light':'dark');
 const language=$('#languageSwitcher');
 if(language&&!language.dataset.p1ThemeBound){
  language.dataset.p1ThemeBound='1';
  language.addEventListener('change',updateThemeLabel);
 }
 if(meta)meta.content=root.dataset.theme==='dark'?'#0b1422':'#f3f6fb';
 updateThemeLabel();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
else init();
})();
