import { useState } from 'react';
import { Text, View, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Link, router } from 'expo-router';
import { toggleFollowUser } from '@/lib/api';
import UserCard from '@/components/UserCard';
import { useAuth } from '@/context/auth';
import { useSearch } from '@/context/search';
import { useFollowing } from '@/context/following';
import { Ionicons } from '@expo/vector-icons';

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
}

interface User {
  id: number;
  name: string;
  username: string;
  slug: string;
  created_at: string;
  isFollowing: boolean;
}

export default function SearchScreen() {
  const { 
    searchQuery, 
    activeTab,
    games, 
    users, 
    loading,
    setUsers
  } = useSearch();
  
  const [followLoading, setFollowLoading] = useState<number | null>(null);
  const { user: currentUser } = useAuth();
  const { toggleFollowing, isFollowing: isFollowingUser } = useFollowing();

  const handleToggleFollow = async (user: User) => {
    if (!currentUser) return;
    setFollowLoading(user.id);
    try {
      await toggleFollowUser(user.slug);
      // Update global following state
      toggleFollowing(user.id);
      // Update local search results
      setUsers((prev: User[]) => prev.map((u: User) => u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u));
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <Link
      push
      href={`/(tabs)/(search)/(game)/${item.id}`}
      style={styles.gameItem}
    >
      <View style={styles.gameCoverContainer}>
        {item.cover?.url ? (
          <Image
            source={{ 
              uri: item.cover.url
                .replace('t_thumb', 't_cover_big')
                .replace('//images', 'https://images') 
            }}
            style={styles.gameCover}
          />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>No Cover</Text>
          </View>
        )}
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameName} numberOfLines={2}>{item.name}</Text>
        {item.rating ? (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating: </Text>
            <Text style={styles.gameRating}>{Math.round(item.rating)}%</Text>
          </View>
        ) : (
          <Text style={styles.noRating}>No rating available</Text>
        )}
      </View>
    </Link>
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <UserCard
      user={item}
      onToggleFollow={() => handleToggleFollow(item)}
      followLoading={followLoading === item.id}
      showFollowButton={currentUser?.id !== item.id}
    />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.color5} />
          <Text style={styles.loadingText}>
            Searching {activeTab}...
          </Text>
        </View>
      ) : (
        activeTab === 'games' ? (
          <FlatList
            key={activeTab}
            data={games}
            renderItem={renderGameItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.gridContent}
            numColumns={2}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'No games found' 
                    : 'Search for your favorite games'
                  }
                </Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key={activeTab}
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'No users found' 
                    : 'Search for users'
                  }
                </Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
  },
  list: {
    flex: 1,
  },
  gridContent: {
    padding: 8,
    paddingBottom: 70,
  },
  listContent: {
    padding: 8,
    paddingBottom: 70,
  },
  gameItem: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.color3,
    borderRadius: 16,
    margin: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 160,
    maxWidth: '48%',
  },
  gameCoverContainer: {
    width: 80,
    height: 110,
  },
  gameCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.color4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.color5 + '60',
    fontSize: 12,
  },
  gameInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  gameName: {
    color: Colors.color5,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color4,
    padding: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ratingLabel: {
    color: Colors.color5 + '80',
    fontSize: 13,
  },
  gameRating: {
    color: Colors.color5,
    fontSize: 15,
    fontWeight: '600',
  },
  noRating: {
    color: Colors.color5 + '60',
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    color: Colors.color5 + '80',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.color5,
    marginTop: 12,
    fontSize: 16,
  },
}); 