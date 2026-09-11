import { characters } from "@/data/characters";
import { dimensions, questions, type CharacterId } from "@/data/questions";
import rawProfiles from "@/data/profiles.json";

export type ScoreResult = { id: CharacterId; score: number; raw: number };
export type QualityFlag = "affirming" | "neutral" | "contradictory" | null;
export type StoredResult = {
  answers: number[]; scores: ScoreResult[]; dimensions: { name: string; score: number }[];
  quality: { flag: QualityFlag; message: string; contradictions: number; precise: boolean }; createdAt: number;
};
type Profile = { core: [number,number]; auxiliary: [number,number]; conflict: number; weakness: number };

const profiles=rawProfiles as Record<CharacterId,Profile>;

export function calculateResult(answers: number[]): StoredResult {
  const dimensionScores = dimensions.map((name, dimension) => {
    const items = questions.map((q,i) => q.dimension === dimension ? {value:answers[i]??3,reverse:q.reverse} : null).filter((v):v is {value:number;reverse:boolean|undefined}=>v!==null);
    const adjusted=items.map(item=>item.reverse?6-item.value:item.value);
    const average=adjusted.reduce((sum,value)=>sum+value,0)/adjusted.length;
    return {name,score:Math.round((average-1)/4*100)};
  });
  const scores=characters.map(character=>{
    const p=profiles[character.id]; const c=dimensionScores.map(d=>(d.score-50)/50);
    const raw=.30*c[p.core[0]]+.25*c[p.core[1]]+.15*c[p.auxiliary[0]]+.10*c[p.auxiliary[1]]-.10*c[p.conflict]-.10*c[p.weakness];
    return {id:character.id,score:Math.max(0,Math.min(100,Math.round(50+50*raw))),raw};
  }).sort((a,b)=>b.score-a.score);
  return {answers,scores,dimensions:[...dimensionScores].sort((a,b)=>b.score-a.score),quality:assessQuality(answers),createdAt:Date.now()};
}

export function assessQuality(answers:number[]):StoredResult["quality"] {
  const high=answers.filter(v=>v>=4).length/answers.length; const middle=answers.filter(v=>v===3).length/answers.length; let contradictions=0;
  for(let i=0;i<12;i++){const a=answers[i],b=answers[i+12];if(a&&b&&((a>=4&&b>=4)||(a<=2&&b<=2)))contradictions++;}
  if(high>.8)return{flag:"affirming",message:"你的回答整体偏向肯定，因此多个维度同时较高。以下结果更适合作为一种方向，而不是唯一判断。",contradictions,precise:false};
  if(middle>.7)return{flag:"neutral",message:"你在多数问题中保留了判断，当前轮廓较为均衡。可以换一个更具体的生活阶段再次作答。",contradictions,precise:false};
  if(contradictions>=4)return{flag:"contradictory",message:"你的部分选择呈现出相反倾向，可能说明你会随情境调整。结果将保留方向，不显示精确分值。",contradictions,precise:false};
  return{flag:null,message:"",contradictions,precise:true};
}

export function resultMode(scores: ScoreResult[]){const gap=scores[0].score-scores[1].score;return gap<=5?"dual":gap<=12?"secondary":"single";}
export function matchLevel(score:number,precise=true){if(!precise)return"方向接近";if(score>=75)return"高度契合";if(score>=64)return"明显接近";if(score>=55)return"部分相似";return"轮廓均衡";}
