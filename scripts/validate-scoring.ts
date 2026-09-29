import assert from "node:assert/strict";
import { calculateResult } from "../src/lib/scoring";
import { dimensions, questions } from "../src/data/questions";

const patterns: Record<string, number[]> = {
  allHigh: Array(36).fill(5),
  allLow: Array(36).fill(1),
  allMiddle: Array(36).fill(3),
  alternating: Array.from({length:36},(_,i)=>i%2?5:1),
  contradictory: [...Array(24).fill(5),...Array(12).fill(3)],
  varied: Array.from({length:36},(_,i)=>(i*7)%5+1),
};

for(const [name,answers] of Object.entries(patterns)){
  const result=calculateResult(answers);
  assert.equal(result.scores.length,12,`${name}: must score 12 characters`);
  assert.equal(result.dimensions.length,12,`${name}: must score 12 dimensions`);
  assert.ok(result.scores.every(item=>item.score>=0&&item.score<=100),`${name}: character score out of range`);
  assert.ok(result.dimensions.some(item=>item.score<100),`${name}: must not make all dimensions 100`);
  assert.equal(result.explanation.primaryId,result.scores[0].id,`${name}: explanation must follow the winning profile`);
  assert.equal(result.explanation.runnerUpId,result.scores[1].id,`${name}: runner-up explanation mismatch`);
  assert.ok(result.explanation.dimensionEvidence.length>=1,`${name}: missing dimension evidence`);
}

for(let index=0;index<questions.length;index+=3){
  assert.deepEqual(questions.slice(index,index+3).map(question=>question.kind),["behavior","reverse","tradeoff"],`questions ${index+1}-${index+3}: directions must be interleaved`);
}
for(let dimension=0;dimension<dimensions.length;dimension++){
  const items=questions.filter(question=>question.dimension===dimension);
  assert.equal(items.length,3,`${dimensions[dimension]}: must have three prompts`);
  assert.deepEqual(new Set(items.map(item=>item.kind)),new Set(["behavior","reverse","tradeoff"]),`${dimensions[dimension]}: missing a prompt direction`);
}

assert.equal(calculateResult(patterns.allHigh).quality.flag,"affirming");
assert.equal(calculateResult(patterns.allMiddle).quality.flag,"neutral");
assert.equal(calculateResult(patterns.contradictory).quality.precise,false);
console.log("Scoring validation passed for six required answer patterns.");
