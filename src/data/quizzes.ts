export interface Quiz {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const QUIZZES: Record<string, Quiz> = {
  'analyze-attack': {
    id: 'analyze-attack',
    question:
      "Sophia's monitors flag a sudden spike in outbound traffic at 3 AM from a single workstation. What's your first move?",
    options: [
      'Ignore it — spikes happen all the time',
      'Isolate the affected host from the network and start analyzing the traffic',
      'Reboot the entire office network',
      'Delete the logs so the spike disappears',
    ],
    correctIndex: 1,
    explanation:
      'Isolating the host contains any potential damage while preserving evidence for analysis.',
  },
  'identify-traffic': {
    id: 'identify-traffic',
    question: 'Which of these traffic patterns is most likely malicious?',
    options: [
      'HTTPS traffic to a well-known CDN',
      'A DNS request to a random 30-character domain that changes every hour',
      'SMTP traffic to your company mail server',
      'NTP time synchronization traffic',
    ],
    correctIndex: 1,
    explanation:
      'Randomly generated, fast-changing domains are a classic sign of malware using domain generation algorithms (DGA) to reach a command-and-control server.',
  },
  'escape-vault': {
    id: 'escape-vault',
    question:
      'Inside the vault, an alarm triggers even though outbound traffic should only be allowed on port 443. What do you check first?',
    options: [
      "The firewall's outbound rules for unauthorized new entries",
      'Your personal inbox',
      "The building's thermostat",
      "The company website's CSS styling",
    ],
    correctIndex: 0,
    explanation:
      'An unexpected alarm on a locked-down firewall usually means a rule was tampered with — check the rule set first.',
  },
  'scan-logs': {
    id: 'scan-logs',
    question:
      'You notice repeated failed login attempts from a single IP address within 60 seconds. What is this called?',
    options: [
      'A brute-force login attempt',
      'Normal daily traffic',
      'A scheduled backup job',
      'A routine software update',
    ],
    correctIndex: 0,
    explanation:
      'Rapid repeated login failures from one source are the signature of a brute-force or credential-stuffing attack.',
  },
  'classify-malware': {
    id: 'classify-malware',
    question:
      'A sample encrypts user files and demands payment to restore access. How would you classify it?',
    options: ['Ransomware', 'Adware', 'A benign compression tool', 'A firmware update'],
    correctIndex: 0,
    explanation:
      'Malware that encrypts files and demands payment for the decryption key is the defining behavior of ransomware.',
  },
  'contain-incident': {
    id: 'contain-incident',
    question:
      'Ransomware is actively spreading across the office network. What is the single most urgent containment step?',
    options: [
      'Segment or disconnect the affected systems from the network immediately',
      'Send a company-wide email asking people to be careful',
      'Wait until the end of the day to investigate',
      'Reinstall antivirus on just one machine',
    ],
    correctIndex: 0,
    explanation:
      'Isolating affected systems stops lateral spread and buys time for a full incident response.',
  },
  'patch-vuln': {
    id: 'patch-vuln',
    question:
      'A server is discovered running software with a known critical CVE. What should you do first?',
    options: [
      'Wait until a user complains',
      'Apply the vendor patch or mitigation as soon as possible',
      "Disconnect the entire company's internet",
      'Do nothing — it is probably fine',
    ],
    correctIndex: 1,
    explanation:
      'Known critical vulnerabilities should be patched or mitigated immediately to close the exposure window.',
  },
}
