# Chinese Flashcard PWA — Lesson 1 (康軒一上第一課)

學小一康軒生字的 PWA，iPad 最佳化。第一步先完成第一課核心功能。

## Proposed Changes

### Setup

#### [NEW] `chinese-flashcard/` project in [/Users/chocoli/.gemini/antigravity/scratch/](file:///Users/chocoli/.gemini/antigravity/scratch)

用 Vite + React + TypeScript scaffold：

```
npx create-vite@latest chinese-flashcard --template react-ts
```

Dependencies:
- `vite-plugin-pwa` — PWA manifest + service worker
- `framer-motion` — 翻牌 3D 動畫

---

### Data Layer

#### [NEW] `src/data/lesson1.ts`

Static data，不需要 API call：

```ts
export const lesson1 = [
  { char: '拍', zhuyin: 'ㄆㄞ', pinyin: 'pāi', example: '拍手', meaning: '用手掌輕打' },
  { char: '手', zhuyin: 'ㄕㄡˇ', pinyin: 'shǒu', example: '右手', meaning: '人體的上肢' },
  { char: '左', zhuyin: 'ㄗㄨㄛˇ', pinyin: 'zuǒ', example: '左手', meaning: '方向，與右相對' },
  { char: '右', zhuyin: 'ㄧㄡˋ', pinyin: 'yòu', example: '右手', meaning: '方向，與左相對' },
  { char: '你', zhuyin: 'ㄋㄧˇ', pinyin: 'nǐ', example: '你好', meaning: '第二人稱' },
  { char: '他', zhuyin: 'ㄊㄚ', pinyin: 'tā', example: '他們', meaning: '第三人稱' },
  { char: '也', zhuyin: 'ㄧㄝˇ', pinyin: 'yě', example: '也好', meaning: '同樣、也是' },
  { char: '上', zhuyin: 'ㄕㄤˋ', pinyin: 'shàng', example: '上面', meaning: '與下相對' },
  { char: '下', zhuyin: 'ㄒㄧㄚˋ', pinyin: 'xià', example: '下面', meaning: '與上相對' },
  { char: '拍手', zhuyin: 'ㄆㄞ ㄕㄡˇ', pinyin: 'pāi shǒu', example: '大家拍手', meaning: '用兩手互擊' },
]
```

#### [NEW] `src/hooks/useSpacedRepetition.ts`

Bucket system（最簡單的 SR）：
- 每張牌有 `bucket: 0-4`，bucket 越高出現越少
- 認識 → bucket +1，不認識 → bucket = 0
- Persist to `localStorage`

---

### Components

#### [NEW] `src/components/FlashCard.tsx`

- 正面：大字（字形），字體 `160px`
- 背面：注音 + 讀音按鈕（Web Speech API）+ 詞語例子
- Framer Motion `rotateY` 翻牌動畫

#### [NEW] `src/components/StudySession.tsx`

- 從 SR hook 挑出要練習的字
- 顯示進度條
- 認識 / 不認識兩個大按鈕（touch 友善）

#### [NEW] `src/components/ResultScreen.tsx`

- 完成時：星星動畫 + 今日統計

#### [NEW] `src/App.tsx`

單頁，state 控制：`study | result`

---

### PWA Config

#### [NEW] `vite.config.ts`

加入 `vite-plugin-pwa`：
- `manifest`: 中文名稱、icon、`display: standalone`
- `workbox`: offline cache

#### [NEW] `public/icons/`

生成 192x192 跟 512x512 icon（簡單中文字圖）

---

## Verification Plan

### Dev Server
```bash
cd /Users/chocoli/.gemini/antigravity/scratch/chinese-flashcard
npm run dev
```
在瀏覽器 localhost:3000 確認：
1. 翻牌動畫是否正常
2. Web Speech API 讀音是否正確（注意發「拍手」要用中文 voice）
3. SR 邏輯：認識/不認識後下一張是否正確

### iPad 測試（手動）
1. iPhone/iPad Safari → 前往 local IP（需同一網路）
2. 分享 → 加入主畫面
3. 確認全螢幕開啟、按鈕大小適合手指點擊
4. 確認 Web Speech 在 Safari 有聲音

### PWA Build
```bash
npm run build && npm run preview
```
確認 manifest 正確、service worker 有 register
