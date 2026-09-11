"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, ExternalLink, Link2, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AncientButton } from "@/components/AncientButton";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { Portrait } from "@/components/Portrait";
import { characters, characterMap } from "@/data/characters";
import { historicalContent, type CharacterHistoricalContent, type HistoricalSource } from "@/data/historical-content";
import { type CharacterId } from "@/data/questions";
import { matchLevel, resultMode, type StoredResult } from "@/lib/scoring";

const neutralQuality={flag:null,message:"",contradictions:0,precise:true} as const;

export default function ResultPage(){
  const params=useParams<{character:string}>();
  const id=(params.character in characterMap?params.character:"sunce") as CharacterId;
  const character=characterMap[id];
  const [result,setResult]=useState<StoredResult|null>(null);
  const [revealed,setRevealed]=useState(false);
  const [toast,setToast]=useState("");

  useEffect(()=>{const loadTimer=window.setTimeout(()=>{try{const raw=localStorage.getItem("shirenlu-result-v2");if(raw)setResult(JSON.parse(raw));}catch{}},0);const timer=window.setTimeout(()=>setRevealed(true),900);return()=>{clearTimeout(loadTimer);clearTimeout(timer);};},[]);
  const displayScores=useMemo(()=>result?.scores?.length?result.scores:[{id,score:78,raw:0},...characters.filter(c=>c.id!==id).slice(0,2).map((c,i)=>({id:c.id,score:68-i*7,raw:0}))],[result,id]);
  const primary=displayScores.find(s=>s.id===id)||displayScores[0];
  const secondary=displayScores.find(s=>s.id!==id)||displayScores[1];
  const mode=resultMode(displayScores); const quality=result?.quality??neutralQuality;
  const topDimensions=result?.dimensions?.slice(0,3)||character.traits.map((name,i)=>({name,score:84-i*8}));
  const allDimensions=result?.dimensions;
  const lowDimension=allDimensions?.[allDimensions.length-1]||{name:"仁义凝聚",score:34};
  const rich=historicalContent[id];

  async function share(){const data={title:"三国识人录",text:`我的三国精神原型是${character.name}——${character.motto}。你会是谁？`,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(`${data.text}\n${data.url}`);showToast("分享文案已复制");}}catch{}}
  async function copyLink(){await navigator.clipboard.writeText(location.href);showToast("链接已复制");}
  function showToast(message:string){setToast(message);setTimeout(()=>setToast(""),1800);}
  function downloadCard(){const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1440;const ctx=canvas.getContext("2d");if(!ctx)return;ctx.fillStyle="#eee7d7";ctx.fillRect(0,0,1080,1440);ctx.strokeStyle="#9b2c2c";ctx.lineWidth=3;ctx.strokeRect(72,72,936,1296);ctx.textAlign="center";ctx.fillStyle="#52636a";ctx.font="32px serif";ctx.fillText("三 国 识 人 录",540,170);ctx.fillStyle=character.tone;ctx.beginPath();ctx.arc(540,520,220,0,Math.PI*2);ctx.fill();ctx.fillStyle="#eee7d7";ctx.font="bold 300px serif";ctx.fillText(character.name[0],540,625);ctx.fillStyle="#1c1b18";ctx.font="36px serif";ctx.fillText("我的三国精神原型",540,850);ctx.font="bold 116px serif";ctx.fillText(character.name,540,990);ctx.fillStyle="#9b2c2c";ctx.font="34px serif";ctx.fillText(matchLevel(primary.score,quality.precise),540,1060);ctx.fillStyle="#1c1b18";ctx.font="42px serif";ctx.fillText(`「${character.motto}」`,540,1165);ctx.fillStyle="#52636a";ctx.font="28px serif";ctx.fillText("循三十六问 · 观乱世本心",540,1300);const a=document.createElement("a");a.download=`三国识人录-${character.name}.png`;a.href=canvas.toDataURL("image/png");a.click();showToast("人物笺已生成");}

  return <PageShell className="result-page">
    <AnimatePresence>{!revealed&&<motion.div className="reveal-screen" exit={{opacity:0}} transition={{duration:.25}}><motion.div className="reveal-ink" initial={{scale:.4,opacity:.35}} animate={{scale:5,opacity:1}} transition={{duration:.7}}/><p>三十六问既毕</p><span>且看 · 史册映出何人</span></motion.div>}</AnimatePresence>
    <header className="result-nav"><BrandMark compact/><span>人物志 · {character.era}</span><button onClick={share}><Share2 size={17}/>分享</button></header>
    <section className="result-hero" style={{"--tone":character.tone} as React.CSSProperties}>
      <motion.div className="result-hero__copy" initial={false} animate={{opacity:1,y:0}}>
        <p>你的三国精神原型</p><h1>{character.name}</h1><div className="result-hero__title">{rich?.heroLine??heroLine(character.id)}</div>
        <div className="match-level"><b>{matchLevel(primary.score,quality.precise)}</b><span>在十二位人物中，{character.name}与你的行为结构最为接近。</span>{quality.precise&&<small>原型相似度 {primary.score}</small>}</div>
        <p className="hero-tension">{rich?.tensionLine??`${character.strengths[0]}能帮助他打开局面，也可能让他付出${character.risks[0]}的代价。`}</p>
        <blockquote><small>为你题写 · 产品原创</small>「{rich?.originalSealLine??character.motto}」</blockquote>
      </motion.div>
      <motion.div initial={false} animate={{opacity:1,filter:"blur(0px)",y:0}}><Portrait character={character}/><p className="portrait-meta">{character.era}<span>{character.courtesy}</span></p></motion.div>
    </section>

    <section className="result-section mirror-section">
      <SectionHead index="壹" eyebrow="为什么是他" title="你的选择如何映出此人"/>
      {quality.message&&<div className="quality-note"><b>关于这次结果</b><p>{quality.message}</p></div>}
      <div className="mirror-grid"><div className="mirror-prose">{rich?<><h3>你的判断方式</h3><p>{rich.userMirror.decisionStyle}</p><h3>你的用人方式</h3><p>{rich.userMirror.peopleStyle}</p><h3>你的潜在代价</h3><p>{rich.userMirror.cost}</p></>:<><p>{character.summary}</p><p>{specificReading(character.id,topDimensions.map(d=>d.name))}</p></>}</div><div className="trait-panel"><p>这次选择呈现出的结构</p>{topDimensions.map((d,i)=><div className="trait-row" key={d.name}><span>{String(i+1).padStart(2,"0")}</span><b>{d.name}</b><div><i style={{width:`${d.score}%`}}/></div><em>{d.score}</em></div>)}<div className="trait-low"><span>相对较弱</span><b>{lowDimension.name}</b><em>{lowDimension.score}</em></div><div className="trait-tension"><span>最明显的内部拉扯</span><b>{tensionLabels(topDimensions[0].name,lowDimension.name)}</b></div></div></div>
      <div className="gain-cost"><article><span>你的优势</span><h3>{character.strengths.join(" · ")}</h3><p>{rich?.userMirror.strength??advantageCopy(character.id)}</p></article><article><span>你可能付出的代价</span><h3>{character.risks.slice(0,2).join(" · ")}</h3><p>{rich?.userMirror.cost??costCopy(character.id)}</p></article></div>
      {mode!=="single"&&secondary&&<div className="dual-note dual-analysis"><span>{mode==="dual"?"双重原型":"另一种倾向"}</span><p>{dualCopy(character.name,characterMap[secondary.id].name,character.traits[0],characterMap[secondary.id].traits[0],mode)}</p><div className="tension-axis" aria-label={`${character.name}与${characterMap[secondary.id].name}之间的倾向轴`}><span>{character.name}<small>{character.traits[0]}</small></span><i/><em>你</em><i/><span>{characterMap[secondary.id].name}<small>{characterMap[secondary.id].traits[0]}</small></span></div></div>}
    </section>

    {rich?<>
      <TimelineSection content={rich}/>
      <VoicesSection characterName={character.name} evaluations={rich.evaluations}/>
      <PoetrySection poetry={rich.poetry}/>
      <AchievementSection pairs={rich.achievementCostPairs}/>
      <LensesSection characterName={character.name} content={rich}/>
    </>:<section className="result-section history-section"><SectionHead index="贰" eyebrow="史料所见" title="历史如何留下他的身影"/><div className="history-layout"><div className="story-grid">{character.story.map((item,i)=><motion.article key={item.title} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}}><span>0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></motion.article>)}</div><aside className="archive-card"><span className="archive-card__source">史料概括</span><blockquote>{character.historical}</blockquote><p>据 {character.source}</p><div><b>放到今天</b><p>{character.modern}</p></div></aside></div></section>}

    <section className="result-section relations-section"><SectionHead index={rich?"柒":"叁"} eyebrow="同道与张力" title="你与谁更容易并肩"/><div className="relations-grid"><article><span>最宜同谋</span><h3>{character.ally}</h3><p>{character.allyReason}</p></article><div className="relation-line"><i/><b>{character.name}</b><i/></div><article><span>易生张力</span><h3>{character.tension}</h3><p>{character.tensionReason}</p></article></div></section>

    <section className="result-section share-section"><div className="share-card" style={{"--tone":character.tone} as React.CSSProperties}><span>三 国 识 人 录</span><div className="share-card__glyph">{character.name[0]}</div><small>我的三国精神原型</small><h2>{character.name}</h2><blockquote>「{rich?.originalSealLine??character.motto}」</blockquote><p>{matchLevel(primary.score,quality.precise)} · 循三十六问观本心</p></div><div className="share-actions"><SectionHead index={rich?"捌":"肆"} eyebrow="落印成笺" title="将这页人物志赠予友人"/><p>真正有趣的不是谁更像英雄，而是你们会如何一起面对乱局。</p><div><AncientButton tone="seal" onClick={share}><Share2 size={17}/>唤友共阅</AncientButton><button onClick={downloadCard}><Download size={17}/>保存人物笺</button><button onClick={copyLink}><Link2 size={17}/>复制链接</button></div></div></section>
    <footer className="result-footer"><p>此卷只作历史兴趣与自我观察，不构成心理诊断或职业鉴定。</p><Link href="/test"><RotateCcw size={16}/>重新作答</Link></footer>
    <AnimatePresence>{toast&&<motion.div className="toast" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{toast}</motion.div>}</AnimatePresence>
  </PageShell>;
}

