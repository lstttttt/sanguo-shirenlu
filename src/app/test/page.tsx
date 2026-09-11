"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { QuestionCard } from "@/components/QuestionCard";
import { questions } from "@/data/questions";
import { calculateResult } from "@/lib/scoring";

const interludes = [
  ["观其决断","乱世之中，迟疑与果决都不是答案；真正重要的，是你为何在此刻出手。"],
  ["观其用人","成事从来不只靠一人之勇。你如何看待异议，便如何决定同行者的远近。"],
  ["观其进退","能忍者未必怯，敢进者未必躁。时间，也是一种可以调遣的力量。"],
  ["观其合纵","敌友并非刻在竹简上的名字。局势改变时，你是否仍能看见共同的道路？"],
  ["观其所守","人在得失之前所守的那条线，往往比一时胜负更接近他的本心。"],
];

export default function TestPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [direction, setDirection] = useState(1);
  const [interlude, setInterlude] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("shirenlu-progress") || "null");
        if (saved?.answers) { setAnswers(saved.answers); setCurrent(Math.min(saved.current || 0, 35)); }
      } catch {}
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem("shirenlu-progress", JSON.stringify({ answers, current }));
  }, [answers, current, ready]);

  const answered = useMemo(() => answers.filter(Boolean).length, [answers]);
  const volume = Math.floor(current / 6) + 1;

  function answer(value: number) {
    if (advancing) return;
    setAdvancing(true);
    const nextAnswers = [...answers];
    nextAnswers[current] = value;
    setAnswers(nextAnswers);
    if (current === questions.length - 1) {
      const result = calculateResult(nextAnswers);
      localStorage.setItem("shirenlu-result", JSON.stringify(result));
      localStorage.removeItem("shirenlu-progress");
      window.setTimeout(() => router.push(`/result/${result.scores[0].id}`), 260);
      return;
    }
    window.setTimeout(() => {
      if ((current + 1) % 6 === 0) setInterlude(Math.floor(current / 6));
      else { setDirection(1); setCurrent(v => v + 1); }
      setAdvancing(false);
    }, 220);
  }

  function continueChapter() { setInterlude(null); setDirection(1); setCurrent(v => v + 1); }
  function back() { if (current > 0) { setDirection(-1); setCurrent(v => v - 1); } else router.push("/"); }
  function reset() { localStorage.removeItem("shirenlu-progress"); setAnswers([]); setCurrent(0); setDirection(-1); }

  if (!ready) return <PageShell className="test-page" />;

  return (
    <PageShell className="test-page">
      <header className="test-header">
        <BrandMark compact />
        <div className="test-header__chapter"><span>第 {chineseVolume(volume)} 卷</span><b>{chapterName(volume)}</b></div>
        <button className="icon-button" onClick={reset} aria-label="重新开始"><RotateCcw size={17}/></button>
      </header>
      <div className="progress-wrap" aria-label={`已完成 ${answered} 道，共 36 道`}>
        <div className="progress-meta"><span>卷中行至 · {current + 1}</span><span>{Math.round(answered / 36 * 100)}%</span></div>
        <div className="progress-line"><motion.i animate={{ width: `${answered / 36 * 100}%` }} /></div>
        <div className="chapter-dots">{Array.from({length:6}).map((_,i)=><span key={i} className={i < volume ? "active" : ""}/>)}</div>
      </div>
      <section className={`test-stage ${advancing ? "is-advancing" : ""}`}>
        <QuestionCard question={questions[current]} value={answers[current]} direction={direction} onAnswer={answer}/>
      </section>
      <footer className="test-footer">
        <button onClick={back}><ArrowLeft size={16}/>{current === 0 ? "合卷返回" : "回看前问"}</button>
        <span>请依现实中的你作答，而非心中理想</span>
      </footer>
      <AnimatePresence>
        {interlude !== null && <motion.div className="interlude" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div className="interlude__paper" initial={{scaleY:.2,opacity:0}} animate={{scaleY:1,opacity:1}} transition={{duration:.5,ease:[.22,1,.36,1]}}>
            <span className="interlude__label">史册小憩 · 卷 {interlude+1} 已毕</span>
            <h2>{interludes[interlude][0]}</h2>
            <p>{interludes[interlude][1]}</p>
            <button onClick={continueChapter}>展读下一卷 <span>→</span></button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </PageShell>
  );
}

function chineseVolume(n:number) { return ["一","二","三","四","五","六"][n-1]; }
function chapterName(n:number) { return ["临事","远谋","进退","合纵","守心","权变"][n-1]; }
