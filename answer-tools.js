(function(root){
"use strict";
const CACHE_KEY="maintenance-ai-toolkit-answer-cache-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES=12;
function hash(value){
  let h=2166136261;
  const text=JSON.stringify(value);
  for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(36);
}
function readStore(){
  try{const value=JSON.parse(root.localStorage.getItem(CACHE_KEY)||"{}");return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
  catch(_){return {};}
}
function writeStore(value){try{root.localStorage.setItem(CACHE_KEY,JSON.stringify(value));return true;}catch(_){return false;}}
function safeToCache(data){
  return !!data&&typeof data.answer==="string"&&!!data.diagnosis&&
    data.diagnosis.status==="preliminary_assessment"&&!data.safety_gate;
}
function get(payload,now){
  const store=readStore(),key=hash(payload),entry=store[key],time=Number.isFinite(now)?now:Date.now();
  if(!entry)return null;
  if(!Number.isFinite(entry.createdAt)||time-entry.createdAt<0||time-entry.createdAt>=CACHE_TTL_MS){delete store[key];writeStore(store);return null;}
  if(!safeToCache(entry.data)){delete store[key];writeStore(store);return null;}
  return entry.data;
}
function put(payload,data,now){
  if(!safeToCache(data))return false;
  const store=readStore(),time=Number.isFinite(now)?now:Date.now();
  store[hash(payload)]={createdAt:time,data:{answer:data.answer,citations:Array.isArray(data.citations)?data.citations:[],diagnosis:data.diagnosis}};
  const entries=Object.entries(store).sort((a,b)=>(Number(b[1]?.createdAt)||0)-(Number(a[1]?.createdAt)||0)).slice(0,MAX_ENTRIES);
  return writeStore(Object.fromEntries(entries));
}
function clear(){try{root.localStorage.removeItem(CACHE_KEY);return true;}catch(_){return false;}}
const words={
 ar:{cache:"تفعيل التخزين المحلي الاختياري للإجابات المتطابقة لمدة 24 ساعة. لا تُخزّن حالات التصعيد أو تحذيرات السلامة.",speak:"قراءة الإجابة صوتيًا",stop:"إيقاف القراءة",clear:"مسح الإجابات المحفوظة",cleared:"تم مسح الإجابات المحفوظة محليًا.",notice:"هذه الإجابة من الذاكرة المحلية الاختيارية وليست تحليلًا جديدًا. راجع السياق الحالي وإجراءات السلامة.",unsupported:"ميزة القراءة الصوتية غير متاحة في هذا المتصفح.",empty:"لا توجد إجابة لقراءتها."},
 fr:{cache:"Activer le cache local facultatif des réponses identiques pendant 24 h. Les escalades et alertes de sécurité ne sont jamais mises en cache.",speak:"Lire la réponse à voix haute",stop:"Arrêter la lecture",clear:"Effacer les réponses enregistrées",cleared:"Les réponses enregistrées localement ont été effacées.",notice:"Réponse issue du cache local facultatif, pas d’une nouvelle analyse. Vérifiez le contexte et les procédures de sécurité.",unsupported:"La lecture vocale n’est pas disponible dans ce navigateur.",empty:"Aucune réponse à lire."},
 en:{cache:"Optionally cache identical answers on this device for 24 hours. Escalations and safety alerts are never cached.",speak:"Read answer aloud",stop:"Stop reading",clear:"Clear saved answers",cleared:"Saved local answers have been cleared.",notice:"This answer came from the optional local cache, not a fresh analysis. Recheck the current context and safety procedures.",unsupported:"Speech playback is not available in this browser.",empty:"There is no answer to read."}
};
function lang(){const select=root.document&&root.document.getElementById("languageSwitcher");return select&&words[select.value]?select.value:"ar";}
function cacheNotice(language){return (words[language]||words.ar).notice;}
function stopSpeech(){try{if(root.speechSynthesis)root.speechSynthesis.cancel();}catch(_){}}
function speak(){
  const text=root.document&&root.document.getElementById("aiResult");
  const copy=words[lang()];
  if(!root.speechSynthesis||typeof root.SpeechSynthesisUtterance!=="function"){
    const status=root.document&&root.document.getElementById("aiResult");
    if(status)status.textContent+=(status.textContent?"\n\n":"")+copy.unsupported;
    return;
  }
  if(!text||!text.textContent.trim()){if(text)text.textContent=copy.empty;return;}
  stopSpeech();
  const utterance=new root.SpeechSynthesisUtterance(text.textContent);
  utterance.lang=lang()==="fr"?"fr-FR":lang()==="en"?"en-US":"ar";
  utterance.rate=0.95;
  root.speechSynthesis.speak(utterance);
}
function updateVisibility(show){
  const tools=root.document&&root.document.getElementById("aiAnswerTools");
  if(tools)tools.hidden=!show;
}
function updateLabels(){
  const copy=words[lang()];
  const ids={aiCacheLabel:copy.cache,speakAiAnswer:copy.speak,stopAiSpeech:copy.stop,clearAiCache:copy.clear};
  for(const id of Object.keys(ids)){const node=root.document&&root.document.getElementById(id);if(node){if(id==="aiCacheLabel")node.textContent=ids[id];else node.textContent=ids[id];}}
}
function init(){
  if(!root.document)return;
  const speakButton=root.document.getElementById("speakAiAnswer");
  const stopButton=root.document.getElementById("stopAiSpeech");
  const clearButton=root.document.getElementById("clearAiCache");
  const language=root.document.getElementById("languageSwitcher");
  if(speakButton)speakButton.addEventListener("click",speak);
  if(stopButton)stopButton.addEventListener("click",stopSpeech);
  if(clearButton)clearButton.addEventListener("click",function(){
    clear();
    const result=root.document.getElementById("aiResult");
    if(result&&!result.hidden)result.textContent+=(result.textContent?"\n\n":"")+words[lang()].cleared;
  });
  if(language)language.addEventListener("change",updateLabels);
  root.document.addEventListener("maintenance-language-changed",updateLabels);
  updateLabels();
  updateVisibility(false);
}
const api={get,put,clear,hash,safeToCache,cacheNotice,stopSpeech,updateVisibility,updateLabels,CACHE_TTL_MS,MAX_ENTRIES};
root.MaintenanceAnswerTools=api;
if(root.document){if(root.document.readyState==="loading")root.document.addEventListener("DOMContentLoaded",init);else init();}
})(typeof window!=="undefined"?window:globalThis);
