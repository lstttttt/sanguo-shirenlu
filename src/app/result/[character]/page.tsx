"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Download, Link2, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AncientButton } from "@/components/AncientButton";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { Portrait } from "@/components/Portrait";
import { characters, characterMap } from "@/data/characters";
import { type CharacterId } from "@/data/questions";
import { resultMode, type StoredResult } from "@/lib/scoring";

export default function ResultPage() {
  const params = useParams<{ character: string }>();
  const id = (params.character in characterMap ? params.character : "sunce") as CharacterId;
  const character = characterMap[id];
  const [result, setResult] = useState<StoredResult | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [toast, setToast] = useState("");
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      try { const raw = localStorage.getItem("shirenlu-result"); if (raw) setResult(JSON.parse(raw)); } catch {}
    }, 0);
    const timer = window.setTimeout(() => setRevealed(true), 1450);
    return () => { window.clearTimeout(loadTimer); window.clearTimeout(timer); };
  }, []);

  const displayScores = useMemo(() => {
    if (result?.scores?.length) return result.scores;
    return [{id,score:82,raw:0}, ...characters.filter(c=>c.id!==id).slice(0,2).map((c,i)=>({id:c.id,score:72-i*7,raw:0}))];
  }, [result,id]);
  const primary = displayScores.find(s=>s.id===id) || displayScores[0];
  const secondary = displayScores.find(s=>s.id!==id) || displayScores[1];
  const mode = resultMode(displayScores);
  const topDimensions = result?.dimensions?.slice(0,3) || character.traits.map((name,i)=>({name,score:88-i*7}));

  async function share() {
    const shareData = { title:"三国识人录", text:`我的三国精神原型是${character.name}——${character.motto}。你会是谁？`, url:location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`); showToast("分享文案已复制"); }
    } catch {}
  }
  async function copyLink() { await navigator.clipboard.writeText(location.href); showToast("链接已抄入剪贴板"); }
  function showToast(message:string) { setToast(message); window.setTimeout(()=>setToast(""),1800); }
  function downloadCard() {
    const canvas = document.createElement("canvas"); canvas.width=1080; canvas.height=1440;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    ctx.fillStyle="#eee7d7"; ctx.fillRect(0,0,1080,1440);
    for(let i=0;i<9000;i++){ctx.fillStyle=`rgba(56,47,35,${Math.random()*.045})`;ctx.fillRect(Math.random()*1080,Math.random()*1440,1,1)}
    ctx.strokeStyle="#9b2c2c";ctx.lineWidth=3;ctx.strokeRect(72,72,936,1296);
    ctx.textAlign="center";ctx.fillStyle="#52636a";ctx.font="32px serif";ctx.fillText("三 国 识 人 录",540,170);
    ctx.fillStyle=character.tone;ctx.beginPath();ctx.arc(540,520,220,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#eee7d7";ctx.font="bold 300px serif";ctx.fillText(character.name.slice(0,1),540,625);
    ctx.fillStyle="#1c1b18";ctx.font="36px serif";ctx.fillText("我的三国精神原型",540,850);
    ctx.font="bold 116px serif";ctx.fillText(character.name,540,990);
    ctx.fillStyle="#9b2c2c";ctx.font="34px serif";ctx.fillText(`${primary.score}% 精神契合`,540,1060);
    ctx.fillStyle="#1c1b18";ctx.font="42px serif";ctx.fillText(`「${character.motto}」`,540,1165);
    ctx.fillStyle="#52636a";ctx.font="28px serif";ctx.fillText("循三十六问 · 观乱世本心",540,1300);
    const a=document.createElement("a");a.download=`三国识人录-${character.name}.png`;a.href=canvas.toDataURL("image/png");a.click();
    showToast("人物笺已生成");
  }

  return (
    <PageShell className="result-page">
      <AnimatePresence>{!revealed && <motion.div className="reveal-screen" exit={{opacity:0}} transition={{duration:.8}}>
        <motion.div className="reveal-ink" initial={{scale:0,opacity:0}} animate={{scale:5,opacity:1}} transition={{duration:1.3,ease:"easeIn"}} />
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.3}}>三十六问既毕</motion.p>
        <motion.span initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.75}}>且看 · 史册映出何人</motion.span>
      </motion.div>}</AnimatePresence>

      <header className="result-nav"><BrandMark compact/><span>人物志 · {character.era}</span><button onClick={share}><Share2 size={17}/>分享</button></header>
      <section className="result-hero" style={{"--tone":character.tone} as React.CSSProperties}>
        <div className="result-hero__copy">
          <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1.5}}>你的三国精神原型</motion.p>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.65,duration:.7}}>{character.name}</motion.h1>
          <motion.div className="result-hero__title" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.9}}>{character.title}</motion.div>
          <motion.blockquote initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.05}}>「{character.motto}」</motion.blockquote>
          <motion.div className="score-ring" initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{delay:2.1}}>
            <span><b>{primary.score}</b>%</span><small>精神契合度</small>
          </motion.div>
        </div>
        <motion.div initial={{opacity:0,filter:"blur(16px)",y:30}} animate={{opacity:1,filter:"blur(0px)",y:0}} transition={{delay:1.55,duration:1.1}}><Portrait character={character}/></motion.div>
        <a className="scroll-cue" href="#mirror"><span>阅此人物志</span><ArrowDown size={16}/></a>
      </section>

      <section className="result-section mirror-section" id="mirror">
        <SectionHead index="壹" eyebrow="以史照今" title="你的性格映照"/>
        <div className="mirror-grid">
          <div className="mirror-prose"><span className="drop-cap">你</span><p>{character.summary}</p><p>{dynamicReading(character.name, topDimensions.map(d=>d.name), mode, characterMap[secondary.id]?.name)}</p></div>
          <div className="trait-panel"><p>你最鲜明的三种倾向</p>{topDimensions.map((d,i)=><div className="trait-row" key={d.name}><span>{String(i+1).padStart(2,"0")}</span><b>{d.name}</b><div><i style={{width:`${d.score}%`}}/></div><em>{d.score}</em></div>)}</div>
        </div>
        {mode !== "single" && secondary && <div className="dual-note"><span>{mode === "dual" ? "双原型" : "兼有其质"}</span><p>你也与 <b>{characterMap[secondary.id].name}</b> 有 {secondary.score}% 的契合。{mode === "dual" ? "两种精神结构在你身上并行，并非必须分出唯一答案。" : "它像一笔副墨，让你的主型更有层次。"}</p></div>}
      </section>

      <section className="result-section story-section">
        <SectionHead index="贰" eyebrow="人物小传" title="他如何走过乱世"/>
        <div className="story-lead"><b>{character.courtesy}</b><span>{character.quote}</span></div>
        <div className="story-grid">{character.story.map((item,i)=><motion.article key={item.title} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.3}} transition={{delay:i*.08}}><span>0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></motion.article>)}</div>
      </section>

      <section className="result-section archive-section">
        <SectionHead index="叁" eyebrow="史家评曰" title="史册中的他" light/>
        <div className="archive-card"><div className="archive-card__seal">史<br/>证</div><span className="archive-card__source">出处 · {character.source}</span><blockquote>{character.historical}</blockquote><div><b>今人可鉴</b><p>{character.modern}</p></div></div>
      </section>

      <section className="result-section relations-section">
        <SectionHead index="肆" eyebrow="观其同道" title="与你并肩的人"/>
        <div className="relations-grid">
          <article><span>最宜同谋</span><h3>{character.ally}</h3><p>{character.allyReason}</p></article>
          <div className="relation-line"><i/><b>{character.name}</b><i/></div>
          <article><span>易生张力</span><h3>{character.tension}</h3><p>{character.tensionReason}</p></article>
        </div>
      </section>

      <section className="result-section share-section" ref={shareRef}>
        <div className="share-card" style={{"--tone":character.tone} as React.CSSProperties}>
          <span>三 国 识 人 录</span><div className="share-card__glyph">{character.name[0]}</div><small>我的三国精神原型</small><h2>{character.name}</h2><blockquote>「{character.motto}」</blockquote><p>循三十六问 · 观乱世本心</p>
        </div>
        <div className="share-actions"><SectionHead index="伍" eyebrow="落印成笺" title="将这页人物志赠予友人"/><p>真正有趣的不是谁更像英雄，而是你们会如何一起面对乱局。</p><div><AncientButton tone="seal" onClick={share}><Share2 size={17}/>唤友共阅</AncientButton><button onClick={downloadCard}><Download size={17}/>保存人物笺</button><button onClick={copyLink}><Link2 size={17}/>复制链接</button></div></div>
      </section>

      <footer className="result-footer"><p>此卷只作历史兴趣与自我观察，不构成心理诊断或职业鉴定。</p><Link href="/test"><RotateCcw size={16}/>重启一卷</Link></footer>
      <AnimatePresence>{toast && <motion.div className="toast" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{toast}</motion.div>}</AnimatePresence>
    </PageShell>
  );
}

function SectionHead({index,eyebrow,title,light=false}:{index:string;eyebrow:string;title:string;light?:boolean}) { return <div className={`section-head ${light?"is-light":""}`}><span>{index}</span><div><small>{eyebrow}</small><h2>{title}</h2></div></div> }
function dynamicReading(name:string, dims:string[], mode:string, secondary?:string) {
  const core = dims.slice(0,2).join("与");
  if(mode === "dual") return `你像${name}，不只是因为某一项选择，而是“${core}”共同构成了你的行为轮廓。与此同时，${secondary}式的倾向也清晰存在，使你更像一幅双墨交叠的画像。`;
  return `你像${name}，不只是因为一个表面的标签，而是“${core}”共同构成了你的选择方式。真正照见你的，是这些倾向在复杂处境中如何同时出现。`;
}
