import { Tabs } from "expo-router";
import CustomTabBar from "../components/CustomTabBar";
import { Colors }  from "../../constants/Colors";

//todo: make the search bar look better.
//  Add a X icon to search that clears the active search text.
//  List recently viewed games.

export default function RootLayout() {
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
      <Tabs.Screen name="(trending)" 
        options={{
          title: 'Trending',
        }} 
      />
      <Tabs.Screen name="(inventory)"
        options={{
          title: 'Inventory',
        }} 
      />
      <Tabs.Screen 
        name="(search)" 
        options={{
          title: 'Search',
          // tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen name="(activity)"
        options={{
          title: 'Activity',
        }} 
      />
      <Tabs.Screen name="(profile)" 
        options={{
          title: 'Profile',
        }} 
      />
      {/* <Tabs.Screen name="(inventory, search)" 
        options={{
          href: null,
        }} 
      /> */}
    </Tabs>
  );
}

