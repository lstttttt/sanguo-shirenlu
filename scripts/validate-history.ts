import assert from "node:assert/strict";
import { historicalContent } from "../src/data/historical-content";

for(const [id,content] of Object.entries(historicalContent)){
  assert.ok(content,`${id}: missing content`);
  assert.equal(content.timeline.length,4,`${id}: timeline must have four nodes`);
  assert.ok(content.evaluations.length>=4,`${id}: needs at least four evaluation perspectives`);
  assert.ok(content.evaluations.some(item=>item.type==="primary_history"),`${id}: missing primary history`);
  assert.ok(content.evaluations.some(item=>item.type==="modern_lecture"),`${id}: missing modern interpretation`);
  assert.ok(content.poetry.length>=1,`${id}: missing poetry or direct writing`);
  const sources=[...content.evaluations,...content.poetry,...content.timeline.flatMap(item=>item.sources)];
  assert.ok(sources.every(source=>source.type&&source.label&&source.title&&source.paraphrase&&source.interpretation),`${id}: incomplete source audit fields`);
  assert.ok(sources.filter(source=>source.verified).every(source=>source.url?.startsWith("https://")),`${id}: verified sources must link to an HTTPS page`);
}

console.log(`Historical content validation passed for ${Object.keys(historicalContent).length} audited character template.`);
