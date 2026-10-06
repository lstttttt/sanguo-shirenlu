"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type AnswerId, type Question } from "@/data/questions";

export function QuestionCard({ question, value, keyboardValue, direction, onAnswer, onKeyboardValue }: { question: Question; value?: AnswerId; keyboardValue?:AnswerId; direction: number; onAnswer: (value:AnswerId) => void; onKeyboardValue:(value:AnswerId)=>void }) {
  return <AnimatePresence mode="wait" custom={direction}><motion.article key={question.id} custom={direction} initial={false} animate={{opacity:1,x:0,filter:"blur(0px)"}} exit={{opacity:0,x:direction*-20,filter:"blur(3px)"}} transition={{duration:.21,ease:[.22,1,.36,1]}} className="question-card">
    <div className="question-card__index"><span>第</span><b>{question.id}</b><span>题</span></div>
    <h1>{question.text}</h1>
    <p className="question-card__prompt">选择你愿意承担其后果的做法。</p>
    <div className="answer-list scenario-options" role="radiogroup" aria-label="请选择一种做法">
      {question.options.map(option=><motion.button key={option.id} initial={false} animate={{opacity:1,y:0}} className={`answer-option ${value===option.id?"is-selected":""} ${keyboardValue===option.id?"is-keyboard":""}`} role="radio" aria-checked={value===option.id} onClick={()=>onAnswer(option.id)} onFocus={()=>onKeyboardValue(option.id)} onMouseEnter={()=>onKeyboardValue(option.id)}>
        <span className="answer-option__number">{option.id}</span><b>{option.text}</b><i aria-hidden="true" />
      </motion.button>)}
    </div>
  </motion.article></AnimatePresence>;
}
