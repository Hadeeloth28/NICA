import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocationId } from '../data/locations'
import { LOCATIONS } from '../data/locations'
import { MISSIONS, getMission } from '../data/missions'
import { levelForXp } from '../data/catalog'
import {
  playLevelUp,
  playMissionComplete,
  playTreasure,
  playDoorLock,
  playDoorUnlock,
  playRoomFail,
  startBreathing,
  stopBreathing,
  setBreathingIntensity,
} from '../lib/sound'

export interface ToastMessage {
  id: number
  text: string
}

export type RoomPhase = 'stations' | 'combat' | 'success' | 'failed'

export interface RoomSession {
  missionId: string
  stationIds: string[]
  solvedStationIds: string[]
  attemptsLeft: number
  maxAttempts: number
  timeLeftSec: number
  timeLimitSec: number
  phase: RoomPhase
  activeStationId: string | null
  enemyName: string
}

interface GameState {
  playerName: string
  currentLocationId: LocationId
  xp: number
  coins: number
  badges: string[]
  inventory: string[]
  completedMissions: string[]
  completedObjectives: Record<string, string[]>
  activeMissionId: string | undefined
  extraUnlockedLocations: LocationId[]
  grottoClaimed: boolean
  readMessageIds: string[]
  toasts: ToastMessage[]
  walkTarget: LocationId | null
  soundEnabled: boolean
  dayStreak: number
  lastVisitDate: string | null
  roomSession: RoomSession | null

  level: () => number
  isLocationUnlocked: (id: LocationId) => boolean
  activeMission: () => (typeof MISSIONS)[number] | undefined

  arriveAt: (id: LocationId) => void
  completeObjective: (missionId: string, objectiveId: string) => void
  claimGrotto: () => void
  markMessageRead: (id: string) => void
  pushToast: (text: string) => void
  dismissToast: (id: number) => void
  requestWalk: (id: LocationId) => void
  clearWalkTarget: () => void
  toggleSound: () => void
  checkInDaily: () => void

  enterRoom: (missionId: string) => void
  answerRoomStation: (stationId: string, correct: boolean) => void
  resolveCombatVictory: () => void
  finishRoomSuccess: () => void
  finishRoomFail: () => void
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let toastCounter = 0
let roomIntervalId: ReturnType<typeof setInterval> | undefined

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      playerName: 'Recruit',
      currentLocationId: 'start',
      xp: 0,
      coins: 100,
      badges: [],
      inventory: [],
      completedMissions: [],
      completedObjectives: {},
      activeMissionId: 'firewall-vault',
      extraUnlockedLocations: [],
      grottoClaimed: false,
      readMessageIds: [],
      toasts: [],
      walkTarget: null,
      soundEnabled: true,
      dayStreak: 0,
      lastVisitDate: null,
      roomSession: null,

      level: () => levelForXp(get().xp),

      isLocationUnlocked: (id) => {
        const loc = LOCATIONS[id]
        const state = get()
        if (state.extraUnlockedLocations.includes(id)) return true
        return state.level() >= loc.lockLevel
      },

      activeMission: () => {
        const state = get()
        return state.activeMissionId ? getMission(state.activeMissionId) : undefined
      },

