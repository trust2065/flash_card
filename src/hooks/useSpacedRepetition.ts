import { useState, useCallback, useEffect } from 'react'
import type { Character } from '../data/lesson1'
import { supabase } from '../lib/supabase'

// Bucket system: 0-4, higher = appears less frequently
const BUCKET_WEIGHTS = [8, 4, 2, 1, 1]
const MAX_BUCKET = 4
const STORAGE_KEY_PREFIX = 'flashcard-sr-v1'

function getStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}-${userId}`
}

interface CardState {
  bucket: number
  lastSeen: number
}

export type SRStore = Record<string, CardState>

interface ProgressRow {
  char: string
  bucket: number
  last_seen: string
}

function loadLocalStore(userId: string): SRStore {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(userId)) ?? '{}')
  } catch {
    return {}
  }
}

function saveLocalStore(userId: string, store: SRStore) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(store))
}

function buildQueue(store: SRStore, cards: Character[]): Character[] {
  const queue: Character[] = []
  for (const card of cards) {
    const state = store[card.char] ?? { bucket: 0, lastSeen: 0 }
    if (state.bucket === MAX_BUCKET) {
      const hoursAgo = (Date.now() - state.lastSeen) / 3_600_000
      if (hoursAgo < 12) continue
    }
    const weight = BUCKET_WEIGHTS[state.bucket]
    for (let i = 0; i < weight; i++) queue.push(card)
  }
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[queue[i], queue[j]] = [queue[j], queue[i]]
  }
  return queue.slice(0, 20)
}

export interface SRStats {
  known: number
  unknown: number
  total: number
}

const isCloudEnabled = supabase !== null

export function useSpacedRepetition(userId: string, cards: Character[]) {
  // Only show loading spinner if cloud is configured
  const [isLoading, setIsLoading] = useState(isCloudEnabled)
  const [store, setStore] = useState<SRStore>(() => (isCloudEnabled ? {} : loadLocalStore(userId)))
  const [queue, setQueue] = useState<Character[]>(() =>
    isCloudEnabled ? [] : buildQueue(loadLocalStore(userId), cards),
  )
  const [index, setIndex] = useState(0)
  const [stats, setStats] = useState<SRStats>({ known: 0, unknown: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const [showMaxLevelReward, setShowMaxLevelReward] = useState(false)

  // 當 userId 改變時，重新初始化
  useEffect(() => {
    setIndex(0)
    setStats({ known: 0, unknown: 0, total: 0 })
    setStreak(0)
    setShowMaxLevelReward(false)
    
    if (isCloudEnabled) {
      loadFromCloud(true)
    } else {
      const local = loadLocalStore(userId)
      setStore(local)
      setQueue(buildQueue(local, cards))
    }
  }, [userId, cards])

  const loadFromCloud = useCallback(async (rebuildQueue: boolean = false) => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('char, bucket, last_seen')
        .eq('user_id', userId)

      if (error) throw error

      const nextStore: SRStore = {}
      ;(data as unknown as ProgressRow[])?.forEach((row) => {
        nextStore[row.char] = {
          bucket: row.bucket,
          lastSeen: new Date(row.last_seen).getTime(),
        }
      })

      setStore(nextStore)
      if (rebuildQueue) {
        setQueue(buildQueue(nextStore, cards))
      }
    } catch (err) {
      console.warn('Cloud load failed, falling back to localStorage:', err)
      const local = loadLocalStore(userId)
      setStore(local)
      if (rebuildQueue) {
        setQueue(buildQueue(local, cards))
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, cards])

  useEffect(() => {
    if (!isCloudEnabled) return

    loadFromCloud(true) // Initial load should build the queue

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadFromCloud(false) // Background sync shouldn't disrupt active session
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadFromCloud])

  const current = queue[index] ?? null
  // Only finished if queue actually has cards and we've gone through them all
  const isFinished = !isLoading && queue.length > 0 && index >= queue.length

  const answer = useCallback(
    async (known: boolean) => {
      if (!current) return

      const state = store[current.char] ?? { bucket: 0, lastSeen: 0 }
      const newBucket = known ? Math.min(state.bucket + 1, MAX_BUCKET) : 0
      const lastSeen = Date.now()

      if (known) {
        setStreak((s) => s + 1)
        if (state.bucket < MAX_BUCKET && newBucket === MAX_BUCKET) {
          setShowMaxLevelReward(true)
        } else {
          setShowMaxLevelReward(false)
        }
      } else {
        setStreak(0)
        setShowMaxLevelReward(false)
      }

      if (supabase) {
        try {
          await supabase.from('flashcard_progress').upsert(
            {
              user_id: userId,
              char: current.char,
              bucket: newBucket,
              last_seen: new Date(lastSeen).toISOString(),
            },
            { onConflict: 'user_id,char' },
          )
        } catch (err) {
          console.warn('Cloud save failed, saving locally:', err)
        }
      }

      // Always write to localStorage as a backup / offline cache
      const nextStore = { ...store, [current.char]: { bucket: newBucket, lastSeen } }
      saveLocalStore(userId, nextStore)
      setStore(nextStore)

      setStats((prev) => ({
        known: prev.known + (known ? 1 : 0),
        unknown: prev.unknown + (known ? 0 : 1),
        total: prev.total + 1,
      }))

      setIndex((i) => i + 1)
    },
    [current, store, userId],
  )

  const restart = useCallback(() => {
    setQueue(buildQueue(store, cards))
    setIndex(0)
    setStats({ known: 0, unknown: 0, total: 0 })
    setStreak(0)
    setShowMaxLevelReward(false)
  }, [store, cards])

  const resetData = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.from('flashcard_progress').delete().eq('user_id', userId)
      } catch (err) {
        console.warn('Cloud reset failed:', err)
      }
    }
    localStorage.removeItem(getStorageKey(userId))
    setStore({})
    setQueue(buildQueue({}, cards))
    setIndex(0)
    setStats({ known: 0, unknown: 0, total: 0 })
    setStreak(0)
    setShowMaxLevelReward(false)
  }, [cards])

  const getBucket = useCallback((char: string) => store[char]?.bucket ?? 0, [store])

  return {
    isLoading,
    current,
    isFinished,
    stats,
    store,
    streak,
    showMaxLevelReward,
    setShowMaxLevelReward,
    answer,
    restart,
    resetData,
    getBucket,
    queueLength: queue.length,
    syncFromCloud: loadFromCloud,
  }
}
