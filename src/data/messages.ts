export interface GameMessage {
  id: string
  from: string
  subject: string
  body: string
}

export const MESSAGES: GameMessage[] = [
  {
    id: 'welcome',
    from: 'NICA Team',
    subject: 'Welcome to NICA',
    body: "Welcome aboard, recruit! The National Institute of Cyber Awareness is thrilled to have you. Explore the map, complete missions, and level up your defensive skills.",
  },
  {
    id: 'mission-brief',
    from: 'Sophia AI',
    subject: 'Firewall Vault Briefing',
    body: "We've detected an active breach attempt on the Firewall Vault. Meet me on the map — I'll walk you through the analysis step by step.",
  },
  {
    id: 'workshop',
    from: 'NICA Team',
    subject: 'Upcoming Live Workshop',
    body: 'Join us this Friday for a live threat-hunting workshop hosted in the Security Center. Bonus XP for attendees!',
  },
]
