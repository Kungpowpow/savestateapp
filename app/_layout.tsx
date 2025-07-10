import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth';
import { SearchProvider } from '@/context/search';
import { FollowingProvider } from '@/context/following';
import { useIGDBToken } from '@/hooks/useIGDBToken';
import { useReactQueryDevTools } from '@dev-plugins/react-query';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutContent() {
  const { isLoading, error, data } = useIGDBToken();
  useReactQueryDevTools(queryClient);
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (!isLoading && (data || error)) {
          await SplashScreen.hideAsync();
        }
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    };

    initializeApp();
  }, [isLoading, data, error]);

  if (isLoading) {
    return null; // Or a loading component if needed
  }

  return (
    <AuthProvider>
      <FollowingProvider>
        <SearchProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="(auth)" 
              options={{ 
                presentation: 'modal',
                headerShown: false 
              }} 
            />
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
        </SearchProvider>
      </FollowingProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}

