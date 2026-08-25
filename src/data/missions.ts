import type { LocationId } from './locations'

export type ObjectiveType = 'quiz' | 'walk' | 'visit'

export interface Objective {
  id: string
  label: string
  type: ObjectiveType
  quizId?: string
  locationId?: LocationId
}

export interface RoomStation {
  id: string
  label: string
  quizId: string
}

export interface MissionRoom {
  enemyName: string
  timeLimitSec: number
  maxAttempts: number
  stations: RoomStation[]
}

export interface Mission {
  id: string
  title: string
  giver: string
  briefing: string
  completeText: string
  targetLocationId: LocationId
  requiresMissionId?: string
  objectives: Objective[]
  room?: MissionRoom
  rewardXp: number
  rewardCoins: number
  rewardBadgeId?: string
  rewardItemId?: string
  unlocksLocationId?: LocationId
}

export const MISSIONS: Mission[] = [
  {
    id: 'firewall-vault',
    title: 'Firewall Vault Breach',
    giver: 'Sophia AI',
    briefing:
      "We've detected an active breach attempt on the Firewall Vault. Reach the vault — I'll walk you through securing it from inside.",
    completeText: 'Firewall Vault secured. Security Center has been unlocked.',
    targetLocationId: 'firewall',
    objectives: [
      { id: 'reach-vault', label: 'Reach the Firewall Vault', type: 'walk', locationId: 'firewall' },
      { id: 'analyze-attack', label: 'Analyze the attack', type: 'quiz', quizId: 'analyze-attack' },
      {
        id: 'identify-traffic',
        label: 'Identify suspicious traffic',
        type: 'quiz',
        quizId: 'identify-traffic',
      },
      { id: 'escape-vault', label: 'Escape the vault', type: 'quiz', quizId: 'escape-vault' },
    ],
    room: {
      enemyName: 'Intrusion Sentinel',
      timeLimitSec: 300,
      maxAttempts: 3,
      stations: [
        { id: 'analyze-attack', label: 'Analyze the attack', quizId: 'analyze-attack' },
        { id: 'identify-traffic', label: 'Identify suspicious traffic', quizId: 'identify-traffic' },
        { id: 'escape-vault', label: 'Escape the vault', quizId: 'escape-vault' },
      ],
    },
    rewardXp: 350,
    rewardCoins: 50,
    rewardBadgeId: 'firewall-breaker',
    rewardItemId: 'vault-key',
    unlocksLocationId: 'security',
  },
  {
    id: 'security-sweep',
    title: 'Security Center Sweep',
    giver: 'Sophia AI',
    briefing:
      'Great work at the vault. Now head to the Security Center — the room will walk you through the rest once the door seals behind you.',
    completeText: 'Security Center threats neutralized. Your clearance has increased.',
    targetLocationId: 'security',
    requiresMissionId: 'firewall-vault',
    objectives: [
      { id: 'reach-security', label: 'Reach the Security Center', type: 'walk', locationId: 'security' },
      { id: 'scan-logs', label: 'Scan the access logs', type: 'quiz', quizId: 'scan-logs' },
      { id: 'patch-vuln', label: 'Patch the vulnerability', type: 'quiz', quizId: 'patch-vuln' },
    ],
    room: {
      enemyName: 'Breach Sentinel',
      timeLimitSec: 300,
      maxAttempts: 3,
      stations: [
        { id: 'scan-logs', label: 'Scan the access logs', quizId: 'scan-logs' },
        { id: 'patch-vuln', label: 'Patch the vulnerability', quizId: 'patch-vuln' },
      ],
    },
    rewardXp: 400,
    rewardCoins: 60,
    rewardBadgeId: 'threat-hunter',
    rewardItemId: 'access-badge',
    unlocksLocationId: 'lab',
  },
  {
    id: 'threat-lab-response',
    title: 'Threat Lab: Ransomware Outbreak',
    giver: 'Sophia AI',
    briefing:
      "Your clearance just got you into the Threat Lab. We've isolated a live ransomware sample — get inside and contain the outbreak before it spreads further.",
    completeText: 'Outbreak contained. The Threat Lab is now fully staffed under your watch.',
    targetLocationId: 'lab',
    requiresMissionId: 'security-sweep',
    objectives: [
      { id: 'reach-lab', label: 'Reach the Threat Lab', type: 'walk', locationId: 'lab' },
      { id: 'classify-malware', label: 'Classify the malware sample', type: 'quiz', quizId: 'classify-malware' },
      { id: 'contain-incident', label: 'Contain the outbreak', type: 'quiz', quizId: 'contain-incident' },
    ],
    room: {
      enemyName: 'Ransomware Construct',
      timeLimitSec: 300,
      maxAttempts: 3,
      stations: [
        { id: 'classify-malware', label: 'Classify the malware sample', quizId: 'classify-malware' },
        { id: 'contain-incident', label: 'Contain the outbreak', quizId: 'contain-incident' },
      ],
    },
    rewardXp: 500,
    rewardCoins: 80,
    rewardBadgeId: 'incident-commander',
    rewardItemId: 'lab-clearance',
  },
]

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id)
}
