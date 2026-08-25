import type { ReactElement } from 'react'
import type { LocationId } from '../data/locations'

function CiscoIcon({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7db8ff" />
          <stop offset="100%" stopColor="#2c5fb8" />
        </linearGradient>
      </defs>
      <rect x="10" y="14" width="4" height="30" rx="1.5" fill="#4d8dff" />
      <rect x="50" y="14" width="4" height="30" rx="1.5" fill="#4d8dff" />
      <circle cx="12" cy="11" r="2.4" fill="#8fd3ff" />
      <circle cx="52" cy="11" r="2.4" fill="#8fd3ff" />
      <rect x="18" y="22" width="28" height="26" rx="2" fill={`url(#${uid}-body)`} stroke="#1b3c78" strokeWidth="1" />
      <rect x="22" y="27" width="5" height="5" fill="#dff2ff" opacity="0.85" />
      <rect x="30" y="27" width="5" height="5" fill="#dff2ff" opacity="0.85" />
      <rect x="38" y="27" width="5" height="5" fill="#dff2ff" opacity="0.85" />
      <rect x="22" y="35" width="5" height="5" fill="#dff2ff" opacity="0.6" />
      <rect x="30" y="35" width="5" height="5" fill="#dff2ff" opacity="0.6" />
      <rect x="38" y="35" width="5" height="5" fill="#dff2ff" opacity="0.6" />
      <rect x="24" y="44" width="16" height="4" rx="1" fill="#1b3c78" />
    </svg>
  )
}

function CafeIcon({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd28a" />
          <stop offset="100%" stopColor="#c9781a" />
        </linearGradient>
      </defs>
      <path d="M10 26 L32 12 L54 26 Z" fill="#8a4a1e" />
      <rect x="14" y="26" width="36" height="20" fill={`url(#${uid}-wall)`} stroke="#7a3f14" strokeWidth="1" />
      <rect x="12" y="24" width="40" height="5" fill="#f7b733" stroke="#8a4a1e" strokeWidth="0.5" />
      <rect x="12" y="24" width="6" height="5" fill="#e88b1f" />
      <rect x="24" y="24" width="6" height="5" fill="#e88b1f" />
      <rect x="36" y="24" width="6" height="5" fill="#e88b1f" />
      <rect x="48" y="24" width="4" height="5" fill="#e88b1f" />
      <rect x="27" y="34" width="10" height="12" fill="#5a3010" />
      <circle cx="20" cy="40" r="3.4" fill="#fff8ec" stroke="#8a4a1e" strokeWidth="1" />
      <path d="M18.3 39 q1.7 -2 3.4 0" stroke="#8a4a1e" strokeWidth="0.8" fill="none" />
    </svg>
  )
}

function FirewallIcon({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <radialGradient id={`${uid}-flame`} cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#ffe08a" />
          <stop offset="60%" stopColor="#ff8a3d" />
          <stop offset="100%" stopColor="#c23b1f" />
        </radialGradient>
      </defs>
      <rect x="8" y="18" width="6" height="6" fill="#5a2a20" />
      <rect x="50" y="18" width="6" height="6" fill="#5a2a20" />
      <rect x="20" y="18" width="6" height="6" fill="#5a2a20" />
      <rect x="38" y="18" width="6" height="6" fill="#5a2a20" />
      <path d="M10 24 h44 v14 a22 22 0 0 1 -44 0 Z" fill="#7a3a2c" stroke="#4a2015" strokeWidth="1.5" />
      <path
        d="M32 30 c-5 6 -7 10 -3 14 c-1 -4 1 -5 2 -6 c0 3 2 4 2 7 c3 -2 5 -6 2 -11 c2 1 3 3 3 5 c3 -5 -1 -12 -6 -9 Z"
        fill={`url(#${uid}-flame)`}
      />
    </svg>
  )
}

function SecurityIcon({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-shield`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7aeff" />
          <stop offset="100%" stopColor="#7852d6" />
        </linearGradient>
      </defs>
      <rect x="44" y="8" width="3" height="12" fill="#a680ff" />
      <circle cx="45.5" cy="8" r="3" fill="none" stroke="#a680ff" strokeWidth="2" />
      <path
        d="M32 12 L52 20 V34 C52 46 43 53 32 57 C21 53 12 46 12 34 V20 Z"
        fill={`url(#${uid}-shield)`}
        stroke="#4a2c94"
        strokeWidth="1.5"
      />
      <path d="M32 22 L42 27 V35 C42 41 37.5 45 32 47.5 C26.5 45 22 41 22 35 V27 Z" fill="#2a1a54" opacity="0.55" />
      <path d="M27 34 l4 4 l8 -9" stroke="#c7aeff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GrottoIcon({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#ffd6f2" />
          <stop offset="100%" stopColor="#ff7ec8" />
        </radialGradient>
      </defs>
      <path
        d="M6 50 C6 30 16 14 32 14 C48 14 58 30 58 50 Z"
        fill="#3d3350"
        stroke="#241c34"
        strokeWidth="1.5"
      />
      <path d="M16 50 C16 34 23 22 32 22 C41 22 48 34 48 50 Z" fill="#120e1c" />
      <path d="M32 30 L36 40 L32 48 L28 40 Z" fill={`url(#${uid}-glow)`} />
      <circle cx="32" cy="38" r="9" fill="#ff7ec8" opacity="0.18" />
    </svg>
  )
}

function LabIcon({ uid }: { uid: string }) {
  return (
    <svg viewBox="0 0 64 64" width="100%" height="100%">
      <defs>
        <linearGradient id={`${uid}-dome`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9df0ff" />
          <stop offset="100%" stopColor="#1a8fa8" />
        </linearGradient>
      </defs>
      <rect x="14" y="36" width="36" height="12" fill="#0f4a56" stroke="#0a2f38" strokeWidth="1" />
      <path d="M14 36 a18 18 0 0 1 36 0 Z" fill={`url(#${uid}-dome)`} stroke="#0a2f38" strokeWidth="1.5" />
      <path d="M20 36 a12 12 0 0 1 24 0 Z" fill="#0a2f38" opacity="0.4" />
      <rect x="30" y="14" width="4" height="8" fill="#3fd0ff" />
      <circle cx="32" cy="12" r="2.6" fill="#9df0ff" />
      <rect x="20" y="40" width="6" height="5" fill="#3fd0ff" opacity="0.8" />
      <rect x="29" y="40" width="6" height="5" fill="#3fd0ff" opacity="0.8" />
      <rect x="38" y="40" width="6" height="5" fill="#3fd0ff" opacity="0.8" />
    </svg>
  )
}

const ICONS: Partial<Record<LocationId, (p: { uid: string }) => ReactElement>> = {
  cisco: CiscoIcon,
  cafe: CafeIcon,
  firewall: FirewallIcon,
  security: SecurityIcon,
  grotto: GrottoIcon,
  lab: LabIcon,
}

export default function BuildingIcon({ id }: { id: LocationId }) {
  const Icon = ICONS[id]
  if (!Icon) return null
  return <Icon uid={id} />
}
