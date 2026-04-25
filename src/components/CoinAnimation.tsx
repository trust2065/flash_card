import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

// 使用 Web Audio API 來達成零延遲、完美的重疊播放
let audioCtx: AudioContext | null = null;
let coinBuffer: AudioBuffer | null = null;
let fetchPromise: Promise<void> | null = null;

// 必須在用戶手勢事件（touchstart/click）的同步堆疊裡呼叫，iOS 才允許播音
export function resumeAudioContext() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume(); // 必須同步，不能 await！
  }
  // 順便觸發預載，這樣之後播放才是真正零延遲
  initCoinAudio();
}

// 預先載入音檔
export async function initCoinAudio() {
  if (typeof window === 'undefined') return;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  if (!coinBuffer) {
    if (!fetchPromise) {
      fetchPromise = (async () => {
        try {
          const response = await fetch('/coin_new.wav');
          const arrayBuffer = await response.arrayBuffer();
          coinBuffer = await audioCtx!.decodeAudioData(arrayBuffer);
        } catch (e) {
          console.error("Failed to load audio", e);
        }
      })();
    }
    await fetchPromise;
  }
}

async function playCoinSound() {
  if (typeof window === 'undefined') return;

  // 確保初始化完成且如果被 suspend 則喚醒
  await initCoinAudio();

  if (!coinBuffer || !audioCtx) return;

  const source = audioCtx.createBufferSource();
  source.buffer = coinBuffer;
  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 0.5;

  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start(0);
}

interface Coin {
  id: string;
  offsetX: number;
  offsetY: number;
  dropDelay: number;
}

function SingleCoin({
  coin,
  onComplete,
  onDropInBucket
}: {
  coin: Coin;
  onComplete: (id: string) => void;
  onDropInBucket: () => void;
}) {
  const controls = useAnimation();

  useEffect(() => {
    let isMounted = true;
    const runAnimation = async () => {
      // 起點：畫面右側外面，加上偏移量
      const startX = window.innerWidth + 50;
      const startY = window.innerHeight * 0.4 + coin.offsetY;

      // 出現位置：畫面右側中間，加上偏移量
      const midX = window.innerWidth - 120 + coin.offsetX;
      const midY = window.innerHeight * 0.4 + coin.offsetY;

      // 終點：桶子的位置
      const bucketX = window.innerWidth - 64;
      const bucketY = window.innerHeight - 30;
      const bucketWidth = 64;

      // 1. 從右邊中間滑入，發光並自轉
      await controls.start({
        x: [startX, midX, midX, midX],
        y: [startY, midY, midY, midY],
        rotateY: [0, 360, 720, 1080],
        scale: [0.5, 1.2, 1.2, 1],
        boxShadow: [
          'inset 0 0 8px rgba(218, 165, 32, 0.8), 0 4px 6px rgba(0,0,0,0.3)',
          'inset 0 0 15px rgba(255, 215, 0, 1), 0 0 20px 10px rgba(255, 215, 0, 0.6)',
          'inset 0 0 15px rgba(255, 215, 0, 1), 0 0 30px 15px rgba(255, 215, 0, 0.8)',
          'inset 0 0 8px rgba(218, 165, 32, 0.8), 0 4px 6px rgba(0,0,0,0.3)',
        ],
        transition: { duration: 1.5, ease: "easeOut" }
      });

      if (!isMounted) return;

      // 稍微等待，讓每顆金幣依序掉入桶子
      if (coin.dropDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, coin.dropDelay * 1000));
      }

      if (!isMounted) return;

      // 2. 收進右下角的袋子
      await controls.start({
        x: bucketX - (bucketWidth / 2),
        y: bucketY,
        scale: 0.3,
        opacity: 0,
        rotate: 360, // 掉落時隨便轉一下
        transition: { duration: 0.5, ease: "easeIn" }
      });

      if (!isMounted) return;
      onDropInBucket(); // 播放音效與晃動桶子

      onComplete(coin.id);
    };

    runAnimation();
    return () => { isMounted = false; };
  }, [coin.id, coin.offsetX, coin.offsetY, coin.dropDelay, controls, onComplete, onDropInBucket]);

  return (
    <motion.div
      animate={controls}
      initial={{ y: window.innerHeight * 0.4 + coin.offsetY, x: window.innerWidth + 50 }}
      className="absolute w-10 h-10 rounded-full flex items-center justify-center font-bold text-[#b8860b] z-[95]"
      style={{
        background: 'radial-gradient(circle at 30% 30%, #ffd700, #d4af37)',
        border: '2px solid #b8860b',
        boxShadow: 'inset 0 0 8px rgba(218, 165, 32, 0.8), 0 4px 6px rgba(0,0,0,0.3)',
        textShadow: '1px 1px 0px rgba(255,255,255,0.6)',
      }}
    >
      $
    </motion.div>
  );
}

export function CoinAnimation() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [bucketShake, setBucketShake] = useState(false);

  const addCoins = useCallback((count: number) => {
    const newCoins = Array.from({ length: count }).map((_, i) => {
      const offsetX = count > 1 ? (Math.random() - 0.5) * 40 : 0;
      const offsetY = count > 1 ? (i - (count - 1) / 2) * 50 : 0;
      return {
        id: Math.random().toString(),
        offsetX,
        offsetY,
        dropDelay: i * 0.1
      };
    });
    setCoins(prev => [...prev, ...newCoins]);

    // 音效在這裡直接排程，不依賴動畫 callback
    // 滑入 1.5s + 各自 dropDelay (i*0.1s) + 掉落動畫 0.5s
    newCoins.forEach((_, i) => {
      const delay = 1500 + i * 200 + 500;
      setTimeout(() => {
        playCoinSound();
        setBucketShake(true);
        setTimeout(() => setBucketShake(false), 200);
      }, delay);
    });
  }, []);

  // onDropInBucket 不再播音效，只需晃桶子（音效由 addCoins 排程）
  const handleDropInBucket = useCallback(() => {
    setBucketShake(true);
    setTimeout(() => setBucketShake(false), 200);
  }, []);

  // 為了手動測試，把 addCoins 綁在 window 上
  useEffect(() => {
    ; (window as any).testCoins = addCoins;
    return () => {
      delete (window as any).testCoins;
    };
  }, [addCoins]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {coins.map((coin) => (
          <SingleCoin
            key={coin.id}
            coin={coin}
            onComplete={(id) => setCoins(prev => prev.filter(c => c.id !== id))}
            onDropInBucket={handleDropInBucket}
          />
        ))}

        {/* 存金幣的桶子 */}
        <motion.div
          className="absolute bottom-0 right-8 w-16 h-16 bg-[#8b4513] rounded-b-xl border-t-4 border-[#5c2e0b] z-[90] flex items-center justify-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)] origin-bottom"
          animate={bucketShake ? { rotate: [-5, 5, -5, 5, 0], y: [0, 5, 0] } : {}}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute -top-2 left-0 w-full h-4 bg-[#3a1d07] rounded-full"></div>
          <span className="text-2xl opacity-60 relative z-10 mt-2">💰</span>
        </motion.div>
      </div>

      {/* 測試用按鈕 */}
      <div className="fixed top-4 left-4 z-[101] flex gap-2">
        <button
          onClick={() => addCoins(1)}
          className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20 text-white cursor-pointer"
        >
          測試 1 顆
        </button>
        <button
          onClick={() => addCoins(3)}
          className="px-3 py-1 bg-white/10 rounded text-sm hover:bg-white/20 text-white cursor-pointer"
        >
          測試 3 顆
        </button>
      </div>
    </>
  );
}
