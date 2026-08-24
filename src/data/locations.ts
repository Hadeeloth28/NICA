export type LocationId =
  | 'start'
  | 'cafe'
  | 'cisco'
  | 'firewall'
  | 'security'
  | 'grotto'
  | 'lab'

export type LocationTheme = 'amber' | 'blue' | 'red' | 'purple' | 'pink' | 'teal'

export interface LocationNode {
  id: LocationId
  name: string
  subtitle: string
  x: number // percent
  y: number // percent
  icon: string
  lockLevel: number // 0 = never level-locked
  secret?: boolean
  description: string
  theme: LocationTheme
}

export const LOCATIONS: Record<LocationId, LocationNode> = {
  start: {
    id: 'start',
    name: 'Trailhead',
    subtitle: 'Your starting point',
    x: 50,
    y: 76,
    icon: '\u{1F4CD}',
    lockLevel: 0,
    description: 'Where every recruit begins their journey through Levanta.',
    theme: 'teal',
  },
  cafe: {
    id: 'cafe',
    name: 'Student Cafe',
    subtitle: 'Meet. Chat. Relax.',
    x: 50,
    y: 50,
    icon: '☕',
    lockLevel: 0,
    description: 'The social hub of the academy. Grab a coffee and catch up with Sophia AI.',
    theme: 'amber',
  },
  cisco: {
    id: 'cisco',
    name: 'Cisco School',
    subtitle: 'Advanced networking academy',
    x: 18,
    y: 15,
    icon: '\u{1F393}',
    lockLevel: 20,
    description: 'Advanced coursework on networking and infrastructure defense.',
    theme: 'blue',
  },
  firewall: {
    id: 'firewall',
    name: 'Firewall Vault',
    subtitle: 'Level 12+ recommended',
    x: 80,
    y: 18,
    icon: '\u{1F525}',
    lockLevel: 0,
    description: 'A fortified vault under active attack. Analysts are needed immediately.',
    theme: 'red',
  },
  security: {
    id: 'security',
    name: 'Security Center',
    subtitle: 'Level 30 clearance',
    x: 78,
    y: 58,
    icon: '\u{1F6E1}️',
    lockLevel: 30,
    description: 'Central command for monitoring threats across the whole academy network.',
    theme: 'purple',
  },
  grotto: {
    id: 'grotto',
    name: 'Secret Grotto',
    subtitle: 'Find hidden rewards',
    x: 14,
    y: 58,
    icon: '\u{1F48E}',
    lockLevel: 5,
    secret: true,
    description: 'A hidden alcove rumored to hold rewards for curious explorers.',
    theme: 'pink',
  },
  lab: {
    id: 'lab',
    name: 'Threat Lab',
    subtitle: 'Incident response wing',
    x: 94,
    y: 78,
    icon: '\u{1F9EA}',
    lockLevel: 40,
    description: 'A specialized lab for dissecting live malware samples and coordinating incident response.',
    theme: 'teal',
  },
}

export const EDGES: [LocationId, LocationId][] = [
  ['start', 'cafe'],
  ['cafe', 'cisco'],
  ['cafe', 'firewall'],
  ['start', 'security'],
  ['start', 'grotto'],
  ['security', 'lab'],
]

const adjacency: Record<LocationId, LocationId[]> = Object.keys(LOCATIONS).reduce(
  (acc, id) => ({ ...acc, [id]: [] }),
  {} as Record<LocationId, LocationId[]>,
)
for (const [a, b] of EDGES) {
  adjacency[a].push(b)
  adjacency[b].push(a)
}

export function findPath(from: LocationId, to: LocationId): LocationId[] {
  if (from === to) return [from]
  const queue: LocationId[] = [from]
  const cameFrom: Partial<Record<LocationId, LocationId>> = {}
  const visited = new Set<LocationId>([from])
  while (queue.length) {
    const current = queue.shift()!
    if (current === to) break
    for (const next of adjacency[current]) {
      if (!visited.has(next)) {
        visited.add(next)
        cameFrom[next] = current
        queue.push(next)
      }
    }
  }
  if (!visited.has(to)) return [from]
  const path: LocationId[] = [to]
  let cur = to
  while (cur !== from) {
    cur = cameFrom[cur]!
    path.unshift(cur)
  }
  return path
}
