import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useIGDBStore } from '../store/igdbStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { getStoredTokens, fetchAndStoreTokens, isTokenExpired } = useIGDBStore();

  // Initialize IGDB tokens during app load
  useEffect(() => {
    const initializeTokens = async () => {
      try {
        const storedTokens = await getStoredTokens();
        
        // Fetch new tokens if none exist or if current token is expired
        if (!storedTokens || (storedTokens && isTokenExpired(storedTokens))) {
          await fetchAndStoreTokens();
        }
        
        // Hide splash screen after tokens are initialized
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error initializing IGDB tokens:', error);
        // Still hide splash screen even if token initialization fails
        await SplashScreen.hideAsync();
      }
    };

    initializeTokens();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

