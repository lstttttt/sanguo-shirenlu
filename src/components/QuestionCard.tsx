"use client";

import { AnimatePresence, motion } from "framer-motion";
import { answerOptions, type Question } from "@/data/questions";

export function QuestionCard({ question, value, keyboardValue, direction, onAnswer, onKeyboardValue }: { question: Question; value?: number; keyboardValue?:number; direction: number; onAnswer: (value:number) => void; onKeyboardValue:(value:number)=>void }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.article
        key={question.id}
        custom={direction}
        initial={{ opacity: 0, x: direction * 28, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: direction * -20, filter: "blur(3px)" }}
        transition={{ duration: .18, ease: [0.22,1,0.36,1] }}
        className="question-card"
      >
        <div className="question-card__index"><span>第</span><b>{toChinese(question.id)}</b><span>问</span></div>
        <h1>{question.text}</h1>
        <p className="question-card__prompt">请选择更接近日常中的你，而不是你认为更正确的答案。</p>
        <div className="answer-list" role="radiogroup" aria-label="请选择与你实际情况最接近的一项">
          {answerOptions.map((option, index) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .035 }}
              className={`answer-option ${value === option.value ? "is-selected" : ""} ${keyboardValue === option.value ? "is-keyboard" : ""}`}
              role="radio" aria-checked={value === option.value}
              onClick={() => onAnswer(option.value)}
              onFocus={() => onKeyboardValue(option.value)}
              onMouseEnter={() => onKeyboardValue(option.value)}
            >
              <span className="answer-option__number">{option.value}</span>
              <b>{option.label}</b>
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
