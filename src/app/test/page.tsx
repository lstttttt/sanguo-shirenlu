"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/data/questions";
import { calculateResult } from "@/lib/scoring";

const interludes = [
  ["第二卷 · 众心未定","决定已经作出。接下来，要看谁愿意与你同行。"],
  ["第三卷 · 各怀所求","同行者渐多，彼此想去的地方却未必相同。"],
  ["第四卷 · 强敌压境","行至半途，真正的风险、代价与底线开始显现。"],
  ["第五卷 · 盟约将裂","共同的目标还在，利益与承诺却已彼此拉扯。"],
  ["第六卷 · 功业与所守","走到最后，所求之外，更要看你愿意失去什么。"],
];

export default function TestPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);
  const [interlude, setInterlude] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [keyboardValue, setKeyboardValue] = useState<number>(3);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("shirenlu-progress-v2") || "null");
        if (saved?.answers) { const savedCurrent=Math.min(saved.current || 0,35); setAnswers(saved.answers); setCurrent(savedCurrent); setKeyboardValue(saved.answers[savedCurrent]||3); }
      } catch {}
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("shirenlu-progress-v2", JSON.stringify({ answers, current }));
  }, [answers, current, ready]);

  const answered = useMemo(() => answers.filter(Boolean).length, [answers]);
  const volume = Math.floor(current / 6) + 1;

  useEffect(() => {
    const onKeyDown=(event:KeyboardEvent)=>{
      if(interlude!==null){if(["Enter"," ","ArrowRight"].includes(event.key)){event.preventDefault();continueChapter();}return;}
      if(advancing)return;
      if(/^[1-5]$/.test(event.key)){event.preventDefault();answer(Number(event.key));return;}
      if(event.key==="ArrowDown"||event.key==="ArrowRight"){event.preventDefault();setKeyboardValue(v=>Math.min(5,v+1));}
      if(event.key==="ArrowUp"||event.key==="ArrowLeft"){event.preventDefault();setKeyboardValue(v=>Math.max(1,v-1));}
      if(event.key==="Enter"){event.preventDefault();answer(keyboardValue);}
    };
    window.addEventListener("keydown",onKeyDown);return()=>window.removeEventListener("keydown",onKeyDown);
  });

  function answer(value: number) {
    if (advancing) return;
    setAdvancing(true);
    const nextAnswers = [...answers];
    nextAnswers[current] = value;
    setAnswers(nextAnswers);
    if (current === questions.length - 1) {
      const result = calculateResult(nextAnswers);
      localStorage.setItem("shirenlu-result-v2", JSON.stringify(result));
      localStorage.removeItem("shirenlu-progress-v2");
      window.setTimeout(() => router.push(`/result/${result.scores[0].id}`), 260);
      return;
    }
    window.setTimeout(() => {
      if ((current + 1) % 6 === 0) setInterlude(Math.floor(current / 6));
      else { setKeyboardValue(nextAnswers[current+1]||3); setDirection(1); setCurrent(v => v + 1); }
      setAdvancing(false);
    }, 160);
  }

  function continueChapter() { setInterlude(null); setKeyboardValue(answers[current+1]||3); setDirection(1); setCurrent(v => v + 1); }
  function back() { if (current > 0) { setKeyboardValue(answers[current-1]||3); setDirection(-1); setCurrent(v => v - 1); } else router.push("/"); }
  function reset() { localStorage.removeItem("shirenlu-progress-v2"); setAnswers([]); setKeyboardValue(3); setCurrent(0); setDirection(-1); }

  if (!ready) return <PageShell className="test-page" />;

  return (
    <PageShell className="test-page">
      <header className="test-header">
        <div className="test-header__chapter"><b>第{chineseVolume(volume)}卷 · {chapterName(volume)}</b></div>
        <span className="test-header__count">{String(current+1).padStart(2,"0")} / 36</span>
      </header>
      <div className="progress-wrap" aria-label={`已完成 ${answered} 道，共 36 道`}>
        <div className="progress-line"><motion.i animate={{ width: `${current / 35 * 100}%` }} /></div>
      </div>
      <section className={`test-stage ${advancing ? "is-advancing" : ""}`}>
        <QuestionCard question={questions[current]} value={answers[current]} keyboardValue={keyboardValue} direction={direction} onAnswer={answer} onKeyboardValue={setKeyboardValue}/>
      </section>
      <footer className="test-footer">
        <button onClick={back}><ArrowLeft size={16}/>{current === 0 ? "返回首页" : "上一题"}</button>
        <span>数字键 1–5 作答 · 方向键选择 · 回车确认</span>
        <button onClick={reset}><RotateCcw size={15}/>重新开始</button>
      </footer>
      <AnimatePresence>
        {interlude !== null && <motion.div className={`interlude ${interlude===2?"is-midpoint":""}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.2}} onClick={continueChapter} role="button" tabIndex={0} aria-label="继续下一卷">
          <motion.div className="interlude__paper" initial={{y:12,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.25,ease:[.22,1,.36,1]}}>
            <span className="interlude__label">卷 {interlude+1} 已毕 · 点击任意处继续</span>
            <h2>{interludes[interlude][0]}</h2>
            <p>{interludes[interlude][1]}</p>
            <button>继续 <span>→</span></button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </PageShell>
  );
}

function chineseVolume(n:number) { return ["一","二","三","四","五","六"][n-1]; }
function chapterName(n:number) { return ["乱局初起","众心未定","各怀所求","强敌压境","盟约将裂","功业与所守"][n-1]; }
