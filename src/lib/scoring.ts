import { characters } from "@/data/characters";
import { dimensions, questions, type CharacterId } from "@/data/questions";

export type ScoreResult = { id: CharacterId; score: number; raw: number };
export type StoredResult = { answers: number[]; scores: ScoreResult[]; dimensions: { name: string; score: number }[]; createdAt: number };

export function calculateResult(answers: number[]): StoredResult {
  const scores = characters.map(character => {
    let raw = 0;
    let maximum = 0;
    questions.forEach((q, index) => {
      const weight = q.weights[character.id] ?? 0;
      raw += ((answers[index] ?? 3) - 3) * weight;
      maximum += 2 * Math.abs(weight);
    });
    const score = Math.max(0, Math.min(100, 50 + 50 * raw / maximum));
    return { id: character.id, score: Math.round(score), raw };
  }).sort((a,b) => b.score - a.score);

  const dimensionScores = dimensions.map((name, dimension) => {
    const values = questions.map((q, i) => q.dimension === dimension ? (answers[i] ?? 3) : null).filter((v): v is number => v !== null);
    return { name, score: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length / 5 * 100) };
  }).sort((a,b) => b.score - a.score);

  return { answers, scores, dimensions: dimensionScores, createdAt: Date.now() };
}

export function resultMode(scores: ScoreResult[]) {
  const gap = scores[0].score - scores[1].score;
  if (gap >= 8) return "single";
  if (gap >= 4) return "secondary";
  return "dual";
}
