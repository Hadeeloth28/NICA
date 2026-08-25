export interface GameMessage {
  id: string
  from: string
  subject: string
  body: string
}

export const MESSAGES: GameMessage[] = [
  {
    id: 'welcome',
    from: 'Levanta Team',
    subject: 'Welcome to Levanta',
    body: "Welcome aboard, recruit! Levanta is thrilled to have you. Explore the map, complete missions, and rise through the ranks by sharpening your defensive skills.",
  },
  {
    id: 'mission-brief',
    from: 'Sophia AI',
    subject: 'Firewall Vault Briefing',
    body: "We've detected an active breach attempt on the Firewall Vault. Meet me on the map — I'll walk you through the analysis step by step.",
  },
  {
    id: 'lab-brief',
    from: 'Sophia AI',
    subject: 'Threat Lab Clearance Granted',
    body: "Your work at the Security Center earned you clearance to the Threat Lab. We've got a live ransomware sample isolated — meet me there when you're ready to contain it.",
  },
  {
    id: 'workshop',
    from: 'Levanta Team',
    subject: 'Upcoming Live Workshop',
    body: 'Join us this Friday for a live threat-hunting workshop hosted in the Security Center. Bonus XP for attendees!',
  },
]
