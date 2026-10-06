import { characters } from "@/data/characters";
import { dimensions, questions, type AnswerId, type CharacterId } from "@/data/questions";
import rawProfiles from "@/data/profiles.json";

export const QUESTION_VERSION = "scenario-v1";
export type ScoreResult = { id: CharacterId; score: number; raw: number };
export type QualityFlag = "neutral" | "contradictory" | null;
export type DimensionEvidence = { name:string; score:number; label:"较突出"|"中等"|"较弱"; questionIds:number[] };
export type QuestionEvidence = { id:number; text:string; answer:string; dimension:string; supports:string };
export type StoredResult = {
  questionVersion: typeof QUESTION_VERSION; answers: AnswerId[]; scores: ScoreResult[]; dimensions: { name: string; score: number }[];
  quality: { flag: QualityFlag; message: string; contradictions: number; precise: boolean };
  explanation:{primaryId:CharacterId;runnerUpId:CharacterId;dimensionEvidence:DimensionEvidence[];questionEvidence:QuestionEvidence[];confidenceLabel:string;evidenceQuestionIds:number[];copyVariant:"conditional"|"static"|"uncertain"};
  createdAt: number;
};
type Profile = { core: [number,number]; auxiliary: [number,number]; conflict: number; weakness: number };
const profiles=rawProfiles as Record<CharacterId,Profile>;

export function calculateResult(input: AnswerId[]): StoredResult {
  const answers=input.map(answer=>answer==="A"||answer==="B"||answer==="C"?answer:"B") as AnswerId[];
  const dimensionScores=dimensions.map((name,dimension)=>{
    const items=questions.filter(q=>q.dimension===dimension);
    const values=items.map(q=>q.options.find(option=>option.id===answers[q.id-1])?.score??1);
    return {name,score:Math.round(values.reduce<number>((sum,value)=>sum+value,0)/Math.max(1,values.length)/2*100)};
  });
  const scores=characters.map(character=>{
    const p=profiles[character.id]; const c=dimensionScores.map(d=>(d.score-50)/50);
    const raw=.30*c[p.core[0]]+.25*c[p.core[1]]+.15*c[p.auxiliary[0]]+.10*c[p.auxiliary[1]]-.10*c[p.conflict]-.10*c[p.weakness];
    return {id:character.id,score:Math.max(0,Math.min(100,Math.round(50+50*raw))),raw};
  }).sort((a,b)=>b.score-a.score);
  const quality=assessQuality(answers,dimensionScores);
  const primaryId=scores[0].id, runnerUpId=scores[1].id, profile=profiles[primaryId];
  const coreEvidence=profile.core.filter(index=>dimensionScores[index].score>=50).length;
  const gap=scores[0].score-scores[1].score;
  const certain=quality.precise&&coreEvidence===2&&gap>=6;
  const relevant=[...profile.core,...profile.auxiliary].map(index=>dimensionScores[index]).sort((a,b)=>b.score-a.score).slice(0,3);
  const dimensionEvidence=relevant.map(item=>({name:item.name,score:item.score,label:qualitative(item.score),questionIds:questions.filter(q=>q.dimension===dimensions.indexOf(item.name as typeof dimensions[number])).map(q=>q.id)}));
  const questionEvidence:QuestionEvidence[]=[];
  for(const evidence of dimensionEvidence){
    const candidate=questions
      .filter(question=>question.dimension===dimensions.indexOf(evidence.name as typeof dimensions[number]))
      .map(question=>({question,answer:answers[question.id-1]}))
      .filter(({question,answer})=>(question.options.find(option=>option.id===answer)?.score??0)>=1)
      .sort((a,b)=>(b.question.options.find(option=>option.id===b.answer)?.score??0)-(a.question.options.find(option=>option.id===a.answer)?.score??0))[0];
    if(candidate)questionEvidence.push({id:candidate.question.id,text:candidate.question.text,answer:formatAnswer(candidate.question.id,candidate.answer),dimension:evidence.name,supports:`这次选择在${evidence.name}上留下了证据`});
  }
  const confidenceLabel=!quality.precise||coreEvidence<2?"更接近的一种方向":gap<6?"两个方向都接近":gap<13?"主要方向较清晰":"当前方向较清晰";
  return {questionVersion:QUESTION_VERSION,answers,scores,dimensions:[...dimensionScores].sort((a,b)=>b.score-a.score),quality,explanation:{primaryId,runnerUpId,dimensionEvidence,questionEvidence,confidenceLabel,evidenceQuestionIds:questionEvidence.map(item=>item.id),copyVariant:certain?"conditional":quality.precise?"static":"uncertain"},createdAt:Date.now()};
}

export function assessQuality(answers:AnswerId[], dimensionScores?:Array<{score:number}>):StoredResult["quality"] {
  if(answers.length<36)return {flag:"neutral",message:"回答尚未完整，当前只展示人物资料与有限的方向提示。",contradictions:0,precise:false};
  const counts={A:0,B:0,C:0};answers.forEach(answer=>counts[answer]++);
  const spread=Math.max(counts.A,counts.B,counts.C)-Math.min(counts.A,counts.B,counts.C);
  const flat=dimensionScores?.filter(d=>d.score===50).length??0;
  if(flat>=8)return {flag:"neutral",message:"你的取舍在许多局面里保持均衡，因此结果更适合作为可继续探索的方向。",contradictions:0,precise:false};
  if(spread>=30)return {flag:"contradictory",message:"你反复选择同一种处理方式；这会压低情境间的差异，结果不显示假精确值。",contradictions:0,precise:false};
  return {flag:null,message:"",contradictions:0,precise:true};
}
export function resultMode(scores:ScoreResult[]){const gap=scores[0].score-scores[1].score;return gap<6?"dual":gap<13?"secondary":"single";}
export function matchLevel(score:number,precise=true){if(!precise)return"方向接近";if(score>=75)return"高度接近";if(score>=64)return"明显接近";if(score>=55)return"部分接近";return"轮廓均衡";}
export function qualitative(score:number):"较突出"|"中等"|"较弱"{return score>=67?"较突出":score>=42?"中等":"较弱";}
export function formatAnswer(questionId:number, answer:AnswerId){const option=questions.find(q=>q.id===questionId)?.options.find(o=>o.id===answer);return `${answer} · ${option?.text??"未作答"}`;}
