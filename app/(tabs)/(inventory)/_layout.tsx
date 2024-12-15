import { Stack } from "expo-router";
import { Colors } from "../../../constants/Colors";

export default function InventoryLayout() {
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
        <Stack.Screen name="index" options={{ title: 'Inventory' }} />
        <Stack.Screen name="(game)/[id]" options={{ headerShown: true }} />
      </Stack>
    );
  }