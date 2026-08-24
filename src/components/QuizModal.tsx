import { useState } from 'react'
import type { Quiz } from '../data/quizzes'
import { useGameStore } from '../state/store'
import { playClick, playCorrect, playIncorrect } from '../lib/sound'
import Modal from './Modal'

interface Props {
  quiz: Quiz
  onSolved: () => void
  onClose: () => void
}

export default function QuizModal({ quiz, onSolved, onClose }: Props) {
  const soundEnabled = useGameStore((s) => s.soundEnabled)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = selected === quiz.correctIndex

  function handleSubmit() {
    if (selected === null) return
    setSubmitted(true)
    if (soundEnabled) (selected === quiz.correctIndex ? playCorrect : playIncorrect)()
  }

  function handleContinue() {
    onSolved()
  }

  return (
    <Modal title="Field Challenge" icon={'\u{1F9E9}'} onClose={onClose}>
      <p className="quiz-question">{quiz.question}</p>
      <div className="quiz-options">
        {quiz.options.map((option, i) => {
          const state = !submitted
            ? selected === i
              ? 'selected'
              : ''
            : i === quiz.correctIndex
              ? 'correct'
              : i === selected
                ? 'incorrect'
                : ''
          return (
            <button
              key={option}
              type="button"
              className={`quiz-option ${state}`}
              disabled={submitted}
              onClick={() => {
                setSelected(i)
                if (soundEnabled) playClick()
              }}
            >
              {option}
            </button>
          )
        })}
      </div>

      {!submitted && (
        <button type="button" className="btn btn-primary" disabled={selected === null} onClick={handleSubmit}>
          Submit Answer
        </button>
      )}

      {submitted && (
        <div className="quiz-result">
          <p className={isCorrect ? 'quiz-correct-text' : 'quiz-incorrect-text'}>
            {isCorrect ? 'Correct!' : 'Not quite.'}
          </p>
          <p className="modal-note">{quiz.explanation}</p>
          {isCorrect ? (
            <button type="button" className="btn btn-primary" onClick={handleContinue}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false)
                setSelected(null)
              }}
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </Modal>
  )
}
