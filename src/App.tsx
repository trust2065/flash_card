import { useState, useEffect } from 'react'
import { StudySession } from './components/StudySession'
import { ResultScreen } from './components/ResultScreen'
import { ProgressScreen } from './components/ProgressScreen'
import { ResetModal } from './components/ResetModal'
import { useSpacedRepetition } from './hooks/useSpacedRepetition'
import { CoinAnimation } from './components/CoinAnimation'

function App() {
  const sr = useSpacedRepetition()
  const [showProgress, setShowProgress] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err)
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      }
    }
  }

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
      {/* Fullscreen toggle button */}
      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "退出全螢幕" : "進入全螢幕"}
        className="absolute top-6 right-6 w-11 h-11 rounded-full border border-white/[0.12] bg-white/5 text-xl flex items-center justify-center z-50 transition-all duration-200 hover:bg-white/10 hover:scale-110 cursor-pointer text-white/70 hover:text-white"
        title="全螢幕模式避免分心"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
        )}
      </button>
      <CoinAnimation />
    </main>
  )
}

export default App
