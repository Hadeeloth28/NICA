import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocationId } from '../data/locations'
import { LOCATIONS } from '../data/locations'
import { MISSIONS, getMission } from '../data/missions'
import { levelForXp } from '../data/catalog'

export interface ToastMessage {
  id: number
  text: string
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
}

let toastCounter = 0

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
        checkLevelBadges(set, get)
      },

      markMessageRead: (id) =>
        set((s) => (s.readMessageIds.includes(id) ? s : { readMessageIds: [...s.readMessageIds, id] })),

      requestWalk: (id) => set({ walkTarget: id }),
      clearWalkTarget: () => set({ walkTarget: null }),
    }),
    {
      name: 'nica-save',
      partialize: (s) => {
        const { toasts: _toasts, walkTarget: _walkTarget, ...rest } = s
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

  const next = MISSIONS.find((m) => m.requiresMissionId === missionId)
  set({ activeMissionId: next?.id })
  checkLevelBadges(set, get)
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
