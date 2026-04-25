import type { Character } from '../data/lesson1';
import type { SRStore } from '../hooks/useSpacedRepetition';
import { playAudio } from '../utils/audio';

interface Props {
  store: SRStore;
  cards: Character[];
  onClose: () => void;
}

const BUCKET_LABELS = ['初見', '認識中', '熟悉', '很熟', '精通'];
const MAX_BUCKET = 4;

function CircleProgress({ bucket, char, zhuyin }: { bucket: number; char: string; zhuyin: string; }) {
  const size = 96;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (bucket / MAX_BUCKET) * circumference;
  const gap = circumference - dash;
  const isMastered = bucket === MAX_BUCKET;

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 w-full h-full"
      >
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(124,106,255,0.15)" strokeWidth={stroke}
        />
        {bucket > 0 && (
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={isMastered ? '#7c6aff' : 'rgba(124,106,255,0.6)'}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            className="transition-all duration-500 ease"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-char text-[1.9rem] font-bold text-fg leading-none">{char}</span>
        <span className="text-[0.6rem] text-fg/40">{zhuyin}</span>
      </div>
    </div>
  );
}

export function ProgressScreen({ store, cards, onClose }: Props) {
  const total = cards.length;
  const mastered = cards.filter((c) => (store[c.char]?.bucket ?? 0) >= MAX_BUCKET).length;
  const learning = cards.filter((c) => {
    const b = store[c.char]?.bucket ?? 0;
    return b > 0 && b < MAX_BUCKET;
  }).length;
  const unseen = total - mastered - learning;
  const progressPct = Math.round((mastered / total) * 100);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center pb-14">

      {/* Header */}
      <div className="w-full max-w-[680px] px-5 pt-10 pb-4 flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-10 right-5 w-9 h-9 rounded-full border border-white/10 bg-white/5 text-fg/40 text-[0.8rem] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95"
        >
          ✕
        </button>
        <h1 className="font-ui text-[1.7rem] font-black text-primary mb-1 mt-0">
          學習成果
        </h1>
        <p className="text-[0.85rem] text-fg/40 m-0">共 {total} 個字</p>
      </div>

      {/* Progress bar + stats */}
      <div className="w-[calc(100%-40px)] max-w-[680px] mb-6 flex flex-col gap-2.5">
        <div className="h-2 rounded-full bg-primary/12 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-600 ease"
            style={{ width: `${progressPct}%`, boxShadow: '0 0 12px rgba(124,106,255,0.5)' }}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[0.78rem] text-fg/50">
            <strong className="text-primary font-bold">{mastered}</strong> 精通
          </span>
          <span className="text-[0.78rem] text-fg/50">
            <strong className="text-primary/65 font-bold">{learning}</strong> 學習中
          </span>
          <span className="text-[0.78rem] text-fg/50">
            <strong className="text-fg/30 font-bold">{unseen}</strong> 未見過
          </span>
          <span className="ml-auto text-[0.85rem] font-bold text-primary">
            {progressPct}%
          </span>
        </div>
      </div>

      {/* Card grid */}
      <div className="w-[calc(100%-40px)] max-w-[680px] grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3.5">
        {cards.map((card) => {
          const bucket = store[card.char]?.bucket ?? 0;
          const lastSeen = store[card.char]?.lastSeen;
          const lastSeenStr = lastSeen
            ? new Date(lastSeen).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
            : '從未';
          const isMastered = bucket === MAX_BUCKET;

          return (
            <div
              key={card.char}
              onClick={() => playAudio(card.char)}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-[20px] transition-transform duration-150 cursor-pointer border ${isMastered
                  ? 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:-translate-y-1 hover:shadow-lg shadow-black/20'
                  : 'border-white/[0.07] bg-white/[0.03] hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg shadow-black/20'
                }`}
            >
              <CircleProgress bucket={bucket} char={card.char} zhuyin={card.zhuyin} />
              <span className={`text-[0.72rem] font-bold ${isMastered ? 'text-primary' : 'text-primary/85'}`}>
                {BUCKET_LABELS[bucket]}
              </span>
              <span className="text-[0.6rem] text-fg/25">
                上次：{lastSeenStr}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
