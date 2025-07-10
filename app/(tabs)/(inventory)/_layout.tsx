import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import InventoryHeader from "@/components/headers/InventoryHeader";
import { useRouter, useSegments} from 'expo-router';


export default function InventoryLayout() {
    return (
      <Stack 
        screenOptions={{
            headerShown: true,
            header: ({ navigation }) => (
              <InventoryHeader 
                showBackButton={navigation.canGoBack()}
              />
            ),
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Inventory' }} />
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