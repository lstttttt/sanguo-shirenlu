import assert from "node:assert/strict";
import { calculateResult } from "../src/lib/scoring";

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
}

assert.equal(calculateResult(patterns.allHigh).quality.flag,"affirming");
assert.equal(calculateResult(patterns.allMiddle).quality.flag,"neutral");
assert.equal(calculateResult(patterns.contradictory).quality.precise,false);
console.log("Scoring validation passed for six required answer patterns.");
