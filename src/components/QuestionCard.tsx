"use client";

import { Check } from "lucide-react";
import { type AnswerId, type Question } from "@/data/questions";
import styles from "./QuestionCard.module.css";

type QuestionCardProps = {
  question: Question;
  answer?: AnswerId;
  keyboardChoice: AnswerId;
  locked: boolean;
  onAnswer: (value: AnswerId) => void;
  onFocusChoice: (value: AnswerId) => void;
};

export function QuestionCard({ question, answer, keyboardChoice, locked, onAnswer, onFocusChoice }: QuestionCardProps) {
  return (
    <article className={styles.card}>
      <h1 id="question-title" tabIndex={-1}>{question.text}</h1>
      <ul className={styles.options}>
        {question.options.map((option) => {
          const selected = answer === option.id;

          return (
            <li key={option.id}>
              <button
                type="button"
                className={styles.option}
                data-option={option.id}
                data-selected={selected}
                data-keyboard-choice={keyboardChoice === option.id}
                aria-disabled={locked || undefined}
                onClick={(event) => {
                  if (event.detail <= 1) onAnswer(option.id);
                }}
                onFocus={() => onFocusChoice(option.id)}
              >
                <span className={styles.letter}>{option.id}</span>
                <span>{option.text}</span>
                {selected && (
                  <span className={styles.selected}>
                    <Check size={20} aria-hidden="true" />
                    <span className={styles.visuallyHidden}>已选</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
