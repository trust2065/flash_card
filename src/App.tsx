import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { StudySession } from './components/StudySession';
import { ResultScreen } from './components/ResultScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ResetModal } from './components/ResetModal';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { CoinAnimation } from './components/CoinAnimation';
import { lesson1 } from './data/lesson1';
import { lesson2 } from './data/lesson2';

function App() {
  const { width, height } = useWindowSize();
  const [selectedLesson, setSelectedLesson] = useState<'1' | '2' | 'all'>('1');

  const cards =
    selectedLesson === '1' ? lesson1
      : selectedLesson === '2' ? lesson2
        : [...lesson1, ...lesson2];

  const sr = useSpacedRepetition(cards);
  const [showProgress, setShowProgress] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTestConfetti, setShowTestConfetti] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 切換課程時自動重置 queue
  useEffect(() => {
    sr.restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLesson]);


  // 監聽連續答對與升級狀態來觸發金幣動畫
  useEffect(() => {
    let coinCount = 0;

    // 1. 處理連續答對獎勵
    if (sr.streak > 0) {
      if (sr.streak % 10 === 0) {
        coinCount = 3; // 每 10 題給 3 顆
      } else if (sr.streak % 5 === 0) {
        coinCount = 1; // 每 5 題給 1 顆
      }
    }

    let timeoutId: NodeJS.Timeout;

    // 2. 處理滿級獎勵（若同時觸發，取最大值給獎勵即可，或依照你的需求疊加）
    if (sr.showMaxLevelReward) {
      coinCount = Math.max(coinCount, 3); // 滿級至少給 3 顆

      // 3 秒後自動隱藏 Confetti
      timeoutId = setTimeout(() => {
        sr.setShowMaxLevelReward(false);
      }, 3000);
    }

    if (coinCount > 0) {
      ; (window as any).testCoins?.(coinCount);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [sr.streak, sr.showMaxLevelReward, sr.setShowMaxLevelReward]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  if (sr.isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a] text-slate-400 text-2xl">
        同步雲端資料中...
      </div>
    );
  }

  const handleResetConfirm = async (password: string) => {
    if (password === '1234') {
      return true;
    } else {
      return false;
    }
  };

  return (
    <main
      className={`fixed inset-0 flex flex-col items-center ${showProgress ? 'overflow-y-auto' : 'overflow-hidden'
        }`}
    >
      {showProgress ? (
        <ProgressScreen store={sr.store} cards={cards} onClose={() => setShowProgress(false)} />
      ) : sr.isFinished ? (
        <ResultScreen stats={sr.stats} onRestart={sr.restart} />
      ) : (
        <StudySession sr={sr} onFinish={() => { }} />
      )}

      {/* Bottom Left Controls: Progress & Lesson Selector */}
      {!showProgress && (
        <div className="absolute bottom-6 left-6 flex items-center gap-4 z-50">
          {/* 📊 progress toggle */}
          <button
            onClick={() => setShowProgress(true)}
            aria-label="查看學習成果"
            className="w-11 h-11 rounded-full border border-white/[0.12] bg-primary/15 text-xl flex items-center justify-center transition-all duration-200 hover:bg-primary/30 hover:scale-110 cursor-pointer shrink-0"
          >
            📊
          </button>

          {/* Lesson selector */}
          <div className="flex gap-1">
            {(['1', '2', 'all'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLesson(l)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 cursor-pointer ${selectedLesson === l
                  ? 'bg-primary/40 border-primary/60 text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
              >
                {l === 'all' ? '全部' : `第${l === '1' ? '一' : '二'}課`}
              </button>
            ))}
          </div>
        </div>
      )}


      {/* Test & Debug buttons */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-[101]">
        <button
          onClick={() => (window as any).testCoins?.(1)}
          className="px-4 py-2 text-[0.8rem] bg-white/5 border border-white/10 rounded-lg text-[#a0a0a0] transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer whitespace-nowrap"
        >
          測試 1 顆金幣
        </button>
        <button
          onClick={() => (window as any).testCoins?.(3)}
          className="px-4 py-2 text-[0.8rem] bg-white/5 border border-white/10 rounded-lg text-[#a0a0a0] transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer whitespace-nowrap"
        >
          測試 3 顆金幣
        </button>
        <button
          onClick={() => {
            setShowTestConfetti(true);
            setTimeout(() => setShowTestConfetti(false), 8000);
          }}
          className="px-4 py-2 text-[0.8rem] bg-white/5 border border-white/10 rounded-lg text-[#a0a0a0] transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer whitespace-nowrap"
        >
          測試彩屑
        </button>
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 text-[0.8rem] bg-white/5 border border-white/10 rounded-lg text-[#a0a0a0] transition-all duration-200 hover:bg-white/10 hover:text-white cursor-pointer whitespace-nowrap"
        >
          重置
        </button>
      </div>

      {/* Reset Modal */}
      {showResetModal && (
        <ResetModal
          onClose={(didReset) => {
            setShowResetModal(false);
            if (didReset) {
              sr.resetData();
              setShowProgress(false); // Exit progress screen if open
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

      {(sr.showMaxLevelReward || showTestConfetti) && (
        <div className="pointer-events-none fixed inset-0 z-50">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.15}
          />
        </div>
      )}
    </main>
  );
}

export default App;
