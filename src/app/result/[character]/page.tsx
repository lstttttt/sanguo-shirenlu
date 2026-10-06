"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, ExternalLink, Link2, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AncientButton } from "@/components/AncientButton";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { Portrait } from "@/components/Portrait";
import { ShareCard } from "@/components/ShareCard";
import { characterMap } from "@/data/characters";
import { historicalContent, type CharacterHistoricalContent, type HistoricalSource } from "@/data/historical-content";
import { type CharacterId } from "@/data/questions";
import { calculateResult, QUESTION_VERSION, type StoredResult } from "@/lib/scoring";

export default function ResultPage(){
  const params=useParams<{character:string}>();
  const id=(params.character in characterMap?params.character:"sunce") as CharacterId;
  const character=characterMap[id];
  const [result,setResult]=useState<StoredResult|null>(null);
  const [resultReady,setResultReady]=useState(false);
  const [revealed,setRevealed]=useState(false);
  const [toast,setToast]=useState("");

  useEffect(()=>{const loadTimer=window.setTimeout(()=>{let restored:StoredResult|null=null;try{const raw=localStorage.getItem("shirenlu-result-v4");const saved=raw?JSON.parse(raw):null;if(saved?.questionVersion===QUESTION_VERSION&&Array.isArray(saved?.answers)&&saved.answers.length===36){const recalculated=calculateResult(saved.answers);if(recalculated.explanation.primaryId===id)restored=recalculated;}}catch{}setResult(restored);setResultReady(true);if(!restored)setRevealed(true);},0);return()=>clearTimeout(loadTimer);},[id]);
  useEffect(()=>{if(!result)return;const timer=window.setTimeout(()=>setRevealed(true),700);return()=>clearTimeout(timer);},[result]);
  const quality=result?.quality;
  const rich=historicalContent[id];

  async function share(){const text=result?`我的三国精神原型更接近${character.name}——${character.motto}。你会是谁？`:`读一页${character.name}人物志：正史、文学与后世评价如何彼此不同。`;const data={title:"三国识人录",text,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text}\n${data.url}`);showToast("分享文案已复制");}}catch{}}
  async function copyLink(){await navigator.clipboard.writeText(location.href);showToast("链接已复制");}
  function showToast(message:string){setToast(message);setTimeout(()=>setToast(""),1800);}
  function downloadCard(){const svg=document.getElementById("share-card-svg");if(!(svg instanceof SVGSVGElement))return;const source=new XMLSerializer().serializeToString(svg);const image=new Image();const blob=new Blob([source],{type:"image/svg+xml;charset=utf-8"});const url=URL.createObjectURL(blob);image.onload=()=>{const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1440;const context=canvas.getContext("2d");if(context){context.drawImage(image,0,0);const a=document.createElement("a");a.download=`三国识人录-${character.name}.png`;a.href=canvas.toDataURL("image/png");a.click();showToast("人物笺已生成");}URL.revokeObjectURL(url);};image.src=url;}

  if(!resultReady)return <PageShell className="result-page"/>;

  return <PageShell className="result-page">
    <AnimatePresence>{result&&!revealed&&<motion.div className="reveal-screen" exit={{opacity:0}} transition={{duration:.2}}><motion.div className="reveal-ink" initial={{scale:.4,opacity:.35}} animate={{scale:5,opacity:1}} transition={{duration:.55}}/><p>三十六问既毕</p><span>且看 · 史册映出何人</span></motion.div>}</AnimatePresence>
    <header className="result-nav"><BrandMark compact/><span>人物志 · {character.era}</span><button onClick={share}><Share2 size={17}/>分享</button></header>
    <section className="result-hero" style={{"--tone":character.tone} as React.CSSProperties}>
      <motion.div className="result-hero__copy" initial={false} animate={{opacity:1,y:0}}>
        <p>{result?"本次人物对照":"公开人物志"}</p><h1>{character.name}</h1><div className="result-hero__title">{rich?.heroLine??rich?.historyVsFiction.history??character.title}</div>
        {result&&quality?<div className="match-level"><b>{result.explanation.confidenceLabel}</b><span>{quality.precise?`这一卷把你带向${character.name}的处事侧面；它只是一场局中选择的趣味对照。`:`${character.name}是这次较接近的方向，不是唯一或精确判断。`}</span></div>:<div className="match-level public-profile-note"><b>人物资料模式</b><span>这个链接没有可恢复的答题记录，因此只展示人物资料，不生成你的分数或人格判断。</span></div>}
        <p className="hero-tension">{rich?.tensionLine??`${character.strengths[0]}能帮助他打开局面，也可能让他付出${character.risks[0]}的代价。`}</p>
        <blockquote><small>为你题写 · 产品原创</small>「{rich?.originalSealLine??character.motto}」</blockquote>
      </motion.div>
      <motion.div initial={false} animate={{opacity:1,filter:"blur(0px)",y:0}}><Portrait character={character}/><p className="portrait-meta">{character.era}<span>{character.courtesy}</span></p></motion.div>
    </section>

    {rich?<section className="reading-hub" aria-label="人物志深入阅读"><div className="reading-hub__intro"><span>按兴趣深入</span><h2>人物经历与材料辨析</h2><p>先看摘要，再展开你关心的部分；史料与产品解读会保持分层。</p></div><details className="reading-group" open><summary><div><small>阅读一</small><b>认识这个人</b><span>四个历史节点、功与代价、人物关系</span></div><ChevronDown size={20}/></summary><div className="reading-group__body"><TimelineSection content={rich}/><AchievementSection pairs={rich.achievementCostPairs}/><RelationsSection character={character}/></div></details><details className="reading-group"><summary><div><small>阅读二</small><b>史料与演义</b><span>不同材料、后世接受与三种镜头</span></div><ChevronDown size={20}/></summary><div className="reading-group__body"><VoicesSection characterName={character.name} evaluations={rich.evaluations}/><PoetrySection poetry={rich.poetry}/><LensesSection characterName={character.name} content={rich}/></div></details></section>:<section className="result-section history-section"><SectionHead index="贰" eyebrow="史料所见" title="历史如何留下他的身影"/><div className="history-layout"><div className="story-grid">{character.story.map((item,i)=><motion.article key={item.title} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}}><span>0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></motion.article>)}</div><aside className="archive-card"><span className="archive-card__source">史料概括</span><blockquote>{character.historical}</blockquote><p>据 {character.source}</p><div><b>放到今天</b><p>{character.modern}</p></div></aside></div></section>}

    {rich?.closingLine&&<section className="result-section"><blockquote className="closing-line"><small>卷末题跋</small>{rich.closingLine}</blockquote></section>}
    <section className="result-section share-section"><div className="share-card share-card--svg"><ShareCard character={character} isPersonal={Boolean(result&&quality?.precise)}/></div><div className="share-actions"><SectionHead index={rich?"捌":"肆"} eyebrow="落印成笺" title="将这页人物志赠予友人"/><p>{result?"分享链接只携带人物页面；对方没有你的本地答题记录时，将看到公开人物志，不会看到伪造的个性化分数。":"这是一页公开人物志，不包含任何个人测评数据。"}</p><div><AncientButton tone="seal" onClick={share}><Share2 size={17}/>分享此页</AncientButton><button onClick={downloadCard}><Download size={17}/>保存人物笺</button><button onClick={copyLink}><Link2 size={17}/>复制链接</button></div></div></section>
    <footer className="result-footer"><p>此卷只作历史兴趣与自我观察，不构成心理诊断或职业鉴定。</p><Link href="/test"><RotateCcw size={16}/>重新作答</Link></footer>
    <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{toast}</motion.div>}</AnimatePresence>
  </PageShell>;
}

function SectionHead({index,eyebrow,title}:{index:string;eyebrow:string;title:string}){return <div className="section-head"><span>{index}</span><div><small>{eyebrow}</small><h2>{title}</h2></div></div>;}
function TimelineSection({content}:{content:CharacterHistoricalContent}){return <section className="result-section timeline-section"><SectionHead index="贰" eyebrow="人物年表" title="他如何在历史中形成自己的位置"/><div className="history-timeline">{content.timeline.map((item,index)=><article key={item.title}><div className="timeline-marker"><b>{String(index+1).padStart(2,"0")}</b></div><div className="timeline-copy"><span>{item.date}</span><h3>{item.title}</h3><p>{item.event}</p><blockquote><small>产品解读</small>{item.traitMeaning}</blockquote><details><summary>查看材料说明 <ChevronDown size={15}/></summary>{item.sources.map(source=><SourceDetail source={source} key={source.title+source.chapterOrEpisode}/>)}</details></div></article>)}</div></section>;}
function VoicesSection({characterName,evaluations}:{characterName:string;evaluations:HistoricalSource[]}){return <section className="result-section voices-section"><SectionHead index="叁" eyebrow="众声评传" title={`不同材料，为什么给出不同的${characterName}`}/><p className="section-intro">人物不是一个结论，而是一组无法被完全合并的证据。展开卡片，可以看见材料性质、出处状态与产品解释之间的边界。</p><div className="voices-grid">{evaluations.map((source,index)=><details className={`voice-card source-${source.type}`} key={source.title}><summary><div><span>{source.label}</span><small>{source.author}{source.chapterOrEpisode?` · ${source.chapterOrEpisode}`:""}</small></div><h3>{source.title}</h3>{source.verified&&source.quote&&<blockquote>“{source.quote}”</blockquote>}<p>{source.paraphrase}</p><b>展开解读 <ChevronDown size={15}/></b></summary><div className="voice-card__expanded"><p>{source.interpretation}</p>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">{source.verified?"核对具体材料":"阅读相关作品"} <ExternalLink size={14}/></a>}<small>{source.verified?"已逐项核对":"待逐项核对，不作为精确引文凭据"} · 材料 {index+1}</small></div></details>)}</div></section>;}
function PoetrySection({poetry}:{poetry:HistoricalSource[]}){const selfAuthored=poetry.some(source=>source.label==="人物自作");return <section className="result-section poetry-section"><SectionHead index="肆" eyebrow={selfAuthored?"诗文照影":"后世接受"} title={selfAuthored?"人物自己的文字与精神线索":"后人如何书写并记住他"}/><div className="poetry-stack">{poetry.map((source,index)=><details key={source.title} open={index===0}><summary><span>{source.label} · {source.author}{source.title?`《${source.title}》`:""}</span>{source.verified&&source.quote&&<blockquote>“{source.quote}”</blockquote>}<b>{index===0?"正在展读":"展开第二则"}<ChevronDown size={15}/></b></summary><div><p>{source.paraphrase}</p><p>{source.interpretation}</p>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">{source.verified?"查看具体材料":"阅读相关作品"} <ExternalLink size={14}/></a>}</div></details>)}</div></section>;}
function AchievementSection({pairs}:{pairs:Array<{strength:string;cost:string}>}){return <section className="result-section achievement-section"><SectionHead index="伍" eyebrow="功与代价" title="帮助他成事的，也可能令他失去什么"/><p className="section-intro">真正值得借鉴的，不是复制他的选择，而是看清一种能力在什么位置开始变成代价。</p><div className="achievement-table"><header><span>形成成就的能力</span><span>同一能力可能造成的代价</span></header>{pairs.map(pair=><div key={pair.strength}><p>{pair.strength}</p><i aria-hidden="true">→</i><p>{pair.cost}</p></div>)}</div></section>;}
function LensesSection({characterName,content}:{characterName:string;content:CharacterHistoricalContent}){return <section className="result-section lenses-section"><SectionHead index="陆" eyebrow="三种镜头" title="历史中的他、文学中的他、你结果中的他"/><div className="lenses-grid"><article><span>正史中的{characterName}</span><p>{content.historyVsFiction.history}</p></article><article><span>文学中的{characterName}</span><p>{content.historyVsFiction.fiction}</p></article><article><span>本次测评所取</span><p>{content.historyVsFiction.assessmentUses}</p></article></div><p className="assessment-disclaimer">本测试不是判断你与{characterName}的生平、道德或政治立场相同，只比较部分行为结构。人物原型是理解入口，不是对人格的盖章。</p>{content.closingLine&&<blockquote className="closing-line"><small>今日映照 · 产品原创</small>{content.closingLine}</blockquote>}</section>;}
function RelationsSection({character}:{character:typeof characterMap[CharacterId]}){return <section className="result-section relations-section"><SectionHead index="柒" eyebrow="人物关系" title={`${character.name}与同时代人物的合作及张力`}/><div className="relations-grid"><article><span>史传关系切面</span><h3>{character.ally}</h3><p>{character.allyReason}</p></article><div className="relation-line"><i/><b>{character.name}</b><i/></div><article><span>叙事中的对照</span><h3>{character.tension}</h3><p>{character.tensionReason}</p></article></div><p className="relation-disclaimer">此处讨论历史人物关系，不预测你的现实社交关系。</p></section>;}
function SourceDetail({source}:{source:HistoricalSource}){return <div className="source-detail"><span>{source.label} · {source.verified?"已逐项核对":"待逐项核对"}</span><b>{source.author}《{source.title}》{source.chapterOrEpisode?` · ${source.chapterOrEpisode}`:""}</b>{source.verified&&source.quote&&<blockquote>“{source.quote}”</blockquote>}<p>{source.paraphrase}</p><small>产品解读：{source.interpretation}</small>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">{source.verified?"打开具体材料":"阅读相关作品"} <ExternalLink size={13}/></a>}</div>;}
