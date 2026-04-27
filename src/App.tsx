/// <reference types="vite-plugin-pwa/client" />
import { useState, useEffect, useRef } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { StudySession } from './components/StudySession';
import { ResultScreen } from './components/ResultScreen';
import { ProgressScreen } from './components/ProgressScreen';
import { ResetModal } from './components/ResetModal';
import { SettingsModal } from './components/SettingsModal';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import { CoinAnimation } from './components/CoinAnimation';
import { UserSelection, USERS, type User } from './components/UserSelection';
import { lesson1 } from './data/lesson1';
import { lesson2 } from './data/lesson2';

function App() {
  const { width, height } = useWindowSize();
  const [selectedLesson, setSelectedLesson] = useState<'1' | '2' | 'all'>('1');
  const [rewardIcon, setRewardIcon] = useState<'coin' | 'chicken'>(() => {
    return (localStorage.getItem('flashcard-reward-icon') as 'coin' | 'chicken') || 'chicken';
  });

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        setInterval(() => {
          r.update()
        }, 60 * 60 * 1000) // 每小時檢查更新
      }
    }
  });

  const cards =
    selectedLesson === '1' ? lesson1
      : selectedLesson === '2' ? lesson2
        : [...lesson1, ...lesson2];

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('flashcard-current-user');
    return USERS.find((u) => u.id === savedId) || null;
  });

  const sr = useSpacedRepetition(currentUser?.id || 'default-kid', cards);
  const [showProgress, setShowProgress] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTestConfetti, setShowTestConfetti] = useState(false);

  const handleCheckUpdate = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        alert('檢查完畢！\n如果有新版本，畫面上方會跳出「發現新版本」的提示。\n如果沒有跳出提示，代表目前已是最新版本。');
      } catch (err) {
        console.error('更新檢查失敗:', err);
        alert('檢查更新失敗，請稍後再試。');
      }
    } else {
      alert('此瀏覽器環境不支援更新檢查。');
    }
  };

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


  const lastRewardedStreakRef = useRef(0);

  // 監聽連續答對與升級狀態來觸發金幣動畫
  useEffect(() => {
    let coinCount = 0;

    // 1. 處理連續答對獎勵
    if (sr.streak > 0 && sr.streak !== lastRewardedStreakRef.current) {
      if (sr.streak % 10 === 0) {
        coinCount = 3; // 每 10 題給 3 顆
      } else if (sr.streak % 5 === 0) {
        coinCount = 1; // 每 5 題給 1 顆
      }
      lastRewardedStreakRef.current = sr.streak;
    } else if (sr.streak === 0) {
      lastRewardedStreakRef.current = 0;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    // 2. 處理滿級獎勵（僅放彩屑，不再發放金幣避免與連續答對混淆）
    if (sr.showMaxLevelReward) {
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

  const handleResetConfirm = async (password: string) => {
    if (password === '1234') {
      return true;
    } else {
      return false;
    }
  };

  if (!currentUser) {
    return (
      <UserSelection
        onSelect={(user) => {
          localStorage.setItem('flashcard-current-user', user.id);
          setCurrentUser(user);
        }}
      />
    );
  }

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

      {/* Bottom Left Controls: Settings Toggle */}
      {!showProgress && (
        <div className="absolute bottom-6 left-6 flex items-center gap-4 z-50">
          <button
            onClick={() => setShowSettingsModal(true)}
            aria-label="開啟設定"
            className="w-12 h-12 rounded-full border border-white/[0.12] bg-slate-800/80 backdrop-blur-sm text-2xl flex items-center justify-center transition-all duration-200 hover:bg-slate-700 hover:scale-110 cursor-pointer shadow-lg shadow-black/20"
          >
            ⚙️
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onSwitchUser={() => {
            localStorage.removeItem('flashcard-current-user');
            setCurrentUser(null);
          }}
          onShowProgress={() => setShowProgress(true)}
          selectedLesson={selectedLesson}
          onSelectLesson={setSelectedLesson}
          onCheckUpdate={handleCheckUpdate}
          onSyncCloud={sr.syncFromCloud}
          rewardIcon={rewardIcon}
          onSelectReward={(r) => {
            setRewardIcon(r);
            localStorage.setItem('flashcard-reward-icon', r);
          }}
        />
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
      <CoinAnimation type={rewardIcon} />

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

      {/* PWA Update Prompt */}
      {needRefresh && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] flex flex-col items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-sm font-medium">🌟 發現新版本！</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                updateServiceWorker(true);
                setTimeout(() => window.location.reload(), 1000);
              }}
              className="bg-primary/80 hover:bg-primary px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              立刻更新
            </button>
            <button
              onClick={() => setNeedRefresh(false)}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm transition-all"
            >
              稍後
            </button>
          </div>
        </div>
      )}

      {sr.isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-sm text-slate-400 text-2xl z-[999]">
          同步雲端資料中...
        </div>
      )}
    </main>
  );
}

export default App;
