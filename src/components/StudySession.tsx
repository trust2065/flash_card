import { FlashCard } from './FlashCard';
import type { useSpacedRepetition } from '../hooks/useSpacedRepetition';

interface StudySessionProps {
  sr: ReturnType<typeof useSpacedRepetition>;
  onFinish: () => void;
}

export function StudySession({ sr, onFinish }: StudySessionProps) {
  if (sr.isLoading) return null;
  if (sr.isFinished || !sr.current) {
    onFinish();
    return null;
  }

  const { current, answer, queueLength, stats, streak } = sr;
  const currentIndex = stats.total;
  const progress = (currentIndex / queueLength) * 100;

  return (
    <div className="w-full max-w-[600px] flex flex-col h-full p-5 grow">
      {/* Progress bar */}
      <div className="flex items-center gap-5 mb-3 px-3">
        <label className="sr-only">學習進度</label>
        <div className="grow h-3 bg-surface rounded-full overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c6aff, #ff6b9d)',
              boxShadow: '0 0 12px rgba(124,106,255,0.35)',
            }}
          />
        </div>
        <span className="font-extrabold text-sm text-fg/50 [font-variant-numeric:tabular-nums] min-w-[48px] text-right">
          {currentIndex} / {queueLength}
        </span>
      </div>

      {/* Card */}
      <div className="grow flex items-center justify-center">
        <FlashCard key={current.char} card={current} />
      </div>

      {/* Streak */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="transition-all duration-300"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: i < (streak % 5 || (streak > 0 && streak % 5 === 0 ? 5 : 0))
                ? 'linear-gradient(135deg, #7c6aff, #ff6b9d)'
                : 'rgba(255,255,255,0.07)',
              boxShadow: i < (streak % 5 || (streak > 0 && streak % 5 === 0 ? 5 : 0))
                ? '0 2px 12px rgba(124,106,255,0.5)'
                : 'none',
              transform: i < (streak % 5 || (streak > 0 && streak % 5 === 0 ? 5 : 0)) ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
        {streak > 0 && (
          <span className="text-xs font-bold text-fg/50 ml-1">
            🔥 {streak}
          </span>
        )}
      </div>

      {/* Controls */}
      <div
        className="grid grid-cols-2 gap-5 mt-auto"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >
        <button
          className="h-20 rounded-[28px] flex flex-col items-center justify-center gap-1 font-ui text-xl font-extrabold border-2 border-white/5 bg-surface text-fg transition-all duration-200 active:scale-95 select-none cursor-pointer hover:bg-white/[0.08]"
          onClick={() => answer(false)}
          aria-label="不認識"
        >
          <span className="text-[28px]">🤔</span>
          <span>不認識</span>
        </button>

        <button
          className="h-20 rounded-[28px] flex flex-col items-center justify-center gap-1 font-ui text-xl font-extrabold bg-primary text-white transition-all duration-200 active:scale-95 select-none cursor-pointer"
          style={{ boxShadow: '0 12px 32px rgba(124,106,255,0.35)' }}
          onClick={() => answer(true)}
          aria-label="認識"
        >
          <span className="text-[28px]">💡</span>
          <span>認識</span>
        </button>
      </div>
    </div>
  );
}