function SectionHead({index,eyebrow,title}:{index:string;eyebrow:string;title:string}){return <div className="section-head"><span>{index}</span><div><small>{eyebrow}</small><h2>{title}</h2></div></div>;}
function TimelineSection({content}:{content:CharacterHistoricalContent}){return <section className="result-section timeline-section"><SectionHead index="贰" eyebrow="人物年表" title="这种性格如何形成他的历史位置"/><div className="history-timeline">{content.timeline.map((item,index)=><motion.article key={item.title} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.3}}><div className="timeline-marker"><b>{String(index+1).padStart(2,"0")}</b></div><div className="timeline-copy"><span>{item.date}</span><h3>{item.title}</h3><p>{item.event}</p><blockquote><small>人物结构</small>{item.traitMeaning}</blockquote><details><summary>查看出处 <ChevronDown size={15}/></summary>{item.sources.map(source=><SourceDetail source={source} key={source.title+source.chapterOrEpisode}/>)}</details></div></motion.article>)}</div></section>;}
function VoicesSection({characterName,evaluations}:{characterName:string;evaluations:HistoricalSource[]}){return <section className="result-section voices-section"><SectionHead index="叁" eyebrow="众声评传" title={`不同材料，为什么给出不同的${characterName}`}/><p className="section-intro">人物不是一个结论，而是一组无法被完全合并的证据。展开卡片，可以看见材料性质、原始出处与本页解释之间的边界。</p><div className="voices-grid">{evaluations.map((source,index)=><details className={`voice-card source-${source.type}`} key={source.title}><summary><div><span>{source.label}</span><small>{source.author}{source.chapterOrEpisode?` · ${source.chapterOrEpisode}`:""}</small></div><h3>{source.title}</h3>{source.quote&&<blockquote>“{source.quote}”</blockquote>}<p>{source.paraphrase}</p><b>展开解读 <ChevronDown size={15}/></b></summary><div className="voice-card__expanded"><p>{source.interpretation}</p>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">核对原始页面 <ExternalLink size={14}/></a>}<small>{source.verified?"已核对页面与材料类型":"待进一步核对"} · 材料 {index+1}</small></div></details>)}</div></section>;}
function PoetrySection({poetry}:{poetry:HistoricalSource[]}){return <section className="result-section poetry-section"><SectionHead index="肆" eyebrow="诗文照影" title="让人物自己的文字说话"/><div className="poetry-stack">{poetry.map((source,index)=><details key={source.title} open={index===0}><summary><span>{source.label} · {source.author}《{source.title}》</span><blockquote>“{source.quote}”</blockquote><b>{index===0?"正在展读":"展开第二则"}<ChevronDown size={15}/></b></summary><div><p>{source.paraphrase}</p><p>{source.interpretation}</p>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">查看篇目 <ExternalLink size={14}/></a>}</div></details>)}</div></section>;}
function AchievementSection({pairs}:{pairs:Array<{strength:string;cost:string}>}){return <section className="result-section achievement-section"><SectionHead index="伍" eyebrow="功与代价" title="帮助他成事的，也可能令他失去什么"/><p className="section-intro">真正值得借鉴的，不是复制他的选择，而是看清一种能力在什么位置开始变成代价。</p><div className="achievement-table"><header><span>形成成就的能力</span><span>同一能力可能造成的代价</span></header>{pairs.map(pair=><div key={pair.strength}><p>{pair.strength}</p><i aria-hidden="true">→</i><p>{pair.cost}</p></div>)}</div></section>;}
function LensesSection({characterName,content}:{characterName:string;content:CharacterHistoricalContent}){return <section className="result-section lenses-section"><SectionHead index="陆" eyebrow="三种镜头" title="历史中的他、文学中的他、你结果中的他"/><div className="lenses-grid"><article><span>正史中的{characterName}</span><p>{content.historyVsFiction.history}</p></article><article><span>文学中的{characterName}</span><p>{content.historyVsFiction.fiction}</p></article><article><span>本次测评所取</span><p>{content.historyVsFiction.assessmentUses}</p></article></div><p className="assessment-disclaimer">本测试不是判断你与{characterName}的生平、道德或政治立场相同，只比较部分行为结构。人物原型是理解入口，不是对人格的盖章。</p>{content.closingLine&&<blockquote className="closing-line"><small>今日映照 · 产品原创</small>{content.closingLine}</blockquote>}</section>;}
function SourceDetail({source}:{source:HistoricalSource}){return <div className="source-detail"><span>{source.label}</span><b>{source.author}《{source.title}》{source.chapterOrEpisode?` · ${source.chapterOrEpisode}`:""}</b>{source.quote&&<blockquote>“{source.quote}”</blockquote>}<p>{source.paraphrase}</p><small>本页解读：{source.interpretation}</small>{source.url&&<a href={source.url} target="_blank" rel="noreferrer">打开来源 <ExternalLink size={13}/></a>}</div>;}
function tensionLabels(high:string,low:string){return `${high}的推进力 ↔ ${low}的安全感`;}
const heroLines:Record<CharacterId,string>={caocao:"你会先看清手中的牌，再决定如何改写局面。",liubei:"你重视的不只是一时胜负，更是谁愿意继续同行。",sunquan:"你不急着赢第一回合，更在意始终保有选择。",sunce:"你不是等待局面成熟的人，而是愿意亲手打开局面。",zhugeliang:"你希望正确的事不靠运气，也能一次次稳定发生。",zhouyu:"你会先判断胜算，然后亲自承担下注的后果。",lusu:"你习惯先看局势如何变化，再决定谁可以同行。",guanyu:"你可以权衡胜负，却很难放下承诺与立场。",zhangfei:"真正出事的时候，你往往愿意站到最前面。",simayi:"你愿意等到胜率发生变化，再让力量真正落下。",yuanshao:"你能聚起人和资源，难题在于最后如何定夺。",lvbu:"机会来到眼前时，你更相信行动能打开出口。"};
function heroLine(id:CharacterId){return heroLines[id];}
function specificReading(id:CharacterId,dims:string[]){const map:Partial<Record<CharacterId,string>>={lusu:"你不急着把人划成永远的敌友。你更擅长寻找此刻可以共同推进的部分，同时为变化留下余地。",sunquan:"你倾向先保留空间、观察变化，再决定把力量放在哪里。对你来说，耐心本身也是行动。",sunce:"你对机会窗口格外敏感。与其等条件完美，你更愿意先进入局面，再用行动修正方向。"};return map[id]??`你的高分并非来自单一标签，而是${dims.slice(0,2).join("与")}同时出现在关键取舍中。这种组合，比任何一句“像某位英雄”更接近真实的你。`;}
function advantageCopy(id:CharacterId){if(id==="lusu")return"你能看见别人忽略的共同利益，也较少因一时好恶彻底关闭合作可能。复杂关系中，你往往能为各方争取更多空间。";return"这些能力让你在复杂局面里更快找到可行的支点，也让别人知道你最值得依靠的地方。";}
function costCopy(id:CharacterId){if(id==="lusu")return"为了保留合作空间，你有时不会过早把边界说死。这可能让强调原则的人觉得你不够坚决，也让你承担维持关系的额外成本。";return"优势走到极端，往往就是代价的起点。真正需要留意的，是熟悉的成功方式何时开始遮住其他选择。";}
function dualCopy(primary:string,secondary:string,primaryTrait:string,secondaryTrait:string,mode:string){if(primary==="曹操"&&secondary==="刘备")return"你身上同时存在两套处理问题的方式：曹操的一面让你先判断资源、时机与胜负条件；刘备的一面提醒你，局面最终仍要靠人愿意留下来共同承担。前者推动事情，后者维护同行关系。";return mode==="dual"?`${primary}的一面推动你以${primaryTrait}打开局面，${secondary}的一面则让你用${secondaryTrait}校正方向。真正的你，往往出现在两种方式必须取舍的时刻。`:`你的主原型仍是${primary}，同时也带有${secondary}式的${secondaryTrait}。它会在特定局势下改变你的行动节奏。`;}
