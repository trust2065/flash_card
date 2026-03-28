import { useState, useCallback, useEffect } from 'react'
import { lesson1, type Character } from '../data/lesson1'
import { supabase } from '../lib/supabase'

// Bucket system: 0-4, higher = appears less frequently
const BUCKET_WEIGHTS = [8, 4, 2, 1, 1]
const MAX_BUCKET = 4
const USER_ID = 'default-kid'
const STORAGE_KEY = 'flashcard-sr-v1'

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

function loadLocalStore(): SRStore {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveLocalStore(store: SRStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function buildQueue(store: SRStore): Character[] {
  const queue: Character[] = []
  for (const card of lesson1) {
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

export function useSpacedRepetition() {
  // Only show loading spinner if cloud is configured
  const [isLoading, setIsLoading] = useState(isCloudEnabled)
  const [store, setStore] = useState<SRStore>(() => (isCloudEnabled ? {} : loadLocalStore()))
  const [queue, setQueue] = useState<Character[]>(() =>
    isCloudEnabled ? [] : buildQueue(loadLocalStore()),
  )
  const [index, setIndex] = useState(0)
  const [stats, setStats] = useState<SRStats>({ known: 0, unknown: 0, total: 0 })

  const loadFromCloud = useCallback(async () => {
    if (!supabase) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('flashcard_progress')
        .select('char, bucket, last_seen')
        .eq('user_id', USER_ID)

      if (error) throw error

      const nextStore: SRStore = {}
      ;(data as unknown as ProgressRow[])?.forEach((row) => {
        nextStore[row.char] = {
          bucket: row.bucket,
          lastSeen: new Date(row.last_seen).getTime(),
        }
      })

      setStore(nextStore)
      setQueue(buildQueue(nextStore))
    } catch (err) {
      console.warn('Cloud load failed, falling back to localStorage:', err)
      const local = loadLocalStore()
      setStore(local)
      setQueue(buildQueue(local))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isCloudEnabled) {
      loadFromCloud()
    }
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

      if (supabase) {
        try {
          await supabase.from('flashcard_progress').upsert(
            {
              user_id: USER_ID,
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
      saveLocalStore(nextStore)
      setStore(nextStore)

      setStats((prev) => ({
        known: prev.known + (known ? 1 : 0),
        unknown: prev.unknown + (known ? 0 : 1),
        total: prev.total + 1,
      }))

      setIndex((i) => i + 1)
    },
    [current, store],
  )

  const restart = useCallback(() => {
    setQueue(buildQueue(store))
    setIndex(0)
    setStats({ known: 0, unknown: 0, total: 0 })
  }, [store])

  const resetData = useCallback(async () => {
    if (supabase) {
      try {
        await supabase.from('flashcard_progress').delete().eq('user_id', USER_ID)
      } catch (err) {
        console.warn('Cloud reset failed:', err)
      }
    }
    localStorage.removeItem(STORAGE_KEY)
    setStore({})
    setQueue(buildQueue({}))
    setIndex(0)
    setStats({ known: 0, unknown: 0, total: 0 })
  }, [])

  const getBucket = useCallback((char: string) => store[char]?.bucket ?? 0, [store])

  return {
    isLoading,
    current,
    isFinished,
    stats,
    store,
    answer,
    restart,
    resetData,
    getBucket,
    queueLength: queue.length,
  }
}
