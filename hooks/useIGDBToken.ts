import { useQuery } from '@tanstack/react-query';
import Storage from 'expo-sqlite/kv-store';

interface IGDBTokens {
  access_token: string;
  client_id: string;
  expires_at: number;
}

const IGDB_TOKENS_KEY = '@igdb_tokens';

const fetchTokens = async (): Promise<IGDBTokens> => {
  try {
    console.log('fetching tokens');
    const response = await fetch('https://savestate.social/api/search-token');
    const tokens: IGDBTokens = await response.json();
    
    // Store using KV Store
    await Storage.setItem(IGDB_TOKENS_KEY, JSON.stringify(tokens));
    return tokens;
  } catch (error) {
    console.error('Error fetching IGDB tokens:', error);
    throw error;
  }
};

const getStoredTokens = async (): Promise<IGDBTokens | null> => {
  try {
    const tokensString = await Storage.getItem(IGDB_TOKENS_KEY);
    if (!tokensString) return null;
    
    const tokens: IGDBTokens = JSON.parse(tokensString);
    
    // Check if tokens are expired (5 minutes buffer)
    if (Date.now() / 1000 >= tokens.expires_at - 300) {
      return null;
    }
    
    return tokens;
  } catch (error) {
    console.error('Error getting stored tokens:', error);
    return null;
  }
};

const isTokenExpired = (tokens: IGDBTokens): boolean => {
  if (!tokens.expires_at) return true;
  
  const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds to match expires_at
  return currentTime >= tokens.expires_at - 300; // Add 5-minute buffer
};

export function useIGDBToken() {
  return useQuery({
    queryKey: ['igdbToken'],
    queryFn: async () => {
      const storedTokens = await getStoredTokens();
      
      if (!storedTokens || isTokenExpired(storedTokens)) {
        return fetchTokens();
      }
      
      return storedTokens;
    },
    staleTime: 1000 * 60 * 50, // Refetch after 50 minutes
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
    retry: 3,
  });
}

// Helper function to get just the access token
export const getIGDBAccessToken = async (): Promise<string | null> => {
  const tokens = await getStoredTokens();
  return tokens?.access_token || null;
}; 