import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import TrendingHeader from "@/components/headers/TrendingHeader";

export default function Layout() {
  return (
    <Stack 
      screenOptions={{
          headerShown: true,
          headerStyle: { 
          backgroundColor: Colors.color1,
          },
          headerTintColor: Colors.color5,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          header: () => <TrendingHeader />
        }} 
      />
      {/* <Stack.Screen name="games" options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="reviews" options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="lists" options={{ headerShown: false }} /> */}
      <Stack.Screen name="(game)/[id]" options={{ headerShown: false }} />
      <Stack.Screen 
        name="(game)/more" 
        options={{ 
          presentation: 'transparentModal',
          animation: 'none',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-to-list" 
        options={{
          title: 'Add to List',
          presentation: 'modal',
          headerShown: false,
        }}
      />
    </Stack>
  );
  }