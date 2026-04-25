import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface Coin {
  id: string;
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
      // 隨機決定掉落的 X 軸起點 (螢幕寬度的 20% 到 80% 之間)
      const startX = window.innerWidth * 0.2;
      // 地板的高度 (大約在畫面底部上方 80px)
      const groundY = window.innerHeight - 80;

      // 1. 從天而降 & 彈跳
      await controls.start({
        y: [-window.innerHeight, groundY, groundY - 150, groundY, groundY - 50, groundY],
        x: startX,
        transition: { duration: 1.2, times: [0, 0.4, 0.6, 0.8, 0.9, 1], ease: "easeOut" }
      });

      if (!isMounted) return;

      // 2. 滾到桶子裡 (桶子在右下角)
      const bucketX = window.innerWidth - 64; // 預估桶子中心的 X 座標
      await controls.start({
        x: bucketX,
        rotate: 360 * 3, // 滾動三圈
        transition: { duration: 1, ease: "easeInOut" }
      });

      if (!isMounted) return;

      // 3. 掉進桶子
      onDropInBucket(); // 播放音效與晃動桶子
      await controls.start({
        y: groundY + 50,
        scale: 0.5,
        opacity: 0,
        transition: { duration: 0.2 }
      });

      if (!isMounted) return;
      onComplete(coin.id);
    };

    runAnimation();
    return () => { isMounted = false; };
  }, [coin.id, controls, onComplete, onDropInBucket]);

  return (
    <motion.div
      animate={controls}
      initial={{ y: -window.innerHeight, x: -500 }}
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
    let delay = 0;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        setCoins(prev => [...prev, { id: Math.random().toString() }]);
      }, delay);
      delay += 400; // 每顆金幣間隔拉長一點，讓他們依序掉落
    }
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
