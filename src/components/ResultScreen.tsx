import { motion } from 'framer-motion'

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
  const starsCount = accuracy > 90 ? 3 : accuracy > 60 ? 2 : 1

  return (
    <div className="grow w-full max-w-[600px] flex flex-col items-center justify-center p-12 gap-8 text-center">
      {/* Stars */}
      <motion.div
        className="flex gap-5 mb-3"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
      >
        {[...Array(starsCount)].map((_, i) => (
          <motion.div
            key={i}
            className="text-[80px]"
            style={{ filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.5))' }}
            variants={{
              hidden: { scale: 0, opacity: 0, rotate: -30 },
              visible: {
                scale: 1, opacity: 1, rotate: 0,
                transition: { type: 'spring', stiffness: 200, damping: 10 },
              },
            }}
          >
            ⭐
          </motion.div>
        ))}
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-[36px] font-black text-fg m-0"
        style={{ textShadow: '0 4px 16px rgba(124,106,255,0.35)' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
      >
        太棒了！
      </motion.h1>

      {/* Stats */}
      <motion.div
        className="bg-card border border-white/[0.08] rounded-[28px] p-8 flex justify-around w-full max-w-[320px]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
      >
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-fg/50">認識</div>
          <div
            className="text-[48px] [font-variant-numeric:tabular-nums] font-extrabold leading-none text-success"
            style={{ textShadow: '0 0 20px rgba(62,207,142,0.35)' }}
          >
            {stats.known}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-fg/50">還要加油</div>
          <div className="text-[48px] [font-variant-numeric:tabular-nums] font-extrabold leading-none text-danger opacity-80">
            {stats.unknown}
          </div>
        </div>
      </motion.div>

      {/* Restart */}
      <motion.button
        className="mt-12 h-16 px-12 rounded-full bg-primary text-white text-2xl font-extrabold font-ui border-0 cursor-pointer transition-transform duration-200 active:scale-[0.92]"
        style={{ boxShadow: '0 8px 32px rgba(124,106,255,0.35)' }}
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
