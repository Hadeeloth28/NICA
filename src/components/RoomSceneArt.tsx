import type { ReactElement } from 'react'
import type { LocationId } from '../data/locations'

function VaultScene() {
  const wire = '#3a2a20'
  const amber = '#f7b733'
  const red = '#ff6b5e'
  const cyan = '#ffcf8a'
  return (
    <svg className="room-scene-svg" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="600" height="160" fill="#160d08" />
      <g stroke={wire} strokeWidth="1" opacity="0.5">
        <path d="M0 128 H600 M0 140 H600" />
      </g>
      <rect x="60" y="34" width="130" height="96" rx="4" fill="#1a100a" stroke={wire} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="72" y={44 + i * 21} width="106" height="15" rx="2" fill="#241609" stroke={wire} />
          <circle
            cx="84"
            cy={51.5 + i * 21}
            r="2.6"
            fill={i % 2 === 0 ? red : amber}
            className={i % 2 === 0 ? 'scene-flick' : 'scene-pulse'}
          />
          <rect x="98" y={47 + i * 21} width="60" height="7" rx="1.5" fill="#0d0704" />
        </g>
      ))}
      <g transform="translate(280 20)">
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <g key={r} transform={`translate(${r % 2 ? 0 : -14} ${r * 19})`}>
            {[0, 1, 2, 3, 4].map((c) => (
              <rect key={c} x={c * 30} y={0} width="27" height="17" rx="2" fill="#221208" stroke={red} strokeOpacity="0.45" />
            ))}
          </g>
        ))}
      </g>
      <path
        d="M470 60 c-8 10 -11 17 -5 24 c-2 -7 2 -9 4 -11 c0 5 3 7 3 12 c5 -4 8 -10 3 -18 c3 2 5 5 5 8 c5 -8 -2 -20 -10 -15 z"
        fill={cyan}
        opacity="0.9"
        className="scene-pulse"
      />
      <text x="300" y="150" fill="#a8785f" fontFamily="monospace" fontSize="11">
        // perimeter defense · ingress control
      </text>
    </svg>
  )
}

function SecurityScene() {
  const wire = '#2a2340'
  const cyan = '#a680ff'
  const green = '#3ddc84'
  const red = '#ff6b5e'
  return (
    <svg className="room-scene-svg" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="600" height="160" fill="#0e0a1a" />
      <g stroke={wire} opacity="0.5">
        <path d="M0 138 H600" />
      </g>
      <g fill="none" strokeWidth="2.5">
        <path d="M150 60 C 230 20, 300 20, 380 60" stroke={green} />
        <path d="M380 60 C 440 100, 470 100, 500 78" stroke={green} />
        <path d="M150 66 C 250 130, 400 130, 500 84" stroke={red} strokeDasharray="6 7" />
      </g>
      {[
        ['NODE A', 150, 60],
        ['NODE B', 380, 60],
        ['NODE C', 500, 80],
      ].map(([l, x, y]) => (
        <g key={l as string} transform={`translate(${x} ${y})`} className="scene-rise">
          <rect x="-30" y="-24" width="60" height="48" rx="8" fill="#160f28" stroke={wire} strokeWidth="2" />
          <rect x="-20" y="-16" width="40" height="6" rx="2" fill={cyan} opacity="0.4" />
          <rect x="-20" y="-5" width="40" height="6" rx="2" fill={cyan} opacity="0.25" />
          <text x="0" y="20" textAnchor="middle" fill={cyan} fontFamily="monospace" fontSize="10" fontWeight="bold">
            {l}
          </text>
        </g>
      ))}
      <text x="300" y="150" fill="#8a7ab0" fontFamily="monospace" fontSize="11" textAnchor="middle">
        // access logs · vulnerability sweep
      </text>
    </svg>
  )
}

function LabScene() {
  const wire = '#123842'
  const teal = '#3fd0ff'
  return (
    <svg className="room-scene-svg" viewBox="0 0 600 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="600" height="160" fill="#061a1e" />
      <g stroke={wire} opacity="0.5">
        <path d="M0 138 H600" />
      </g>
      <g transform="translate(430 60)">
        <circle cx="40" cy="30" r="48" fill="none" stroke={wire} />
        <circle cx="40" cy="30" r="32" fill="none" stroke={wire} />
        <g className="scene-sweep">
          <path d="M40 30 L40 -18" stroke={teal} strokeWidth="2" opacity="0.75" />
        </g>
        <path
          d="M18 36 q-11 0 -11 -10 q0 -10 11 -9 q2 -11 15 -8 q7 -8 15 0 q13 -1 11 11 q9 2 6 11 z"
          fill="#0b232a"
          stroke={teal}
          strokeWidth="2"
        />
        <text x="40" y="34" textAnchor="middle" fill={teal} fontFamily="monospace" fontSize="10">
          LAB
        </text>
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${80 + i * 90} 50)`}>
          <rect width="70" height="60" rx="4" fill="#0b232a" stroke={wire} strokeWidth="2" />
          <rect x="10" y="10" width="50" height="10" rx="2" fill={teal} opacity="0.5" className={i === 1 ? 'scene-flick2' : 'scene-pulse'} />
          <rect x="10" y="26" width="50" height="10" rx="2" fill={teal} opacity="0.3" />
          <circle cx="20" cy="46" r="3" fill={i % 2 === 0 ? '#3ddc84' : '#ff6b5e'} className="scene-flick" />
        </g>
      ))}
      <text x="300" y="150" fill="#3f8a99" fontFamily="monospace" fontSize="11" textAnchor="middle">
        // sample containment · incident response
      </text>
    </svg>
  )
}

const SCENES: Partial<Record<LocationId, () => ReactElement>> = {
  firewall: VaultScene,
  security: SecurityScene,
  lab: LabScene,
}

export default function RoomSceneArt({ locationId }: { locationId: LocationId }) {
  const Scene = SCENES[locationId] ?? VaultScene
  return <Scene />
}
