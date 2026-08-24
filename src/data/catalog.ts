export interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

export const BADGES: Record<string, Badge> = {
  'firewall-breaker': {
    id: 'firewall-breaker',
    name: 'Firewall Breaker',
    description: 'Secured the Firewall Vault against an active breach.',
    icon: '\u{1F525}',
  },
  'threat-hunter': {
    id: 'threat-hunter',
    name: 'Threat Hunter',
    description: 'Swept the Security Center clean of threats.',
    icon: '\u{1F6E1}️',
  },
  'treasure-hunter': {
    id: 'treasure-hunter',
    name: 'Treasure Hunter',
    description: 'Discovered the rewards hidden in the Secret Grotto.',
    icon: '\u{1F48E}',
  },
  'rising-star': {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Reached Level 5.',
    icon: '⭐',
  },
  'cyber-scholar': {
    id: 'cyber-scholar',
    name: 'Cyber Scholar',
    description: 'Reached Level 20 and unlocked Cisco School.',
    icon: '\u{1F393}',
  },
}

export interface Item {
  id: string
  name: string
  description: string
  icon: string
}

export const ITEMS: Record<string, Item> = {
  'vault-key': {
    id: 'vault-key',
    name: 'Vault Key',
    description: 'A key recovered from the Firewall Vault breach.',
    icon: '\u{1F511}',
  },
  'access-badge': {
    id: 'access-badge',
    name: 'Access Badge',
    description: 'Grants elevated clearance at the Security Center.',
    icon: '\u{1F4B3}',
  },
  'grotto-gem': {
    id: 'grotto-gem',
    name: 'Grotto Gem',
    description: 'A shimmering gem found deep in the Secret Grotto.',
    icon: '\u{1F48E}',
  },
}

export function xpForLevel(level: number): number {
  let total = 0
  for (let l = 1; l < level; l++) total += 250 + (l - 1) * 100
  return total
}

export function levelForXp(totalXp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= totalXp) level++
  return level
}

export interface LeaderboardEntry {
  name: string
  xp: number
  isPlayer?: boolean
}

export const NPC_LEADERBOARD: { name: string; xp: number }[] = [
  { name: 'Aiden K.', xp: 4200 },
  { name: 'Priya S.', xp: 3100 },
  { name: 'Marcus T.', xp: 2650 },
  { name: 'Yuki H.', xp: 1800 },
  { name: 'Zara M.', xp: 900 },
  { name: 'Leo P.', xp: 420 },
]
