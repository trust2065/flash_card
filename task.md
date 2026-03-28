# Chinese Flashcard PWA - Task List

## Planning
- [x] Discuss learning approach with user
- [x] Confirm textbook (康軒) and lesson characters
- [x] Fetch pronunciation data from Moedict API
- [x] Find relevant skills (web-design-guidelines installed)
- [x] Write implementation plan
- [x] Get user approval

## Setup
- [x] Create Vite + React project
- [x] Install deps: framer-motion, vite-plugin-pwa, workbox-window
- [x] Configure as PWA (vite.config.ts done, icons TODO)
- [x] Set up project structure (src/data, src/hooks, src/components)

## Core Features - Lesson 1
- [x] `src/data/lesson1.ts` — 10 characters data
- [x] `src/hooks/useSpacedRepetition.ts` — bucket SR + Supabase Cloud
- [x] `src/components/FlashCard.tsx` — flip animation
  - [x] Front: large character (160px)
  - [x] Back: ㄅㄆㄇ phonetic + Web Speech API + example word
- [x] `src/components/StudySession.tsx` — progress bar + Know/Don't Know
- [x] `src/components/ResultScreen.tsx` — star animation + stats
- [x] `src/App.tsx` — state machine: study | result

## Design
- [x] `src/index.css` — design tokens, dark theme, typography
- [x] iPad touch-optimized (min 44px targets, large buttons)
- [x] Kid-friendly visual rewards

## PWA
- [x] vite.config.ts with VitePWA plugin
- [ ] public/icons/icon-192.png + icon-512.png

## Verification
- [ ] npm run dev — local smoke test
- [ ] Test PWA install + manifest
- [ ] Test Web Speech API
- [ ] Test on iPad Safari
