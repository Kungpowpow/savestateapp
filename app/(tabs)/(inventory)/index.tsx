import { Text, View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useUserLists } from '@/hooks/useUserLists';
import GameCard from '@/components/GameCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInventoryStore } from '@/store/inventoryStore';
import { useCustomLists } from '@/hooks/useCustomLists';
import CustomListCard from '@/components/CustomListCard';
import { Octicons } from '@expo/vector-icons';
import React from 'react';

//inventory games are all games that played, playing, backlog, wishlist. 
//collection is a separate tab. 
//tabs = Games, Wishlist, Backlog, Collection
//games rows = one for each played status.

//Games, Wishlist, Backlog, Collection. 
//are these all the same database?
//lists have their own item order. and metadata. Stored in profile.

type ListType = 'collection' | 'wishlist' | 'lists' | 'stats';

export default function InventoryScreen() {
  const { userLists, getWishlistItems, getCollectionItems, getBacklogItems, getGameListItems } = useUserLists();
  const { customLists, deleteList } = useCustomLists();
  const { selectedIndex, setSelectedIndex } = useInventoryStore();
  const insets = useSafeAreaInsets();

  const segments: ListType[] = ['collection', 'wishlist', 'lists', 'stats'];
  const activeTab = segments[selectedIndex];

  const getItemsForTab = (tab: ListType) => {
    switch (tab) {
      case 'wishlist':
        return getWishlistItems();
      case 'collection':
        return getCollectionItems();
      case 'lists':
        return getBacklogItems(); // Using backlog for now, could be expanded
      case 'stats':
        return []; // Stats don't have items
      default:
        return [];
    }
  };

  const renderGameItem = ({ item }: { item: any }) => {
    if (!item.game) return null;
    
    return (
      <GameCard 
        game={item.game}
        showRating={true}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {activeTab === 'stats' 
          ? 'No stats available yet'
          : `No games in your ${activeTab} yet`
        }
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {activeTab === 'stats' 
          ? 'Start playing games to see your stats'
          : 'Start adding games to see them here'
        }
      </Text>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Text style={styles.statsTitle}>Your Gaming Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getWishlistItems().length}</Text>
          <Text style={styles.statLabel}>Wishlist</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getCollectionItems().length}</Text>
          <Text style={styles.statLabel}>Collection</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getBacklogItems().length}</Text>
          <Text style={styles.statLabel}>Backlog</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{getGameListItems().length}</Text>
          <Text style={styles.statLabel}>Custom Lists</Text>
        </View>
      </View>
    </View>
  );

  // Lists Section
  const renderListsSection = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Custom Lists</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // Navigate to the lists section if not already there
              if (activeTab !== 'lists') {
                setSelectedIndex(2); // Index of 'lists' in segments array
              }
            }}
          >
            <Octicons name="plus" size={20} color={Colors.color5} />
            <Text style={styles.addButtonText}>New List</Text>
          </TouchableOpacity>
        </View>
        {customLists.isLoading ? (
          <ActivityIndicator size="large" color={Colors.color5} style={{ marginTop: 40 }} />
        ) : customLists.isError ? (
          <Text style={styles.errorText}>Failed to load custom lists</Text>
        ) : (
          <FlatList
            data={customLists.data?.data || []}
            renderItem={({ item }) => (
              <CustomListCard 
                list={item} 
                onDelete={() => {
                  Alert.alert(
                    'Delete List',
                    `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive', 
                        onPress: () => deleteList.mutate(item.id)
                      },
                    ]
                  );
                }}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No custom lists yet. Tap 'New List' to create one.</Text>}
          />
        )}
      </View>
    );
  };

  if (userLists.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.color5} />
      </View>
    );
  }

  if (userLists.isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load your lists</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => userLists.refetch()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentItems = getItemsForTab(activeTab);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Content */}
      {activeTab === 'stats' ? (
        <ScrollView 
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {renderStats()}
        </ScrollView>
      ) : activeTab === 'lists' ? (
        renderListsSection()
      ) : (
        <FlatList
          data={currentItems}
          renderItem={renderGameItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.color5,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.color3,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.color5,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: Colors.color5,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: Colors.color5 + '80',
    fontSize: 14,
  },
  statsContainer: {
    padding: 20,
  },
  statsTitle: {
    color: Colors.color5,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.color3,
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    color: Colors.color5,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: Colors.color5 + '80',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    justifyContent: 'space-between',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: Colors.color5,
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color3,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addButtonText: {
    color: Colors.color5,
    fontSize: 15,
    marginLeft: 6,
  },
  emptyText: {
    color: Colors.color5 + '80',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
}); 