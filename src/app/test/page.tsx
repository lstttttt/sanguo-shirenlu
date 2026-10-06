"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { QuestionCard } from "@/components/QuestionCard";
import { questions, volumes, type AnswerId } from "@/data/questions";
import { calculateResult } from "@/lib/scoring";

const interludes=["消息纷至，先动的人与等得起的人都在付代价。","帐中有旧友，也有能干的陌生人。","盟约写在纸上，边界却在变。","鼓角将起，最难的是决定何时收兵。","有了权力，才看得见它能伤到谁。","局终之后，仍要有人接住留下的事。"];
const PROGRESS="shirenlu-progress-v4", RESULT="shirenlu-result-v4";
export default function TestPage(){
 const router=useRouter(); const [current,setCurrent]=useState(0);const [answers,setAnswers]=useState<AnswerId[]>([]);const [direction,setDirection]=useState(1);const [interlude,setInterlude]=useState<number|null>(null);const [ready,setReady]=useState(false);const [advancing,setAdvancing]=useState(false);const [keyboardValue,setKeyboardValue]=useState<AnswerId>("B");
 useEffect(()=>{const timer=window.setTimeout(()=>{try{const saved=JSON.parse(localStorage.getItem(PROGRESS)||"null");if(Array.isArray(saved?.answers)){setAnswers(saved.answers);setCurrent(Math.min(saved.current||0,35));setKeyboardValue(saved.answers[Math.min(saved.current||0,35)]||"B");}}catch{}setReady(true);},0);return()=>window.clearTimeout(timer);},[]);
 useEffect(()=>{if(ready)localStorage.setItem(PROGRESS,JSON.stringify({answers,current}));},[answers,current,ready]);
 useEffect(()=>{if(interlude===null)return;const timer=window.setTimeout(()=>{setKeyboardValue(answers[current+1]||"B");setCurrent(v=>v+1);setInterlude(null);},900);return()=>clearTimeout(timer);},[interlude,answers,current]);
 useEffect(()=>{const listener=(event:KeyboardEvent)=>{if(advancing||interlude!==null)return;if(["a","b","c"].includes(event.key.toLowerCase()))answer(event.key.toUpperCase() as AnswerId);if(event.key==="ArrowRight"||event.key==="ArrowDown")setKeyboardValue(value=>value==="A"?"B":"C");if(event.key==="ArrowLeft"||event.key==="ArrowUp")setKeyboardValue(value=>value==="C"?"B":"A");if(event.key==="Enter")answer(keyboardValue);};window.addEventListener("keydown",listener);return()=>window.removeEventListener("keydown",listener);});
 const answered=useMemo(()=>answers.filter(Boolean).length,[answers]); const volume=Math.floor(current/6);
 function answer(value:AnswerId){if(advancing)return;setAdvancing(true);const next=[...answers];next[current]=value;setAnswers(next);if(current===35){const result=calculateResult(next);localStorage.setItem(RESULT,JSON.stringify(result));localStorage.removeItem(PROGRESS);window.setTimeout(()=>router.push(`/result/${result.explanation.primaryId}`),240);return;}window.setTimeout(()=>{if((current+1)%6===0)setInterlude(volume);else{setKeyboardValue(next[current+1]||"B");setCurrent(v=>v+1);}setAdvancing(false);},210);}
 function continueChapter(){if(interlude===null)return;setKeyboardValue(answers[current+1]||"B");setCurrent(v=>v+1);setInterlude(null);}
 function back(){if(current>0){setKeyboardValue(answers[current-1]||"B");setDirection(-1);setCurrent(v=>v-1);}else router.push("/");}
 function reset(){localStorage.removeItem(PROGRESS);setAnswers([]);setKeyboardValue("B");setCurrent(0);setDirection(-1);}
 if(!ready)return <PageShell className="test-page"/>;
 return <PageShell className="test-page"><header className="test-header"><div className="test-header__chapter"><b>第{["一","二","三","四","五","六"][volume]}卷 · {volumes[volume]}</b></div><span className="test-header__count">{String(current+1).padStart(2,"0")} / 36</span></header><div className="progress-wrap" aria-label={`已完成 ${answered} 道，共 36 道`}><div className="progress-line"><motion.i animate={{width:`${current/35*100}%`}}/></div></div>{current===0&&<p className="test-brief">你是一位身在汉末的幕府参议。题目中的人名与形势帮助你进入局面；你无须知道历史上谁赢。选择你愿意承担其后果的做法。</p>}<section className={`test-stage ${advancing?"is-advancing":""}`}><QuestionCard question={questions[current]} value={answers[current]} keyboardValue={keyboardValue} direction={direction} onAnswer={answer} onKeyboardValue={setKeyboardValue}/></section><footer className="test-footer"><button onClick={back}><ArrowLeft size={16}/>{current===0?"返回首页":"上一题"}</button><span>A / B / C 作答 · 方向键选择 · 回车确认</span><button onClick={reset}><RotateCcw size={15}/>重新开始</button></footer><AnimatePresence>{interlude!==null&&<motion.div className="interlude" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={continueChapter} role="button" tabIndex={0} aria-label="跳过卷首过场"><motion.div className="interlude__paper" initial={{y:12,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.35}}><span className="interlude__label">下一卷 · 即将展开</span><h2>{volumes[interlude+1]}</h2><p>{interludes[interlude+1]}</p><small>轻触可跳过</small></motion.div></motion.div>}</AnimatePresence></PageShell>;
}
