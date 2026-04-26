import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { PvVillageProps } from './data/pvLoader'

interface PvStore {
  mapPlayComplete: boolean
  selectedCity: string | null
  selectedVillage: PvVillageProps | null
  mode: boolean
  setMapPlayComplete: (v: boolean) => void
  setSelectedCity: (city: string | null) => void
  setSelectedVillage: (v: PvVillageProps | null) => void
  toggle: (key: 'mode') => void
  reset: () => void
}

const initialState = {
  mapPlayComplete: false,
  selectedCity: null,
  selectedVillage: null,
  mode: false,
}

export const usePvStore = create<PvStore>()(
  subscribeWithSelector((set, _, store) => ({
    ...initialState,
    setMapPlayComplete: (v) => set({ mapPlayComplete: v }),
    setSelectedCity: (city) => set({ selectedCity: city }),
    setSelectedVillage: (v) => set({ selectedVillage: v }),
    toggle: (key) => set((s) => ({ [key]: !s[key] } as Pick<PvStore, typeof key>)),
    reset: () => set(store.getInitialState()),
  }))
)
