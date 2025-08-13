import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import { TouchableOpacity, Alert } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth';
import { useRouter } from 'expo-router';

export default function Layout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSettingsPress = () => {
    Alert.alert(
      'Profile Settings',
      'Choose an option',
      [
        {
          text: 'Edit Profile',
          onPress: () => {
            // TODO: Navigate to edit profile screen when implemented
            Alert.alert('Coming Soon', 'Profile editing will be available soon');
          }
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await logout();
              router.push('/(auth)/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: 'destructive'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

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
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleSettingsPress} style={{ marginRight: 4 }}>
              <Octicons name="gear" size={24} color={Colors.color5} />
            </TouchableOpacity>
          )
        }} 
      />
      <Stack.Screen name="[slug]" options={{ headerShown: false }} />
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