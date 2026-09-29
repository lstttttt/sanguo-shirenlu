"use client";

import { AnimatePresence, motion } from "framer-motion";
import { answerOptions, type Question } from "@/data/questions";

export function QuestionCard({ question, value, keyboardValue, direction, onAnswer, onKeyboardValue }: { question: Question; value?: number; keyboardValue?:number; direction: number; onAnswer: (value:number) => void; onKeyboardValue:(value:number)=>void }) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.article
        key={question.id}
        custom={direction}
        initial={false}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: direction * -20, filter: "blur(3px)" }}
        transition={{ duration: .18, ease: [0.22,1,0.36,1] }}
        className="question-card"
      >
        <div className="question-card__index"><span>第</span><b>{question.id}</b><span>题</span></div>
        <h1>{question.text}</h1>
        <p className="question-card__prompt">按你通常会怎么做来回答；没有标准答案。</p>
        <div className="answer-list" role="radiogroup" aria-label="请选择与你实际情况最接近的一项">
          {answerOptions.map((option) => (
            <motion.button
              key={option.value}
              initial={false} animate={{ opacity: 1, y: 0 }}
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
