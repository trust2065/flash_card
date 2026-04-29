import type { Character } from '../data/lesson1';
import { playAudio } from '../utils/audio';

interface CardDetailsProps {
  card: Character;
  onClose?: () => void;
}

export function CardDetails({ card, onClose }: CardDetailsProps) {
  return (
    <>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full border border-white/10 bg-white/5 text-fg/40 text-[0.8rem] cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95 z-10"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div
        className={`flex justify-between items-center mb-8 pb-3 ${onClose ? 'pr-10' : ''}`}
        style={{ borderBottom: '2px dashed rgba(255,255,255,0.1)' }}
      >
        <span className="font-char text-[72px] font-bold leading-none text-primary">
          {card.char}
        </span>
        <button
          className="w-16 h-16 rounded-[28px] bg-primary text-white flex items-center justify-center transition-transform duration-200 active:scale-90 cursor-pointer shrink-0"
          style={{ boxShadow: '0 8px 24px rgba(124,106,255,0.35)' }}
          onClick={(e) => { e.stopPropagation(); playAudio(card.char); }}
          aria-label="播放讀音"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center text-2xl">
          <span className="font-semibold text-fg/50 w-[60px] text-lg shrink-0">注音</span>
          <span className="font-bold text-fg grow font-char text-accent tracking-[4px]">{card.zhuyin}</span>
        </div>

        <div className="flex items-center text-2xl">
          <span className="font-semibold text-fg/50 w-[60px] text-lg shrink-0">詞語</span>
          <span className="font-bold text-success grow flex items-center">{card.example}</span>
          <button
            className="w-11 h-11 rounded-xl flex items-center justify-center text-primary bg-primary/20 ml-3 cursor-pointer active:scale-90 transition-transform shrink-0"
            onClick={(e) => { e.stopPropagation(); playAudio(card.example); }}
            aria-label="播放詞語"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center text-2xl">
          <span className="font-semibold text-fg/50 w-[60px] text-lg shrink-0">意思</span>
          <span className="font-medium text-white/85 grow text-xl leading-snug">{card.meaning}</span>
        </div>
      </div>
    </>
  );
}
