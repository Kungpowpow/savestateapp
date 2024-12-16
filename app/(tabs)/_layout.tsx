import { Tabs, useRouter } from 'expo-router';
import { useAuth } from '../../context/auth';
import CustomTabBar from '../components/CustomTabBar';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  const { session } = useAuth();
  const router = useRouter();

  return (
    <Tabs
      initialRouteName="(trending)"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerStyle: { 
          backgroundColor: Colors.color1,
        },
        headerTintColor: Colors.color5,
      }}
    >
      <Tabs.Screen 
        name="(trending)" 
        options={{
          title: 'Trending',
        }} 
      />
      <Tabs.Screen 
        name="(inventory)"
        options={{
          title: 'Inventory',
        }}
        listeners={{
          tabPress: (e) => {
            if (!session) {
              e.preventDefault();
              router.push('/(auth)/login');
            }
          },
        }}
      />
      <Tabs.Screen 
        name="(search)" 
        options={{
          title: 'Search',
        }}
      />
      <Tabs.Screen 
        name="(activity)"
        options={{
          title: 'Activity',
        }}
        listeners={{
          tabPress: (e) => {
            if (!session) {
              e.preventDefault();
              router.push('/(auth)/login');
            }
          },
        }}
      />
      <Tabs.Screen 
        name="(profile)" 
        options={{
          title: 'Profile',
        }}
        listeners={{
          tabPress: (e) => {
            if (!session) {
              e.preventDefault();
              router.push('/(auth)/login');
            }
          },
        }}
      />
    </Tabs>
  );
}

