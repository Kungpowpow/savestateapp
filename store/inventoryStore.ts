import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from 'expo-sqlite/kv-store';

interface InventoryState {
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      selectedIndex: 0,
      setSelectedIndex: (index) => set({ selectedIndex: index }),
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);