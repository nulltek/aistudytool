import type { CompletionRecord } from './firebase'

export type StreakDay = {
  key: string
  label: string
  dayNumber: number
  count: number
  isToday: boolean
}

export type StreakStats = {
  current: number
  longest: number
  todayCount: number
  activeDays: number
  totalCompletions: number
  calendar: StreakDay[]
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function calculateStreakStats(records: CompletionRecord[], now = new Date()): StreakStats {
  const counts = new Map<string, number>()

  records.forEach((record) => {
    const completedAt = record.completedAt?.toDate?.()
    if (!completedAt) return
    const key = dateKey(completedAt)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  })

  const today = startOfDay(now)
  const todayKey = dateKey(today)
  const yesterday = addDays(today, -1)
  let cursor = counts.has(todayKey) ? today : yesterday
  let current = 0

  while (counts.has(dateKey(cursor))) {
    current += 1
    cursor = addDays(cursor, -1)
  }

  const activeDates = [...counts.keys()].sort()
  let longest = 0
  let running = 0
  let previous: Date | null = null

  activeDates.forEach((key) => {
    const date = new Date(`${key}T12:00:00`)
    running = previous && dateKey(addDays(previous, 1)) === key ? running + 1 : 1
    longest = Math.max(longest, running)
    previous = date
  })

  const calendar = Array.from({ length: 28 }, (_, index) => {
    const date = addDays(today, index - 27)
    const key = dateKey(date)
    return {
      key,
      label: date.toLocaleDateString('en', { weekday: 'short' }),
      dayNumber: date.getDate(),
      count: counts.get(key) ?? 0,
      isToday: key === todayKey,
    }
  })

  return {
    current,
    longest,
    todayCount: counts.get(todayKey) ?? 0,
    activeDays: counts.size,
    totalCompletions: records.length,
    calendar,
  }
}
