import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ResetModalProps {
  onClose: (didReset?: boolean) => void
  onConfirm: (password: string) => Promise<boolean> | boolean
}

export function ResetModal({ onClose, onConfirm }: ResetModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isWorking, setIsWorking] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password || isWorking) return
    setIsWorking(true)
    setError(false)

    try {
      const success = await onConfirm(password)
      if (success) {
        setIsSuccess(true)
        setTimeout(() => {
          onClose(true)
        }, 1200)
      } else {
        setError(true)
        setIsWorking(false)
      }
    } catch {
      setError(true)
      setIsWorking(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isWorking && !isSuccess) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <form 
        onSubmit={handleSubmit}
        className="bg-[#1e293b] border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl overflow-hidden relative"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <h2 className="text-xl font-bold text-white m-0">重置學習紀錄</h2>
              <p className="text-slate-400 text-sm m-0">請輸入密碼以確認重置所有進度與成績。</p>
              
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  placeholder="請輸入密碼"
                  disabled={isWorking}
                  className={`w-full bg-black/20 border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${isWorking ? 'opacity-50' : ''}`}
                  autoFocus
                />
                {error && <p className="text-red-400 text-xs mt-1 mb-0">密碼錯誤</p>}
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  disabled={isWorking}
                  className="px-4 py-2 rounded-lg font-medium text-slate-300 hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isWorking}
                  className="px-4 py-2 rounded-lg font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isWorking ? '處理中...' : '確認重置'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white m-0">重置成功！</h3>
              <p className="text-slate-400 text-sm m-0">已清理所有學習進度</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}

