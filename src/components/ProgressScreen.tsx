import { lesson1 } from '../data/lesson1'
import type { SRStore } from '../hooks/useSpacedRepetition'

interface Props {
  store: SRStore
  onClose: () => void
}

const BUCKET_LABELS = ['初見', '認識中', '熟悉', '很熟', '精通']
const MAX_BUCKET = 4

// SVG circle progress — bucket 0-4
function CircleProgress({ bucket, char, zhuyin }: { bucket: number; char: string; zhuyin: string }) {
  const size = 96
  const stroke = 5
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const dash = (bucket / MAX_BUCKET) * circumference
  const gap = circumference - dash
  const isMastered = bucket === MAX_BUCKET

  return (
    <div className="relative w-24 h-24">
      {/* SVG rotated so arc starts from top */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
      >
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(124,106,255,0.12)"
          strokeWidth={stroke}
        />
        {/* progress arc */}
        {bucket > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={isMastered ? '#7c6aff' : 'rgba(124,106,255,0.55)'}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        )}
      </svg>

      {/* Inner content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span
          className="text-3xl font-bold leading-none text-white"
          style={{ fontFamily: "'Noto Sans TC', sans-serif" }}
        >
          {char}
        </span>
        <span className="text-[10px] text-white/40 tracking-tight">{zhuyin}</span>
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
    <div className="w-full min-h-dvh flex flex-col items-center pb-14 overflow-y-auto">

      {/* Header */}
      <div className="w-full max-w-2xl px-5 pt-10 pb-4 flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-10 right-5 w-9 h-9 rounded-full border border-white/10 bg-white/5 text-white/40 text-sm flex items-center justify-center hover:bg-violet-500/20 hover:text-violet-400 hover:border-violet-500/40 transition-all cursor-pointer"
        >
          ✕
        </button>
        <h1
          className="text-2xl font-black text-violet-400 mb-1"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          學習成果
        </h1>
        <p className="text-sm text-white/40">共 {total} 個字</p>
      </div>

      {/* Progress bar + stats */}
      <div className="w-full max-w-2xl px-5 mb-6 flex flex-col gap-2">
        <div className="h-2 rounded-full bg-violet-500/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-500"
            style={{ width: `${progressPct}%`, boxShadow: '0 0 12px rgba(124,106,255,0.5)' }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-white/50">
          <span><strong className="text-violet-400 font-bold">{mastered}</strong> 精通</span>
          <span><strong className="text-violet-400/60 font-bold">{learning}</strong> 學習中</span>
          <span><strong className="text-white/30 font-bold">{unseen}</strong> 未見過</span>
          <span className="ml-auto font-bold text-violet-400">{progressPct}%</span>
        </div>
      </div>

      {/* Card grid */}
      <div className="w-full max-w-2xl px-5 grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}
      >
        {lesson1.map((card) => {
          const bucket = store[card.char]?.bucket ?? 0
          const lastSeen = store[card.char]?.lastSeen
          const lastSeenStr = lastSeen
            ? new Date(lastSeen).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
            : '從未'

          return (
            <div
              key={card.char}
              className={`
                flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-150
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/10
                ${bucket === MAX_BUCKET
                  ? 'bg-violet-500/8 border-violet-500/30'
                  : 'bg-white/3 border-white/8'
                }
              `}
            >
              <CircleProgress bucket={bucket} char={card.char} zhuyin={card.zhuyin} />
              <span className="text-[11px] font-bold text-violet-400/80">
                {BUCKET_LABELS[bucket]}
              </span>
              <span className="text-[10px] text-white/25">上次：{lastSeenStr}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
