import { lesson1 } from '../data/lesson1'
import type { SRStore } from '../hooks/useSpacedRepetition'
import './ProgressScreen.css'

interface Props {
  store: SRStore
  onClose: () => void
}

const BUCKET_LABELS = ['初見', '認識中', '熟悉', '很熟', '精通']
const MAX_BUCKET = 4

function CircleProgress({ bucket, char, zhuyin }: { bucket: number; char: string; zhuyin: string }) {
  const size = 96
  const stroke = 5
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const progress = bucket / MAX_BUCKET
  const dash = circumference * progress
  const gap = circumference - dash

  // background track opacity based on bucket
  const isMastered = bucket === MAX_BUCKET

  return (
    <div className="pc-circle-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="pc-svg">
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(124,106,255,0.12)"
          strokeWidth={stroke}
        />
        {/* progress — SVG is rotated -90deg via CSS so arc starts from top */}
        {bucket > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={isMastered ? '#7c6aff' : 'rgba(124,106,255,0.65)'}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            className="pc-progress-arc"
          />
        )}
      </svg>
      <div className="pc-circle-inner">
        <span className="pc-char">{char}</span>
        <span className="pc-zhuyin">{zhuyin}</span>
      </div>
    </div>
  )
}

export function ProgressScreen({ store, onClose }: Props) {
  const total = lesson1.length
  const mastered = lesson1.filter((c) => (store[c.char]?.bucket ?? 0) >= MAX_BUCKET).length
  const learning = lesson1.filter((c) => {
    const b = store[c.char]?.bucket ?? 0
    return b > 0 && b < MAX_BUCKET
  }).length
  const unseen = total - mastered - learning

  const progressPct = Math.round((mastered / total) * 100)

  return (
    <div className="progress-screen">
      <div className="progress-header">
        <button className="progress-close" onClick={onClose} aria-label="關閉">✕</button>
        <h1 className="progress-title">學習成果</h1>
        <p className="progress-subtitle">共 {total} 個字</p>
      </div>

      {/* Overall bar */}
      <div className="overall-wrap">
        <div className="overall-bar-bg">
          <div className="overall-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="overall-stats">
          <span className="os-item os-mastered"><strong>{mastered}</strong> 精通</span>
          <span className="os-item os-learning"><strong>{learning}</strong> 學習中</span>
          <span className="os-item os-unseen"><strong>{unseen}</strong> 未見過</span>
          <span className="os-pct">{progressPct}%</span>
        </div>
      </div>

      {/* Card grid */}
      <div className="progress-grid">
        {lesson1.map((card) => {
          const bucket = store[card.char]?.bucket ?? 0
          const lastSeen = store[card.char]?.lastSeen
          const lastSeenStr = lastSeen
            ? new Date(lastSeen).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
            : '從未'

          return (
            <div key={card.char} className={`progress-card${bucket === MAX_BUCKET ? ' mastered' : ''}`}>
              <CircleProgress bucket={bucket} char={card.char} zhuyin={card.zhuyin} />
              <div className="pc-label">{BUCKET_LABELS[bucket]}</div>
              <div className="pc-last-seen">上次：{lastSeenStr}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
