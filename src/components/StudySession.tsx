import './StudySession.css'
import { FlashCard } from './FlashCard'
import type { useSpacedRepetition } from '../hooks/useSpacedRepetition'

interface StudySessionProps {
  sr: ReturnType<typeof useSpacedRepetition>
  onFinish: () => void
}

export function StudySession({ sr, onFinish }: StudySessionProps) {
  if (sr.isFinished || !sr.current) {
    onFinish()
    return null
  }

  const { current, answer, queueLength, stats } = sr
  const currentIndex = stats.total
  const progress = (currentIndex / queueLength) * 100

  return (
    <div className="study-session">
      {/* Progress Bar */}
      <div className="progress-container">
        <label className="sr-only">學習進度</label>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="progress-text">{currentIndex} / {queueLength}</span>
      </div>

      <div className="card-area">
        <FlashCard card={current} />
      </div>

      <div className="controls">
        <button 
          className="btn btn-secondary" 
          onClick={() => answer(false)}
          aria-label="不認識"
        >
          <span className="btn-icon">🤔</span>
          <span>不認識</span>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => answer(true)}
          aria-label="認識"
        >
          <span className="btn-icon">💡</span>
          <span>認識</span>
        </button>
      </div>
    </div>
  )
}
