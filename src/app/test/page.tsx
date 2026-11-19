"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { QuestionCard } from "@/components/QuestionCard";
import { answerIds, questions, questionsPerVolume, volumes, type AnswerId } from "@/data/questions";
import editorial from "@/data/sanguo-editorial.json";
import { clearQuizProgress, isAnswerId, restoreQuizProgress, saveQuizProgress, saveQuizResult, type QuizProgress } from "@/lib/attempts";
import { calculateResult } from "@/lib/scoring";
import styles from "./test.module.css";

const copy = editorial.interface;
const volumeNumbers = ["一", "二", "三", "四", "五", "六"];
const directionByKey: Record<string, number> = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function TestPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [keyboardChoice, setKeyboardChoice] = useState<AnswerId>("B");
  const [advancing, setAdvancing] = useState(false);
  const [chapterIntro, setChapterIntro] = useState(false);
  const timer = useRef<number | null>(null);
  const restartDialog = useRef<HTMLDialogElement>(null);
  const chapterButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const current = progress?.current;

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const restored = restoreQuizProgress();
      setProgress(restored);
      setKeyboardChoice(restored.answers[restored.current] ?? "B");
    }, 0);

    return () => {
      window.clearTimeout(restoreTimer);
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!chapterIntro) return;

    const introTimer = window.setTimeout(() => setChapterIntro(false), 650);
    return () => window.clearTimeout(introTimer);
  }, [chapterIntro]);

  useEffect(() => {
    if (current === undefined) return;

    if (chapterIntro) chapterButton.current?.focus({ preventScroll: true });
    else sheet.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [current, chapterIntro]);

  const answer = useCallback((value: AnswerId) => {
    if (!progress || advancing || timer.current !== null || chapterIntro || restartDialog.current?.open) return;

    const answers = [...progress.answers];
    answers[progress.current] = value;
    const next = { current: progress.current + 1, answers };
    const reducedMotion = prefersReducedMotion();
    const complete = next.current === questions.length;

    if (!complete) saveQuizProgress(next);
    setProgress({ current: progress.current, answers });
    setAdvancing(true);

    timer.current = window.setTimeout(() => {
      if (complete) {
        const result = calculateResult(answers);
        saveQuizResult(result);
        router.push(`/result/${result.explanation.primaryId}`);
        return;
      }

      setKeyboardChoice(answers[next.current] ?? "B");
      setChapterIntro(!reducedMotion && next.current % questionsPerVolume === 0);
      setProgress(next);
      setAdvancing(false);
      timer.current = null;
    }, reducedMotion ? 0 : 165);
  }, [advancing, chapterIntro, progress, router]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || restartDialog.current?.open) return;

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("input, select, textarea, [contenteditable]")) return;

      const control = target?.closest("a, button");
      const isAnswerControl = control instanceof HTMLButtonElement && control.dataset.option;

      const key = event.key.toUpperCase();
      const direction = directionByKey[event.key];
      if (!isAnswerId(key) && direction === undefined && key !== "ENTER") return;

      if (key === "ENTER" && control) {
        if (!isAnswerControl || (!event.repeat && !advancing && !chapterIntro)) return;
      }
      event.preventDefault();

      if (event.repeat || advancing || chapterIntro) return;
      if (isAnswerId(key)) {
        answer(key);
      } else if (key === "ENTER") {
        answer(keyboardChoice);
      } else if (direction !== undefined) {
        const index = answerIds.indexOf(keyboardChoice) + direction;
        const nextChoice = answerIds[Math.max(0, Math.min(index, answerIds.length - 1))];
        sheet.current?.querySelector<HTMLButtonElement>(`[data-option="${nextChoice}"]`)?.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [advancing, answer, chapterIntro, keyboardChoice]);

  function goBack() {
    if (!progress || progress.current === 0 || advancing || timer.current !== null) return;

    const previous = { ...progress, current: progress.current - 1 };
    setChapterIntro(false);
    setKeyboardChoice(previous.answers[previous.current] ?? "B");
    setProgress(previous);
    saveQuizProgress(previous);
  }

  function reset() {
    clearQuizProgress();
    setChapterIntro(false);
    setKeyboardChoice("B");
    setProgress({ current: 0, answers: [] });
  }

  function requestReset() {
    if (advancing || timer.current !== null) return;

    if (!progress?.answers.length) {
      reset();
      return;
    }

    const dialog = restartDialog.current;
    if (dialog) {
      dialog.returnValue = "";
      dialog.showModal();
    }
  }

  if (!progress) return <PageShell className={styles.page} />;

  const { current: position, answers } = progress;
  const volume = Math.floor(position / questionsPerVolume);
  const question = questions[position];
  const volumeTitle = `第${volumeNumbers[volume]}卷 · ${volumes[volume]}`;

  return (
    <PageShell className={styles.page}>
      <div className={styles.content}>
        <div key={question.id} ref={sheet} className={styles.sheet}>
          <header className={styles.header}>
            <div className={styles.heading}>
              <span className={chapterIntro ? styles.volumeDuringIntro : undefined}>{volumeTitle}</span>
              <span className={styles.count} aria-hidden="true">
                {String(question.id).padStart(2, "0")} / {questions.length}
              </span>
            </div>
            <progress
              className={styles.progress}
              max={questions.length}
              value={question.id}
              aria-label="答题进度"
              aria-valuetext={`第 ${question.id} 题，共 ${questions.length} 题`}
            />
          </header>

          <section className={styles.stage}>
            <div inert={chapterIntro || undefined}>
              {position === 0 && <p className={styles.brief}>{copy.testBrief}</p>}
              <QuestionCard
                question={question}
                answer={answers[position]}
                keyboardChoice={keyboardChoice}
                locked={advancing}
                onAnswer={answer}
                onFocusChoice={setKeyboardChoice}
              />
            </div>
            {chapterIntro && (
              <button ref={chapterButton} type="button" className={styles.chapterIntro} onClick={() => setChapterIntro(false)}>
                <span>{volumeTitle}</span>
                <small>继续作答</small>
              </button>
            )}
          </section>
        </div>

        <footer className={styles.footer}>
          {position === 0 ? (
            <Link className={styles.control} href="/" aria-disabled={advancing || undefined} onClick={(event) => { if (advancing) event.preventDefault(); }}>
              <ArrowLeft size={16} aria-hidden="true" />{copy.testHome}
            </Link>
          ) : (
            <button className={styles.control} type="button" onClick={goBack} disabled={advancing}>
              <ArrowLeft size={16} aria-hidden="true" />{copy.testBack}
            </button>
          )}
          <span className={styles.keyboardHint}>{copy.testKeyboard}</span>
          <button className={styles.control} type="button" onClick={requestReset} disabled={advancing}>
            <RotateCcw size={16} aria-hidden="true" />{copy.testReset}
          </button>
        </footer>
      </div>

      <dialog
        ref={restartDialog}
        className={styles.dialog}
        aria-labelledby="restart-title"
        aria-describedby="restart-description"
        onClose={(event) => { if (event.currentTarget.returnValue === "restart") reset(); }}
      >
        <h2 id="restart-title">重新开始？</h2>
        <p id="restart-description">这卷的作答进度将清除。</p>
        <form method="dialog" className={styles.dialogActions}>
          <button className={styles.control} value="cancel">继续作答</button>
          <button className={`${styles.control} ${styles.confirm}`} value="restart">{copy.testReset}</button>
        </form>
      </dialog>
    </PageShell>
  );
}
