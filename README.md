# Chinese Flashcard PWA (康軒一上)

**Live Demo & URL:** [https://flash-card-mu-ruddy.vercel.app/](https://flash-card-mu-ruddy.vercel.app/)

A Progressive Web Application (PWA) designed to help first-grade students learn Chinese characters using Spaced Repetition. Optimised for iPad and touch screens, featuring a kid-friendly UI, interactive flashcard animations, and cloud progress syncing.

Currently focused on Lesson 1 characters from the Kang Hsuan (康軒) textbook.

## ✨ Features

- **Spaced Repetition System (SRS)**: Employs a bucket-based spaced repetition algorithm to ensure optimal learning and retention.
- **PWA Ready**: Installable on iOS/iPadOS and Android directly from the browser for a native-like full-screen experience and offline capabilities.
- **iPad & Touch Optimised**: Large touch targets, intuitive swipe/tap gestures, and kid-friendly layout.
- **Cloud Sync**: Securely syncs learning progress using Supabase, so students can switch between devices without losing their data.
- **Text-to-Speech (TTS)**: Uses Web Speech API to read Chinese characters and examples aloud.
- **Interactive Animations**: Beautiful 3D card flip effects powered by Framer Motion. 
- **Bopomofo (Zhuyin) Support**: Displays standard Taiwanese phonetic symbols alongside characters.

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Backend / Database**: Supabase
- **PWA**: vite-plugin-pwa (Workbox)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Supabase account and project (for cloud sync)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd flash_card
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Duplicate the `.env sample` file (if provided) or create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(See `CLOUD_SETUP.md` for detailed Supabase configuration instructions)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

### Building for Production

To create a production build with PWA assets generated:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

## 📱 PWA Installation (iPad / iPhone)

1. Open the website in **Safari**.
2. Tap the **Share** button (box with an arrow pointing up).
3. Scroll down and tap **Add to Home Screen**.
4. The application will now appear on your home screen and run in full-screen mode like a native app.

## 🗂 Project Structure
- `src/components/`: Reusable UI components (`FlashCard`, `StudySession`, `ResultScreen`, etc.)
- `src/hooks/`: Custom React hooks, including `useSpacedRepetition` for SRS logic and Supabase sync.
- `src/data/`: Static data for lessons (e.g., `lesson1.ts` containing the vocabulary list).
- `public/`: Static assets, including PWA icons.

## 📝 License
This project is for educational purposes.
