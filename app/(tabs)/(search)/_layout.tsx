import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import SearchHeader from "@/components/headers/SearchHeader";
import IndexSearchHeader from "@/components/headers/IndexSearchHeader";
import { SearchProvider, useSearch } from "@/context/search";

function SearchLayout() {
  return (
    <Stack 
      screenOptions={{
          headerShown: true,
          headerTitle: '',
          headerStyle: { 
            backgroundColor: Colors.color1,
          },
          headerTintColor: Colors.color5,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: true,
          header: () => <IndexSearchHeader />
        }} 
      />
      <Stack.Screen 
        name="search-screen" 
        options={{ 
          headerShown: true,
          header: () => {
            const { 
              searchQuery, 
              setSearchQuery, 
              activeTab, 
              setActiveTab, 
              handleSearch, 
              handleClear 
            } = useSearch();

            return (
              <SearchHeader
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSearch={handleSearch}
                onClear={handleClear}
              />
            );
          }
        }} 
      />
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

export default function Layout() {
  return (
    <SearchProvider>
      <SearchLayout />
    </SearchProvider>
  );
}