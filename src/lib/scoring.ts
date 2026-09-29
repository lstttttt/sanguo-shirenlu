import { characters } from "@/data/characters";
import { dimensions, questions, type CharacterId } from "@/data/questions";
import rawProfiles from "@/data/profiles.json";

export type ScoreResult = { id: CharacterId; score: number; raw: number };
export type QualityFlag = "affirming" | "neutral" | "contradictory" | null;
export type DimensionEvidence = { name:string; score:number; label:"较突出"|"中等"|"较弱"; questionIds:number[] };
export type QuestionEvidence = { id:number; text:string; answer:string; dimension:string; supports:string };
export type StoredResult = {
  answers: number[]; scores: ScoreResult[]; dimensions: { name: string; score: number }[];
  quality: { flag: QualityFlag; message: string; contradictions: number; precise: boolean };
  explanation:{primaryId:CharacterId;runnerUpId:CharacterId;dimensionEvidence:DimensionEvidence[];questionEvidence:QuestionEvidence[];confidenceLabel:string};
  createdAt: number;
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
  const quality=assessQuality(answers);
  const primaryId=scores[0].id; const runnerUpId=scores[1].id; const profile=profiles[primaryId];
  const relevant=[...profile.core,...profile.auxiliary]
    .map(index=>dimensionScores[index])
    .sort((a,b)=>b.score-a.score)
    .filter((item,index)=>item.score>=55||index===0)
    .slice(0,3);
  const dimensionEvidence=relevant.map(item=>({name:item.name,score:item.score,label:qualitative(item.score),questionIds:questions.filter(q=>q.dimension===dimensions.indexOf(item.name as typeof dimensions[number])).map(q=>q.id)}));
  const questionEvidence:QuestionEvidence[]=[];
  for(const dimension of dimensionEvidence){
    const dimensionIndex=dimensions.indexOf(dimension.name as typeof dimensions[number]);
    const candidates=questions.map((q,index)=>({q,index,value:answers[index],adjusted:q.reverse?6-(answers[index]??3):(answers[index]??3)})).filter(item=>item.q.dimension===dimensionIndex&&item.adjusted>=4).sort((a,b)=>b.adjusted-a.adjusted);
    const item=candidates[0]; if(item)questionEvidence.push({id:item.q.id,text:item.q.text,answer:answerLabel(item.value),dimension:dimension.name,supports:item.q.reverse?"你这次没有选择该维度的反向倾向":"你这次更认同这种处理方式"});
    if(questionEvidence.length===2)break;
  }
  const gap=scores[0].score-scores[1].score;
  const confidenceLabel=!quality.precise?"倾向性结果":gap<=5?"两个方向都接近":gap<=12?"主要方向较清晰":"当前方向较清晰";
  return {answers,scores,dimensions:[...dimensionScores].sort((a,b)=>b.score-a.score),quality,explanation:{primaryId,runnerUpId,dimensionEvidence,questionEvidence,confidenceLabel},createdAt:Date.now()};
}

export function assessQuality(answers:number[]):StoredResult["quality"] {
  const valid=answers.filter(value=>value>=1&&value<=5);if(valid.length<30)return{flag:"neutral",message:"有效回答不足，当前只能展示人物资料与非常有限的方向提示。",contradictions:0,precise:false};
  const high=valid.filter(v=>v>=4).length/valid.length; const middle=valid.filter(v=>v===3).length/valid.length; let contradictions=0;
  for(let dimension=0;dimension<12;dimension++){const directIndex=questions.findIndex(q=>q.dimension===dimension&&q.kind==="behavior");const reverseIndex=questions.findIndex(q=>q.dimension===dimension&&q.kind==="reverse");const a=answers[directIndex],b=answers[reverseIndex];if(a&&b&&((a>=4&&b>=4)||(a<=2&&b<=2)))contradictions++;}
  if(high>.8)return{flag:"affirming",message:"你的回答整体偏向肯定，因此多个维度同时较高。以下结果更适合作为一种方向，而不是唯一判断。",contradictions,precise:false};
  if(middle>.7)return{flag:"neutral",message:"你在多数问题中保留了判断，当前轮廓较为均衡。可以换一个更具体的生活阶段再次作答。",contradictions,precise:false};
  if(contradictions>=4)return{flag:"contradictory",message:"你的部分选择呈现出相反倾向，可能说明你会随情境调整。结果将保留方向，不显示精确分值。",contradictions,precise:false};
  return{flag:null,message:"",contradictions,precise:true};
}

export function resultMode(scores: ScoreResult[]){const gap=scores[0].score-scores[1].score;return gap<=5?"dual":gap<=12?"secondary":"single";}
export function matchLevel(score:number,precise=true){if(!precise)return"方向接近";if(score>=75)return"高度契合";if(score>=64)return"明显接近";if(score>=55)return"部分相似";return"轮廓均衡";}
export function qualitative(score:number):"较突出"|"中等"|"较弱"{return score>=67?"较突出":score>=42?"中等":"较弱";}
function answerLabel(value:number){return ["","很不像我","不太像我","说不准","比较像我","很像我"][value]||"未作答";}
