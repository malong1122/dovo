import type { Enterprise } from "@/types/map";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface AppStore {
  mapPlayComplete: boolean;
  liveTick: number;
  selectedEnterprise: Enterprise | null;
  filterType: "all" | "cattle" | "sheep" | "both";
  filterCategory: "all" | "farming" | "processing" | "sales" | "integrated";
  cloud: boolean;
  rotation: boolean;
  mode: boolean;
  heat: boolean;
  bar: boolean;
  setMapPlayComplete: (v: boolean) => void;
  setLiveTick: (updater: number | ((prev: number) => number)) => void;
  setSelectedEnterprise: (e: Enterprise | null) => void;
  setFilterType: (t: AppStore["filterType"]) => void;
  setFilterCategory: (c: AppStore["filterCategory"]) => void;
  toggle: (key: "cloud" | "rotation" | "mode" | "heat" | "bar") => void;
  reset: () => void;
}

const initialState = {
  mapPlayComplete: false,
  liveTick: 0,
  selectedEnterprise: null,
  filterType: "all" as const,
  filterCategory: "all" as const,
  cloud: true,
  rotation: true,
  mode: false,
  heat: true,
  bar: true,
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, _, store) => ({
    ...initialState,
    setMapPlayComplete: (v) => set({ mapPlayComplete: v }),
    setLiveTick: (updater) =>
      set((state) => ({
        liveTick:
          typeof updater === "function"
            ? (updater as (prev: number) => number)(state.liveTick)
            : updater,
      })),
    setSelectedEnterprise: (e) => set({ selectedEnterprise: e }),
    setFilterType: (t) => set({ filterType: t }),
    setFilterCategory: (c) => set({ filterCategory: c }),
    toggle: (key) => set((s) => ({ [key]: !s[key] } as Pick<AppStore, typeof key>)),
    reset: () => set(store.getInitialState()),
  }))
);
