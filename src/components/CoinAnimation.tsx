import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

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
      // 計算偏移量，讓多顆金幣一起出現時能有層次感（錯開位置）
      const offsetX = count > 1 ? (Math.random() - 0.5) * 40 : 0;
      const offsetY = count > 1 ? (i - (count - 1) / 2) * 50 : 0;
      return {
        id: Math.random().toString(),
        offsetX,
        offsetY,
        dropDelay: i * 0.15 // 依序掉落的延遲
      };
    });
    setCoins(prev => [...prev, ...newCoins]);
  }, []);

  const handleDropInBucket = useCallback(() => {
    // 播放音效
    try {
      const audio = new Audio('/pickupCoin.wav');
      audio.volume = 0.5;
      audio.play();
    } catch (e) {
      console.error("Audio play failed", e);
    }

    // 晃動桶子
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
