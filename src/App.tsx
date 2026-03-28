import { StudySession } from './components/StudySession'
import { ResultScreen } from './components/ResultScreen'
import { useSpacedRepetition } from './hooks/useSpacedRepetition'
import './App.css'

function App() {
  const sr = useSpacedRepetition()

  return (
    <main className="app-container">
      {sr.isFinished ? (
        <ResultScreen stats={sr.stats} onRestart={sr.restart} />
      ) : (
        <StudySession sr={sr} onFinish={() => {}} />
      )}
    </main>
  )
}

export default App
