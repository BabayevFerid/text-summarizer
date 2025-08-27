/* utils.js — yardımçı funksiyalar */

// Sadə AZ & EN stopwords (istəyə görə genişləndirə bilərsən)
const STOPWORDS = {
  az: new Set([
    "və","ya","ki","bu","bir","hər","ilə","üçün","amma","lakin","daha","də","da","o","onun",
    "mən","sən","biz","siz","onlar","heç","çox","az","əgər","necə","nə","niyə","vəya","yox"
  ]),
  en: new Set([
    "the","and","a","an","in","on","at","of","for","to","is","are","was","were","be","been",
    "this","that","these","those","with","as","by","or","if","it","its","from","into","about",
    "but","so","than","then","not","no","yes","i","you","he","she","we","they","them","his","her"
  ])
};

// Dil təyini (çox sadə heuristic)
function detectLanguage(text){
  const azChars = /[əğıöüçş]/i;
  if(azChars.test(text)) return "az";
  // default EN
  return "en";
}

function tokenizeWords(text){
  return text
    .toLowerCase()
    .replace(/[\d_]+/g," ")
    .replace(/[^\p{L}\s'-]+/gu," ")
    .split(/\s+/)
    .filter(Boolean);
}

// Cümlələrə bölmə
function splitSentences(text){
  // Nöqtə, ? ! və Azərbaycan dırnaqları üçün sadə bölücü
  const parts = text
    .replace(/\s+([?!.…]+)/g,"$1")
    .split(/(?<=[\.\?\!…])\s+(?=[\p{L}\d“"'])/u)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.length ? parts : (text.trim() ? [text.trim()] : []);
}

function wordCount(text){
  return tokenizeWords(text).length;
}
function charCount(text){
  return [...text].length;
}

async function copyToClipboard(text){
  try{
    await navigator.clipboard.writeText(text);
    return true;
  }catch{
    return false;
  }
}

function downloadFile(filename, content){
  const blob = new Blob([content], {type: "text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function saveLocal(key, value){
  try{ localStorage.setItem(key, value); }catch{}
}
function readLocal(key, fallback=""){
  try{ return localStorage.getItem(key) ?? fallback; }catch{ return fallback; }
}

export { STOPWORDS, detectLanguage, tokenizeWords, splitSentences, wordCount, charCount, copyToClipboard, downloadFile, saveLocal, readLocal };
