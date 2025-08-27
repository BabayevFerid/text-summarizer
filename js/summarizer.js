/* summarizer.js — tezlik əsaslı extractive summarizer */

import { STOPWORDS, detectLanguage, tokenizeWords, splitSentences } from "./utils.js";

/**
 * Mətn xülasəsi
 * @param {string} text
 * @param {{ mode:"ratio"|"sentences", ratio?:number, count?:number, language:"auto"|"az"|"en", keepOrder:boolean }} options
 * @returns {{ summary: string, sentences: string[], pickedIdx: number[], scores: number[] }}
 */
function summarizeText(text, options){
  const { mode, ratio=0.25, count=3, language="auto", keepOrder=true } = options;

  // 1) Cümlələr
  const sentences = splitSentences(text);
  if (sentences.length === 0) return { summary:"", sentences:[], pickedIdx:[], scores:[] };

  // 2) Dil
  const lang = language === "auto" ? detectLanguage(text) : language;
  const stop = STOPWORDS[lang] || new Set();

  // 3) Tezlik xəritəsi
  const freq = new Map();
  const allWords = tokenizeWords(text);
  allWords.forEach(w=>{
    if(!stop.has(w) && w.length>1){
      freq.set(w, (freq.get(w)||0)+1);
    }
  });

  // 4) Normalizasiya
  let maxFreq = 0;
  for(const v of freq.values()) if(v>maxFreq) maxFreq = v || 1;
  for(const [k,v] of freq) freq.set(k, v / maxFreq);

  // 5) Cümlə skorları
  const scores = sentences.map(s=>{
    const words = tokenizeWords(s);
    let sum = 0;
    for(const w of words){
      if(freq.has(w)) sum += freq.get(w);
    }
    // Cümlə uzunluğuna görə yüngül normalizasiya
    const len = Math.max(words.length, 1);
    return sum / Math.sqrt(len);
  });

  // 6) Neçə cümlə?
  let k = mode === "sentences" ? Math.max(1, Math.min(count, sentences.length))
                               : Math.max(1, Math.min(sentences.length, Math.round(sentences.length * ratio)));

  // 7) Top-k seçimi
  const idx = scores.map((s,i)=>({s,i})).sort((a,b)=>b.s-a.s).slice(0,k).map(o=>o.i);
  const pickedIdx = keepOrder ? idx.sort((a,b)=>a-b) : idx;

  const picked = pickedIdx.map(i=>sentences[i]);
  const summary = picked.join(" ");

  return { summary, sentences, pickedIdx, scores };
}

export { summarizeText };
