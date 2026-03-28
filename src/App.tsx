import { useState } from 'react'
import { StudySession } from './components/StudySession'
import { ResultScreen } from './components/ResultScreen'
import { ProgressScreen } from './components/ProgressScreen'
import { useSpacedRepetition } from './hooks/useSpacedRepetition'
import './App.css'

function App() {
  const sr = useSpacedRepetition()
  const [showProgress, setShowProgress] = useState(false)

  if (sr.isLoading) {
    return <div className="loading-screen">同步雲端資料中...</div>
  }

  const handleReset = () => {
    const password = prompt('請輸入密碼以重置學習紀錄：')
    if (password === '1234') {
      sr.resetData()
      alert('重置成功！')
    } else if (password !== null) {
      alert('密碼錯誤！')
    }
  }

  if (showProgress) {
    return (
      <main className="app-container scrollable">
        <ProgressScreen store={sr.store} onClose={() => setShowProgress(false)} />
        <button onClick={handleReset} className="reset-button">重置</button>
      </main>
    )
  }

  return (
    <main className="app-container">
      {sr.isFinished ? (
        <ResultScreen stats={sr.stats} onRestart={sr.restart} />
      ) : (
        <StudySession sr={sr} onFinish={() => {}} />
      )}

      <button
        onClick={() => setShowProgress(true)}
        className="progress-toggle-button"
        aria-label="查看學習成果"
      >
        📊
      </button>

      <button onClick={handleReset} className="reset-button">
        重置
      </button>
    </main>
  )
}

export default App
