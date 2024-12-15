import { create } from 'zustand';
import Storage from 'expo-sqlite/kv-store';

interface IGDBTokens {
  access_token: string;
  client_id: string;
  expires_at: number;
}

interface IGDBStore {
  tokens: IGDBTokens | null;
  setTokens: (tokens: IGDBTokens | null) => void;
  fetchAndStoreTokens: () => Promise<IGDBTokens>;
  getStoredTokens: () => Promise<IGDBTokens | null>;
  isTokenExpired: (tokens: IGDBTokens) => boolean;
}

const IGDB_TOKENS_KEY = '@igdb_tokens';

export const useIGDBStore = create<IGDBStore>((set) => ({
  tokens: null,
  setTokens: (tokens) => set({ tokens }),
  
  fetchAndStoreTokens: async () => {
    try {
        console.log('fetching tokens');
      const response = await fetch('https://savestate.social/api/search-token');
      const tokens: IGDBTokens = await response.json();
      
      // Store using KV Store
      await Storage.setItem(IGDB_TOKENS_KEY, JSON.stringify(tokens));
      
      set({ tokens });
      return tokens;
    } catch (error) {
      console.error('Error fetching IGDB tokens:', error);
      throw error;
    }
  },
  
  getStoredTokens: async () => {
    try {
      const tokensString = await Storage.getItem(IGDB_TOKENS_KEY);
      if (!tokensString) return null;
      
      const tokens: IGDBTokens = JSON.parse(tokensString);
      
      // Check if tokens are expired (5 minutes buffer)
      if (Date.now() / 1000 >= tokens.expires_at - 300) {
        return null;
      }
      
      set({ tokens });
      return tokens;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  },
  
  isTokenExpired: (tokens) => {
    if (!tokens.expires_at) return true;
    
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds to match expires_at
    return currentTime >= tokens.expires_at - 300; // Add 5-minute buffer like in getStoredTokens
  },
})); 