import { useState, useCallback } from 'react'
import { lesson1, type Character } from '../data/lesson1'

// Bucket system: 0-4, higher = appears less frequently
// Weights: bucket 0 = 8x, 1 = 4x, 2 = 2x, 3 = 1x, 4 = 0.5x (every other session)
const BUCKET_WEIGHTS = [8, 4, 2, 1, 1]
const MAX_BUCKET = 4
const STORAGE_KEY = 'flashcard-sr-v1'

interface CardState {
  bucket: number
  lastSeen: number // timestamp
}

type SRStore = Record<string, CardState>

function loadStore(): SRStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveStore(store: SRStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function buildQueue(store: SRStore): Character[] {
  // Expand deck based on bucket weights
  const queue: Character[] = []
  for (const card of lesson1) {
    const state = store[card.char] ?? { bucket: 0, lastSeen: 0 }
    // Bucket 4 only appears every other session (skip if lastSeen within 12h)
    if (state.bucket === MAX_BUCKET) {
      const hoursAgo = (Date.now() - state.lastSeen) / 3_600_000
      if (hoursAgo < 12) continue
    }
    const weight = BUCKET_WEIGHTS[state.bucket]
    for (let i = 0; i < weight; i++) queue.push(card)
  }
  // Fisher-Yates shuffle
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[queue[i], queue[j]] = [queue[j], queue[i]]
  }
  // Cap session at 20 cards
  return queue.slice(0, 20)
}

export interface SRStats {
  known: number
  unknown: number
  total: number
}

export function useSpacedRepetition() {
  const [store, setStore] = useState<SRStore>(loadStore)
  const [queue, setQueue] = useState<Character[]>(() => buildQueue(loadStore()))
  const [index, setIndex] = useState(0)
  const [stats, setStats] = useState<SRStats>({ known: 0, unknown: 0, total: 0 })

  const current = queue[index] ?? null
  const isFinished = index >= queue.length

  const answer = useCallback(
    (known: boolean) => {
      if (!current) return

      setStore((prev) => {
        const state = prev[current.char] ?? { bucket: 0, lastSeen: 0 }
        const newBucket = known
          ? Math.min(state.bucket + 1, MAX_BUCKET)
          : 0
        const next = { ...prev, [current.char]: { bucket: newBucket, lastSeen: Date.now() } }
        saveStore(next)
        return next
      })

      setStats((prev) => ({
        known: prev.known + (known ? 1 : 0),
        unknown: prev.unknown + (known ? 0 : 1),
        total: prev.total + 1,
      }))

      setIndex((i) => i + 1)
    },
    [current],
  )

  const restart = useCallback(() => {
    const freshStore = loadStore()
    setQueue(buildQueue(freshStore))
    setIndex(0)
    setStats({ known: 0, unknown: 0, total: 0 })
  }, [])

  const getBucket = useCallback(
    (char: string) => (store[char]?.bucket ?? 0),
    [store],
  )

  return { current, isFinished, stats, answer, restart, getBucket, queueLength: queue.length }
}
