import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Character } from '../data/lesson1'

interface FlashCardProps {
  card: Character
  onFlip?: () => void
}

export function FlashCard({ card, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
    if (!isFlipped) playAudio(card.char)
  }

  const playAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.8
    window.speechSynthesis.speak(utterance)
  }

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 40,
    border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  return (
    <div
      className="w-full max-w-[480px] h-[50vh] min-h-[380px] my-8 mx-auto cursor-pointer"
      style={{ perspective: '1200px' }}
      onClick={handleFlip}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div
          style={{
            ...faceBase,
            background: 'linear-gradient(145deg, #1a1833, #231f3a)',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <span
            className="font-char font-black leading-[1.1] text-fg"
            style={{
              fontSize: 160,
              textShadow: '0 4px 16px rgba(124,106,255,0.35)',
            }}
          >
            {card.char}
          </span>
          <span className="absolute bottom-5 text-sm text-fg/30 font-semibold tracking-[2px]">
            點擊翻面
          </span>
        </div>

        {/* Back */}
        <div
          style={{
            ...faceBase,
            transform: 'rotateY(180deg)',
            background: '#231f3a',
            padding: 32,
            justifyContent: 'flex-start',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center mb-8 pb-3"
            style={{ borderBottom: '2px dashed rgba(255,255,255,0.1)' }}
          >
            <span className="font-char text-[72px] font-bold leading-none text-primary">
              {card.char}
            </span>
            <button
              className="w-16 h-16 rounded-[28px] bg-primary text-white flex items-center justify-center transition-transform duration-200 active:scale-90 cursor-pointer"
              style={{ boxShadow: '0 8px 24px rgba(124,106,255,0.35)' }}
              onClick={(e) => { e.stopPropagation(); playAudio(card.char) }}
              aria-label="播放讀音"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {[
              { label: '注音', value: card.zhuyin, extra: 'font-char text-accent tracking-[4px]' },
              { label: '拼音', value: card.pinyin, extra: '' },
            ].map(({ label, value, extra }) => (
              <div key={label} className="flex items-center text-2xl">
                <span className="font-semibold text-fg/50 w-[60px] text-lg shrink-0">{label}</span>
                <span className={`font-bold text-fg grow ${extra}`}>{value}</span>
              </div>
            ))}

            {/* 詞語 row with audio */}
            <div className="flex items-center text-2xl">
              <span className="font-semibold text-fg/50 w-[60px] text-lg shrink-0">詞語</span>
              <span className="font-bold text-success grow flex items-center">{card.example}</span>
              <button
                className="w-11 h-11 rounded-xl flex items-center justify-center text-primary bg-primary/20 ml-3 cursor-pointer active:scale-90 transition-transform"
                onClick={(e) => { e.stopPropagation(); playAudio(card.example) }}
                aria-label="播放詞語"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              </button>
            </div>

            <div className="flex items-center text-2xl">
              <span className="font-semibold text-fg/50 w-[60px] text-lg shrink-0">意思</span>
              <span className="font-medium text-white/85 grow text-xl leading-snug">{card.meaning}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
