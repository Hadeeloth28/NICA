import type { LocationId } from './locations'

export type ObjectiveType = 'quiz' | 'walk' | 'visit'

export interface Objective {
  id: string
  label: string
  type: ObjectiveType
  quizId?: string
  locationId?: LocationId
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
      "We've detected an active breach attempt on the Firewall Vault. I need you to analyze the attack, identify the suspicious traffic, reach the vault, and shut it down.",
    completeText: 'Firewall Vault secured. Security Center has been unlocked.',
    targetLocationId: 'firewall',
    objectives: [
      { id: 'analyze-attack', label: 'Analyze the attack', type: 'quiz', quizId: 'analyze-attack' },
      {
        id: 'identify-traffic',
        label: 'Identify suspicious traffic',
        type: 'quiz',
        quizId: 'identify-traffic',
      },
      { id: 'reach-vault', label: 'Reach the Firewall Vault', type: 'walk', locationId: 'firewall' },
      { id: 'escape-vault', label: 'Escape the vault', type: 'quiz', quizId: 'escape-vault' },
    ],
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
      'Great work at the vault. Now head to the Security Center — I need eyes on the logs and a critical vulnerability patched before anything else slips through.',
    completeText: 'Security Center threats neutralized. Your clearance has increased.',
    targetLocationId: 'security',
    requiresMissionId: 'firewall-vault',
    objectives: [
      { id: 'scan-logs', label: 'Scan the access logs', type: 'quiz', quizId: 'scan-logs' },
      { id: 'reach-security', label: 'Reach the Security Center', type: 'walk', locationId: 'security' },
      { id: 'patch-vuln', label: 'Patch the vulnerability', type: 'quiz', quizId: 'patch-vuln' },
    ],
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
      "Your clearance just got you into the Threat Lab. We've isolated a live ransomware sample — I need you to classify it, get to the lab, and contain the outbreak before it spreads further.",
    completeText: 'Outbreak contained. The Threat Lab is now fully staffed under your watch.',
    targetLocationId: 'lab',
    requiresMissionId: 'security-sweep',
    objectives: [
      { id: 'classify-malware', label: 'Classify the malware sample', type: 'quiz', quizId: 'classify-malware' },
      { id: 'reach-lab', label: 'Reach the Threat Lab', type: 'walk', locationId: 'lab' },
      { id: 'contain-incident', label: 'Contain the outbreak', type: 'quiz', quizId: 'contain-incident' },
    ],
    rewardXp: 500,
    rewardCoins: 80,
    rewardBadgeId: 'incident-commander',
    rewardItemId: 'lab-clearance',
  },
]

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id)
}
