import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Character } from '../data/lesson1'
import './FlashCard.css'

interface FlashCardProps {
  card: Character
  onFlip?: () => void
}

export function FlashCard({ card, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false)
  }, [card])

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    onFlip?.()
    
    // Play audio when flipped to back
    if (!isFlipped) {
      playAudio(card.char)
    }
  }

  const playAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-TW'
    utterance.rate = 0.8 // Slightly slower for kids
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <motion.div
        className="flashcard-inner"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="flashcard-face flashcard-front">
          <span className="flashcard-char">{card.char}</span>
          <span className="flashcard-hint">點擊翻面</span>
        </div>

        {/* Back */}
        <div className="flashcard-face flashcard-back">
          <div className="flashcard-header">
            <span className="flashcard-char-small">{card.char}</span>
            <button 
              className="audio-btn" 
              onClick={(e) => {
                e.stopPropagation()
                playAudio(card.char)
              }}
              aria-label="播放讀音"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </button>
          </div>
          
          <div className="flashcard-details">
            <div className="detail-row">
              <span className="detail-label">注音</span>
              <span className="detail-value zhuyin">{card.zhuyin}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">拼音</span>
              <span className="detail-value">{card.pinyin}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">詞語</span>
              <span className="detail-value example">{card.example}</span>
              <button 
                className="audio-btn small" 
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(card.example)
                }}
                aria-label="播放詞語"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              </button>
            </div>
            <div className="detail-row">
              <span className="detail-label">意思</span>
              <span className="detail-value meaning">{card.meaning}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
