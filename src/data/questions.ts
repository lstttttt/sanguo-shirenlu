import editorial from "@/data/sanguo-editorial.json";

export const dimensions = [
  "果断执行", "战略远谋", "制度秩序", "用人纳谏", "仁义凝聚", "忍耐克制",
  "风险进取", "威势强硬", "联盟外交", "忠诚原则", "灵活权变", "名望自尊",
] as const;

export type CharacterId = "caocao"|"liubei"|"sunquan"|"sunce"|"zhugeliang"|"zhouyu"|"lusu"|"guanyu"|"zhangfei"|"simayi"|"yuanshao"|"lvbu";
export type AnswerId = "A"|"B"|"C";
export type ScenarioOption = { id: AnswerId; text: string; score: 0|1|2 };
export type Question = { id: number; dimension: number; text: string; options: ScenarioOption[] };

const scoringByQuestion: ReadonlyArray<[number, [0 | 1 | 2, 0 | 1 | 2, 0 | 1 | 2]]> = [
  [0, [1, 0, 2]],
  [4, [1, 0, 2]],
  [6, [0, 2, 1]],
  [2, [1, 0, 2]],
  [8, [2, 0, 1]],
  [11, [0, 1, 2]],
  [1, [2, 0, 1]],
  [3, [1, 0, 2]],
  [10, [2, 1, 0]],
  [5, [2, 1, 0]],
  [7, [1, 0, 2]],
  [9, [2, 1, 0]],
  [0, [2, 1, 0]],
  [4, [1, 2, 0]],
  [6, [2, 1, 0]],
  [2, [2, 0, 1]],
  [8, [2, 0, 1]],
  [11, [0, 2, 1]],
  [1, [2, 0, 1]],
  [3, [1, 0, 2]],
  [10, [2, 0, 1]],
  [5, [2, 1, 0]],
  [7, [2, 1, 0]],
  [9, [2, 1, 0]],
  [0, [1, 2, 0]],
  [4, [2, 0, 1]],
  [6, [1, 2, 0]],
  [2, [2, 0, 1]],
  [8, [2, 0, 1]],
  [11, [0, 2, 1]],
  [1, [2, 0, 1]],
  [3, [2, 0, 1]],
  [10, [2, 1, 0]],
  [5, [2, 1, 0]],
  [7, [1, 2, 0]],
  [9, [2, 1, 0]],
];

export const answerIds = ["A", "B", "C"] as const;
export const questionsPerVolume = 6;
const copyById = new Map(editorial.questions.map((question) => [question.id, question]));

export const questions: Question[] = scoringByQuestion.map(([dimension, scores], index) => {
  const id = index + 1;
  const copy = copyById.get(id);
  if (!copy) throw new Error(`Missing editorial copy for question ${id}`);

  return {
    id,
    dimension,
    text: copy.stem,
    options: answerIds.map((optionId, optionIndex) => ({
      id: optionId,
      text: copy.options[optionId],
      score: scores[optionIndex],
    })),
  };
});

export const volumes = ["乱局初起", "同行者", "江河为界", "战与不战", "权柄在手", "功业与所守"] as const;