      pushToast: (text) => {
        const id = ++toastCounter
        set((s) => ({ toasts: [...s.toasts, { id, text }] }))
        setTimeout(() => get().dismissToast(id), 4000)
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      arriveAt: (id) => {
        set({ currentLocationId: id })
        const state = get()
        if (id === 'grotto' && !state.grottoClaimed) {
          get().claimGrotto()
        }
        const mission = state.activeMission()
        if (mission && mission.targetLocationId === id) {
          const walkObjective = mission.objectives.find((o) => o.type === 'walk' && o.locationId === id)
          if (walkObjective) {
            const done = state.completedObjectives[mission.id] ?? []
            if (!done.includes(walkObjective.id)) {
              get().completeObjective(mission.id, walkObjective.id)
            }
          }
        }
      },

      completeObjective: (missionId, objectiveId) => {
        set((s) => {
          const done = s.completedObjectives[missionId] ?? []
          if (done.includes(objectiveId)) return s
          return {
            completedObjectives: { ...s.completedObjectives, [missionId]: [...done, objectiveId] },
          }
        })

        const state = get()
        const mission = getMission(missionId)
        if (!mission) return
        const done = state.completedObjectives[missionId] ?? []
        const allDone = mission.objectives.every((o) => done.includes(o.id))
        if (allDone && !state.completedMissions.includes(missionId)) {
          completeMission(mission.id, set, get)
        }
      },

      claimGrotto: () => {
        if (get().grottoClaimed) return
        set((s) => ({
          grottoClaimed: true,
          coins: s.coins + 75,
          xp: s.xp + 100,
          inventory: [...s.inventory, 'grotto-gem'],
          badges: s.badges.includes('treasure-hunter') ? s.badges : [...s.badges, 'treasure-hunter'],
        }))
        get().pushToast('Secret Grotto reward found: +100 XP, +75 coins, Grotto Gem!')
        if (get().soundEnabled) playTreasure()
        checkLevelBadges(set, get)
      },

      markMessageRead: (id) =>
        set((s) => (s.readMessageIds.includes(id) ? s : { readMessageIds: [...s.readMessageIds, id] })),

      requestWalk: (id) => set({ walkTarget: id }),
      clearWalkTarget: () => set({ walkTarget: null }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      checkInDaily: () => {
        const today = dateKey(new Date())
        const last = get().lastVisitDate
        if (last === today) return
        if (last) {
          const yesterday = dateKey(new Date(Date.now() - 86400000))
          set((s) => ({
            dayStreak: last === yesterday ? s.dayStreak + 1 : 1,
            lastVisitDate: today,
          }))
        } else {
          set({ dayStreak: 1, lastVisitDate: today })
        }
      },

      enterRoom: (missionId) => {
        const mission = getMission(missionId)
        if (!mission?.room) return
        window.clearInterval(roomIntervalId)
        const done = get().completedObjectives[missionId] ?? []
        const stationIds = mission.room.stations.map((s) => s.id)
        set({
          roomSession: {
            missionId,
            stationIds,
            solvedStationIds: stationIds.filter((id) => done.includes(id)),
            attemptsLeft: mission.room.maxAttempts,
            maxAttempts: mission.room.maxAttempts,
            timeLeftSec: mission.room.timeLimitSec,
            timeLimitSec: mission.room.timeLimitSec,
            phase: 'stations',
            activeStationId: null,
            enemyName: mission.room.enemyName,
          },
        })
        if (get().soundEnabled) {
          playDoorLock()
          startBreathing()
        }
        roomIntervalId = window.setInterval(() => {
          const session = get().roomSession
          if (!session || session.phase === 'success' || session.phase === 'failed') return
          const timeLeftSec = session.timeLeftSec - 1
          if (get().soundEnabled) setBreathingIntensity(timeLeftSec <= 60 ? 1 : session.phase === 'combat' ? 0.7 : 0.35)
          if (timeLeftSec <= 0) {
            failRoom(set, get)
            return
          }
          set({ roomSession: { ...session, timeLeftSec } })
        }, 1000)
      },

      answerRoomStation: (stationId, correct) => {
        const session = get().roomSession
        if (!session) return
        if (correct) {
          const solvedStationIds = session.solvedStationIds.includes(stationId)
            ? session.solvedStationIds
            : [...session.solvedStationIds, stationId]
          get().completeObjective(session.missionId, stationId)
          if (solvedStationIds.length >= session.stationIds.length) {
            succeedRoom(set, get)
          } else {
            set({ roomSession: { ...get().roomSession!, solvedStationIds } })
          }
        } else {
          const attemptsLeft = session.attemptsLeft - 1
          set({
            roomSession: { ...session, attemptsLeft, phase: 'combat', activeStationId: stationId },
          })
        }
      },

      resolveCombatVictory: () => {
        const session = get().roomSession
        if (!session) return
        if (session.attemptsLeft <= 0) {
          failRoom(set, get)
        } else {
          set({ roomSession: { ...session, phase: 'stations', activeStationId: null } })
        }
      },

      finishRoomSuccess: () => {
        if (get().soundEnabled) {
          stopBreathing()
          playDoorUnlock()
        }
        set({ roomSession: null })
      },

      finishRoomFail: () => {
        if (get().soundEnabled) stopBreathing()
        set({ roomSession: null })
      },
    }),
    {
      name: 'levanta-save',
      partialize: (s) => {
        const { toasts: _toasts, walkTarget: _walkTarget, roomSession: _roomSession, ...rest } = s
        return rest
      },
    },
  ),
)

function completeMission(
  missionId: string,
  set: (partial: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => void,
  get: () => GameState,
) {
  const mission = getMission(missionId)
  if (!mission) return
  const prevLevel = get().level()
  set((s) => ({
    completedMissions: [...s.completedMissions, missionId],
    xp: s.xp + mission.rewardXp,
    coins: s.coins + mission.rewardCoins,
    badges:
      mission.rewardBadgeId && !s.badges.includes(mission.rewardBadgeId)
        ? [...s.badges, mission.rewardBadgeId]
        : s.badges,
    inventory: mission.rewardItemId ? [...s.inventory, mission.rewardItemId] : s.inventory,
    extraUnlockedLocations: mission.unlocksLocationId
      ? [...s.extraUnlockedLocations, mission.unlocksLocationId]
      : s.extraUnlockedLocations,
  }))

  get().pushToast(`Mission complete: ${mission.title}! +${mission.rewardXp} XP, +${mission.rewardCoins} coins`)
  if (get().soundEnabled) {
    playMissionComplete()
    if (get().level() > prevLevel) setTimeout(() => get().soundEnabled && playLevelUp(), 350)
  }

  const next = MISSIONS.find((m) => m.requiresMissionId === missionId)
  set({ activeMissionId: next?.id })
  checkLevelBadges(set, get)
}

function failRoom(
  set: (partial: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => void,
  get: () => GameState,
) {
  window.clearInterval(roomIntervalId)
  const session = get().roomSession
  if (!session) return
  set({ roomSession: { ...session, phase: 'failed' } })
  if (get().soundEnabled) playRoomFail()
}

function succeedRoom(
  set: (partial: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => void,
  get: () => GameState,
) {
  window.clearInterval(roomIntervalId)
  const session = get().roomSession
  if (!session) return
  set({ roomSession: { ...session, phase: 'success' } })
}

function checkLevelBadges(
  set: (partial: Partial<GameState> | ((s: GameState) => Partial<GameState>)) => void,
  get: () => GameState,
) {
  const level = get().level()
  const toAward: string[] = []
  if (level >= 5 && !get().badges.includes('rising-star')) toAward.push('rising-star')
  if (level >= 20 && !get().badges.includes('cyber-scholar')) toAward.push('cyber-scholar')
  if (toAward.length) {
    set((s) => ({ badges: [...s.badges, ...toAward] }))
  }
}
