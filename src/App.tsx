import { useState } from 'react'
import { StudySession } from './components/StudySession'
import { ResultScreen } from './components/ResultScreen'
import { ProgressScreen } from './components/ProgressScreen'
import { ResetModal } from './components/ResetModal'
import { useSpacedRepetition } from './hooks/useSpacedRepetition'

function App() {
  const sr = useSpacedRepetition()
  const [showProgress, setShowProgress] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  if (sr.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a] text-slate-400 text-2xl">
        同步雲端資料中...
      </div>
    )
  }

  const handleResetConfirm = async (password: string) => {
    if (password === '1234') {
      return true
    } else {
      return false
    }
  }

  return (
    <main
      className={`fixed inset-0 flex flex-col items-center ${
        showProgress ? 'overflow-y-auto' : 'overflow-hidden'
      }`}
    >
      {showProgress ? (
        <ProgressScreen store={sr.store} onClose={() => setShowProgress(false)} />
      ) : sr.isFinished ? (
        <ResultScreen stats={sr.stats} onRestart={sr.restart} />
      ) : (
        <StudySession sr={sr} onFinish={() => {}} />
      )}

      {/* 📊 progress toggle — hidden when already on progress page */}
      {!showProgress && (
        <button
          onClick={() => setShowProgress(true)}
          aria-label="查看學習成果"
          className="absolute bottom-6 left-6 w-11 h-11 rounded-full border border-white/[0.12] bg-primary/15 text-xl flex items-center justify-center z-50 transition-all duration-200 hover:bg-primary/30 hover:scale-110 cursor-pointer"
        >
          📊
        </button>
      )}

      {/* Reset button */}
      <button
        onClick={() => setShowResetModal(true)}
        className="absolute bottom-6 right-6 px-4 py-2 text-[0.8rem] bg-white/5 border border-white/10 rounded-lg text-[#a0a0a0] z-50 transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer"
      >
        重置
      </button>

      {/* Reset Modal */}
      {showResetModal && (
        <ResetModal
          onClose={(didReset) => {
            setShowResetModal(false)
            if (didReset) {
              sr.resetData()
              setShowProgress(false) // Exit progress screen if open
            }
          }}
          onConfirm={handleResetConfirm}
        />
      )}
    </main>
  )
}

export default App
