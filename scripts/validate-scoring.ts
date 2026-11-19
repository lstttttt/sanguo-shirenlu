import assert from "node:assert/strict";
import { calculateResult, QUESTION_VERSION } from "../src/lib/scoring";
import { dimensions, questions, type AnswerId, type CharacterId } from "../src/data/questions";

const patterns={
  pathA:Array(36).fill("A"), pathB:Array(36).fill("B"), pathC:Array(36).fill("C"),
  neutral:questions.map(question=>question.options.find(option=>option.score===1)!.id),
  concentrated:[...Array(33).fill("A"),...Array(3).fill("B")] as AnswerId[],
  mixed:Array.from({length:36},(_,i)=>(["A","C","B"] as AnswerId[])[(i*7)%3]),
} satisfies Record<string, AnswerId[]>;
const originalWinners: Record<keyof typeof patterns, CharacterId> = {
  pathA: "simayi", pathB: "lvbu", pathC: "zhugeliang",
  neutral: "caocao", concentrated: "simayi", mixed: "zhugeliang",
};
for(const [name,answers] of Object.entries(patterns)){
 const result=calculateResult(answers);assert.equal(result.questionVersion,QUESTION_VERSION);assert.equal(result.scores.length,12,`${name}: 12 people`);assert.equal(result.dimensions.length,12,`${name}: 12 dimensions`);assert.ok(result.scores.every(item=>item.score>=0&&item.score<=100));assert.equal(result.explanation.primaryId,result.scores[0].id);assert.equal(result.explanation.runnerUpId,result.scores[1].id);assert.ok(result.explanation.questionEvidence.length>=1);
 assert.equal(result.explanation.primaryId, originalWinners[name as keyof typeof patterns], `${name}: unchanged winner`);
}
for(const dimension of dimensions)assert.equal(questions.filter(question=>question.dimension===dimensions.indexOf(dimension)).length,3,`${dimension}: three scenarios`);
for(const question of questions){assert.equal(question.options.length,3,`Q${question.id}: three choices`);assert.deepEqual(question.options.map(option=>option.score).sort(),[0,1,2],`Q${question.id}: all positions`);}
assert.equal(calculateResult(patterns.neutral).quality.flag,"neutral");assert.equal(calculateResult(patterns.concentrated).quality.precise,false);
console.log("Scoring validation passed for three paths, neutral, concentrated, and mixed scenarios.");
