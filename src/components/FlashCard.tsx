import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Character } from '../data/lesson1';
import { playAudio } from '../utils/audio';

import { CardDetails } from './CardDetails';

interface FlashCardProps {
  card: Character;
  onFlip?: () => void;
}

export function FlashCard({ card, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
    if (!isFlipped) playAudio(card.char);
  };

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
  };

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
          <CardDetails card={card} />
        </div>
      </motion.div>
    </div>
  );
}
