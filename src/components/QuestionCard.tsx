"use client";

import { AnimatePresence, motion } from "framer-motion";
import { answerOptions, dimensions, type Question } from "@/data/questions";

export function QuestionCard({ question, value, direction, onAnswer }: { question: Question; value?: number; direction: number; onAnswer: (value:number) => void }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.article
        key={question.id}
        custom={direction}
        initial={{ opacity: 0, x: direction * 28, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: direction * -20, filter: "blur(3px)" }}
        transition={{ duration: .34, ease: [0.22,1,0.36,1] }}
        className="question-card"
      >
        <div className="question-card__index"><span>第</span><b>{toChinese(question.id)}</b><span>问</span></div>
        <p className="question-card__dimension">此问观 · {dimensions[question.dimension]}</p>
        <h1>{question.text}</h1>
        <div className="answer-list" role="radiogroup" aria-label="请选择与你实际情况最接近的一项">
          {answerOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }}
              className={value === option.value ? "answer-option is-selected" : "answer-option"}
              role="radio" aria-checked={value === option.value}
              onClick={() => onAnswer(option.value)}
            >
              <span className="answer-option__mark">{value === option.value ? "●" : "○"}</span>
              <span><b>{option.label}</b><small>{option.note}</small></span>
              <i aria-hidden="true" />
            </motion.button>
          ))}
        </div>
      </motion.article>
    </AnimatePresence>
  );
}

function toChinese(n: number) {
  const digits = ["零","一","二","三","四","五","六","七","八","九"];
  if (n < 10) return digits[n];
  if (n === 10) return "十";
  if (n < 20) return `十${digits[n-10]}`;
  return `${digits[Math.floor(n/10)]}十${n%10 ? digits[n%10] : ""}`;
}
