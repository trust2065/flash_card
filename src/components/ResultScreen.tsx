import { motion } from 'framer-motion'
import './ResultScreen.css'

interface ResultScreenProps {
  stats: {
    known: number
    unknown: number
  }
  onRestart: () => void
}

export function ResultScreen({ stats, onRestart }: ResultScreenProps) {
  const total = stats.known + stats.unknown
  const accuracy = total > 0 ? Math.round((stats.known / total) * 100) : 0
  
  // Decide stars to show based on accuracy 0-100
  const starsCount = accuracy > 90 ? 3 : accuracy > 60 ? 2 : 1

  return (
    <div className="result-screen">
      <motion.div 
        className="stars"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.3 } },
        }}
      >
        {[...Array(starsCount)].map((_, i) => (
          <motion.div 
            key={i}
            className="star"
            variants={{
              hidden: { scale: 0, opacity: 0, rotate: -30 },
              visible: { 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { type: 'spring', stiffness: 200, damping: 10 }
              }
            }}
          >
            ⭐
          </motion.div>
        ))}
      </motion.div>

      <motion.h1 
        className="result-title"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        太棒了！
      </motion.h1>

      <motion.div 
        className="stats-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
      >
        <div className="stat-item">
          <div className="stat-label">認識</div>
          <div className="stat-value success">{stats.known}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">還要加油</div>
          <div className="stat-value warning">{stats.unknown}</div>
        </div>
      </motion.div>

      <motion.button 
        className="btn-restart"
        onClick={onRestart}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        再玩一次
      </motion.button>
    </div>
  )
}
