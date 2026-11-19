import { type AnswerId, type CharacterId, questions } from "@/data/questions";
import { calculateResult, QUESTION_VERSION, type StoredResult } from "@/lib/scoring";

const progressKey = "shirenlu-progress-v4";
const resultKey = "shirenlu-result-v4";
const resultLifetimeMs = 30 * 24 * 60 * 60 * 1000;
const restartParam = "restart";

export const restartTestHref = `/test?${restartParam}=1`;

export type QuizProgress = { current: number; answers: AnswerId[] };

export function isAnswerId(value: unknown): value is AnswerId {
  return value === "A" || value === "B" || value === "C";
}

export function readPersonalResultId(
  storage: Pick<Storage, "getItem">,
  now = Date.now(),
): CharacterId | null {
  try {
    const saved = JSON.parse(storage.getItem(resultKey) ?? "null");
    if (
      saved?.questionVersion !== QUESTION_VERSION ||
      !Array.isArray(saved.answers) ||
      saved.answers.length !== questions.length ||
      !saved.answers.every(isAnswerId) ||
      !Number.isFinite(saved.createdAt) ||
      saved.createdAt > now ||
      now - saved.createdAt >= resultLifetimeMs
    ) {
      return null;
    }

    return calculateResult(saved.answers).explanation.primaryId;
  } catch {
    return null;
  }
}

export function restoreQuizProgress(): QuizProgress {
  const url = new URL(window.location.href);
  if (url.searchParams.get(restartParam) === "1") {
    clearQuizProgress();
    url.searchParams.delete(restartParam);
    window.history.replaceState(window.history.state, "", url);
    return { current: 0, answers: [] };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(progressKey) ?? "null");
    if (Array.isArray(saved?.answers) && saved.answers.every(isAnswerId)) {
      const answers: AnswerId[] = saved.answers.slice(0, questions.length);
      const current = Number.isInteger(saved.current)
        ? Math.max(0, Math.min(saved.current, answers.length, questions.length - 1))
        : 0;
      return { current, answers };
    }
  } catch {
    // The quiz can still be taken when browser storage is unavailable.
  }

  return { current: 0, answers: [] };
}

export function clearQuizProgress() {
  try {
    localStorage.removeItem(progressKey);
  } catch {
    // Keep the in-memory quiz usable without browser storage.
  }
}

export function saveQuizProgress(progress: QuizProgress) {
  try {
    localStorage.setItem(progressKey, JSON.stringify(progress));
  } catch {
    // Keep the in-memory quiz usable without browser storage.
  }
}

export function saveQuizResult(result: StoredResult) {
  try {
    localStorage.setItem(resultKey, JSON.stringify(result));
    clearQuizProgress();
  } catch {
    // Preserve saved progress when the browser cannot retain the result.
  }
}
