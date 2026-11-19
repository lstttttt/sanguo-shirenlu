import assert from "node:assert/strict";
import { characters } from "../src/data/characters";
import { editorialCharacters, editorialCopy, isEditorialCharacter } from "../src/data/editorial";
import { historicalContent } from "../src/data/historical-content";
import { questions } from "../src/data/questions";
import manuscript from "../src/data/sanguo-editorial.json";

assert.equal(Object.keys(historicalContent).length,12,"all twelve result characters need audited content");
for(const [id,content] of Object.entries(historicalContent)){
  assert.ok(content,`${id}: missing content`);
  assert.ok(content.introBridge&&content.introBridge.length>=32,`${id}: missing mirror bridge`);
  assert.ok(content.timelineBridge&&content.timelineBridge.length>=32,`${id}: missing timeline bridge`);
  assert.equal(content.timeline.length,4,`${id}: timeline must have four nodes`);
  assert.ok(content.evaluations.length>=2,`${id}: needs at least two evaluation perspectives`);
  assert.ok(content.evaluations.some(item=>item.type==="primary_history"),`${id}: missing primary history`);
  assert.ok(content.evaluations.some(item=>item.verified&&item.quote),`${id}: needs a verified formal-text excerpt`);
  assert.ok(content.evaluations.some(item=>item.type!=="primary_history"),`${id}: missing a contrasting perspective`);
  assert.ok(content.poetry.length>=1,`${id}: missing literary echo or reception history`);
  assert.ok(content.achievementCostPairs.length>=3,`${id}: needs three achievement/cost pairs`);
  const sources=[...content.evaluations,...content.poetry,...content.timeline.flatMap(item=>item.sources)];
  assert.ok(sources.every(source=>source.type&&source.label&&source.title&&source.paraphrase&&source.interpretation),`${id}: incomplete source audit fields`);
  assert.ok(sources.filter(source=>source.verified).every(source=>source.url?.startsWith("https://")),`${id}: verified sources must link to an HTTPS page`);
  assert.ok(sources.filter(source=>source.verified&&source.quote).every(source=>source.quote!.length<=30),`${id}: verified direct quotes must remain short`);
}

assert.equal(manuscript.schemaVersion, 1, "unsupported manuscript schema");
const characterIds = characters.map(({ id }) => id).sort();
assert.equal(characterIds.length, 12);
assert.deepEqual(Object.keys(editorialCharacters).sort(), characterIds);
assert.ok(!isEditorialCharacter("toString"));
assert.ok(!isEditorialCharacter("unknown"));

function assertText(value: string, context: string) {
  assert.ok(value.trim(), `${context}: missing text`);
}

for (const [key, value] of Object.entries(editorialCopy)) {
  assertText(value, key);
}

for (const id of characterIds) {
  const person = editorialCharacters[id];
  for (const field of ["name", "courtesy", "identity", "chapterTitle", "frontLine"] as const) {
    assertText(person[field], `${id}.${field}`);
  }
  for (const section of ["mirror", "history"] as const) {
    assert.equal(person[section].length, 2, `${id}.${section}: exactly two paragraphs`);
    person[section].forEach((paragraph) => assertText(paragraph, `${id}.${section}`));
  }
  assert.ok(person.sources.length, `${id}: needs at least one source`);
  for (const { label, url, note } of person.sources) {
    assert.match(label, /^《.+》卷.+〈.+〉$/u, `${id}: source needs a work, volume and biography`);
    assertText(note, `${id}: source note`);
    const sourceUrl = new URL(url);
    assert.equal(sourceUrl.protocol, "https:", `${id}: source needs an HTTPS link`);
    if (sourceUrl.hostname === "zh.wikisource.org") {
      const linkedVolume = decodeURIComponent(sourceUrl.pathname).match(/\/卷(\d+)(上)?$/u);
      assert.ok(linkedVolume, `${id}: link to a specific volume`);
      const labelledVolume = label.match(/卷(\d+)〈/u)?.[1];
      if (labelledVolume) {
        assert.equal(Number(linkedVolume[1]), Number(labelledVolume), `${id}: linked volume must match the label`);
      }
    }
  }
}

assert.equal(manuscript.questions.length, 36);
assert.equal(questions.length, manuscript.questions.length);
for (const [index, spec] of manuscript.questions.entries()) {
  const question = questions[index];
  assert.equal(spec.id, index + 1, "manuscript question IDs must be numbered in order");
  assert.equal(question.id, spec.id);
  assertText(spec.stem, `Q${spec.id}: stem`);
  assert.equal(question.text, spec.stem);
  assert.deepEqual(question.options.map(({ id }) => id), ["A", "B", "C"]);
  for (const { id, text } of question.options) {
    assertText(spec.options[id], `Q${spec.id}: option ${id}`);
    assert.equal(text, spec.options[id]);
  }
}

console.log("Historical content and editorial coverage passed for all 12 biographies and 36 questions.");
