export type Rank = {
  name: string
  family: string
  division: 'V' | 'IV' | 'III' | 'II' | 'I'
  minLevel: number
  tone: string
}

export type RankFamily = {
  name: string
  tone: string
  ranks: Rank[]
}

const divisions: Rank['division'][] = ['V', 'IV', 'III', 'II', 'I']

const minerals = [
  { name: 'Bronze', tone: '#a8673a' },
  { name: 'Silver', tone: '#8c969f' },
  { name: 'Gold', tone: '#c39220' },
  { name: 'Platinum', tone: '#5c8290' },
  { name: 'Emerald', tone: '#16845f' },
  { name: 'Sapphire', tone: '#3966c5' },
  { name: 'Ruby', tone: '#b43952' },
  { name: 'Diamond', tone: '#6659cf' },
]

export const rankFamilies: RankFamily[] = minerals.map((mineral, familyIndex) => ({
  ...mineral,
  ranks: divisions.map((division, divisionIndex) => ({
    name: `${mineral.name} ${division}`,
    family: mineral.name,
    division,
    minLevel: familyIndex * divisions.length + divisionIndex + 1,
    tone: mineral.tone,
  })),
}))

export const ranks = rankFamilies.flatMap((family) => family.ranks)

export function xpForLevel(level: number) {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

export function levelFromXp(xp: number) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level += 1
  return level
}

export function rankFromLevel(level: number) {
  return [...ranks].reverse().find((rank) => level >= rank.minLevel) ?? ranks[0]
}

export function progressFromXp(xp: number) {
  const level = levelFromXp(xp)
  const floor = xpForLevel(level)
  const ceiling = xpForLevel(level + 1)
  const current = xp - floor
  const needed = ceiling - floor
  return {
    level,
    rank: rankFromLevel(level),
    current,
    needed,
    percent: Math.min(100, Math.max(0, (current / needed) * 100)),
  }
}
