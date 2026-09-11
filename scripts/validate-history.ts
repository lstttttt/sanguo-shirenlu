import assert from "node:assert/strict";
import { historicalContent } from "../src/data/historical-content";

assert.equal(Object.keys(historicalContent).length,12,"all twelve result characters need audited content");
for(const [id,content] of Object.entries(historicalContent)){
  assert.ok(content,`${id}: missing content`);
  assert.equal(content.timeline.length,4,`${id}: timeline must have four nodes`);
  assert.ok(content.evaluations.length>=2,`${id}: needs at least two evaluation perspectives`);
  assert.ok(content.evaluations.some(item=>item.type==="primary_history"),`${id}: missing primary history`);
  assert.ok(content.evaluations.some(item=>item.type!=="primary_history"),`${id}: missing a contrasting perspective`);
  assert.ok(content.poetry.length>=1,`${id}: missing literary echo or reception history`);
  assert.ok(content.achievementCostPairs.length>=3,`${id}: needs three achievement/cost pairs`);
  const sources=[...content.evaluations,...content.poetry,...content.timeline.flatMap(item=>item.sources)];
  assert.ok(sources.every(source=>source.type&&source.label&&source.title&&source.paraphrase&&source.interpretation),`${id}: incomplete source audit fields`);
  assert.ok(sources.filter(source=>source.verified).every(source=>source.url?.startsWith("https://")),`${id}: verified sources must link to an HTTPS page`);
}

console.log(`Historical content validation passed for all ${Object.keys(historicalContent).length} character profiles.`);
