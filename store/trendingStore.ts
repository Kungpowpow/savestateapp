import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from 'expo-sqlite/kv-store';

interface TrendingState {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export const useTrendingStore = create<TrendingState>()(
  persist(
    (set) => ({
      selectedIndex: 0,
      setSelectedIndex: (index) => set({ selectedIndex: index }),
    }),
    {
      name: 'trending-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);