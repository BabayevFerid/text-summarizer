/* app.js — UI və eventlər */

import { summarizeText } from "./summarizer.js";
import { wordCount, charCount, copyToClipboard, downloadFile, saveLocal, readLocal } from "./utils.js";

const inputEl = document.getElementById("inputText");
const outputEl = document.getElementById("outputText");
const statsEl = document.getElementById("stats");
const outStatsEl = document.getElementById("outStats");
const btnSummarize = document.getElementById("btnSummarize");
const btnClear = document.getElementById("btnClear");
const btnCopy = document.getElementById("btnCopy");
const btnDownload = document.getElementById("btnDownload");
const btnSample = document.getElementById("btnSample");

const modeEl = document.getElementById("mode");
const ratioEl = document.getElementById("ratio");
const ratioLabel = document.getElementById("ratioLabel");
const countEl = document.getElementById("count");
const ratioGroup = document.getElementById("ratioGroup");
const countGroup = document.getElementById("countGroup");
const languageEl = document.getElementById("language");
const keepOrderEl = document.getElementById("keepOrder");

const themeToggle = document.getElementById("themeToggle");

// THEME
(function initTheme(){
  const saved = readLocal("ts_theme", "light");
  if(saved === "dark") document.body.classList.add("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
})();
themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
  saveLocal("ts_theme", document.body.classList.contains("dark") ? "dark" : "light");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// INPUT persist
(function loadPersist(){
  inputEl.value = readLocal("ts_input", "");
  updateStats();
})();
inputEl.addEventListener("input", ()=>{
  updateStats();
  saveLocal("ts_input", inputEl.value);
});

// MODE controls
function syncModeUI(){
  if(modeEl.value === "ratio"){
    ratioGroup.classList.remove("hidden");
    countGroup.classList.add("hidden");
  }else{
    ratioGroup.classList.add("hidden");
    countGroup.classList.remove("hidden");
  }
}
modeEl.addEventListener("change", syncModeUI);
ratioEl.addEventListener("input", ()=>{ ratioLabel.textContent = Number(ratioEl.value).toFixed(2); });

// STATS
function updateStats(){
  statsEl.textContent = `${wordCount(inputEl.value)} söz · ${charCount(inputEl.value)} hərf`;
}
function updateOutStats(){
  outStatsEl.textContent = `${wordCount(outputEl.value)} söz · ${charCount(outputEl.value)} hərf`;
}

// BUTTONS
btnSummarize.addEventListener("click", ()=>{
  const text = inputEl.value.trim();
  if(!text){
    outputEl.value = "";
    updateOutStats();
    return;
  }

  const options = {
    mode: modeEl.value,
    ratio: parseFloat(ratioEl.value),
    count: parseInt(countEl.value, 10),
    language: languageEl.value,
    keepOrder: keepOrderEl.checked
  };

  const { summary } = summarizeText(text, options);
  outputEl.value = summary;
  updateOutStats();
});

btnClear.addEventListener("click", ()=>{
  inputEl.value = "";
  saveLocal("ts_input", "");
  updateStats();
  outputEl.value = "";
  updateOutStats();
  inputEl.focus();
});

btnCopy.addEventListener("click", async ()=>{
  const ok = await copyToClipboard(outputEl.value);
  btnCopy.textContent = ok ? "Kopyalandı ✅" : "Kopyalanmadı ❌";
  setTimeout(()=> btnCopy.textContent = "Kopyala", 1200);
});

btnDownload.addEventListener("click", ()=>{
  const now = new Date();
  const stamp = now.toISOString().slice(0,19).replace(/[:T]/g,"-");
  downloadFile(`summary-${stamp}.txt`, outputEl.value || "");
});

btnSample.addEventListener("click", ()=>{
  inputEl.value = `Mətn xülasələmə (summarization) mətnin qısa və informativ bir formasını çıxarmaq prosesidir. 
Bu proses müxtəlif alqoritmlərdən istifadə edərək həyata keçirilə bilər. 
Tezlik əsaslı (frequency-based) metodlarda sözlərin təkrarlanma tezliyi əsasında cümlələr qiymətləndirilir. 
Daha inkişaf etmiş yanaşmalara TextRank və ya neyron şəbəkələr (abstractive summarization) daxildir. 
Lakin sadə, sürətli və asılılıqsız bir həll üçün tezlik əsaslı çıxarıcı xülasələmə çox effektivdir.`;
  saveLocal("ts_input", inputEl.value);
  updateStats();
});

// Init
syncModeUI();
updateOutStats();
