import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, FlatList, Image, ActivityIndicator, Pressable } from 'react-native';
import { Colors } from '../../../constants/Colors';
import { useIGDBStore } from '../../../store/igdbStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const { tokens, fetchAndStoreTokens } = useIGDBStore();

  const searchGames = async (query: string) => {
    if (!query.trim() || !tokens) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': tokens.client_id,
          'Authorization': `Bearer ${tokens.access_token}`,
        },
        body: `search "${query}";
              fields name,rating,cover.url;
              limit 20;
              where version_parent = null;`
      });

      const data = await response.json();
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
      if (error instanceof Error && error.message.includes('401')) {
        await fetchAndStoreTokens();
      }
    } finally {
      setLoading(false);
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search games..."
          placeholderTextColor={Colors.color5 + '80'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => searchGames(searchQuery)}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.color5} />
          <Text style={styles.loadingText}>Searching games...</Text>
        </View>
      ) : (
        <FlatList
          data={games}
          renderItem={renderGameItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.gameList}
          contentContainerStyle={styles.gameListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No games found' : 'Search for your favorite games'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
    // paddingBottom: 100
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.color3,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color5 + '20',
  },
  searchInput: {
    backgroundColor: Colors.color4,
    padding: 16,
    borderRadius: 12,
    color: Colors.color5,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  gameList: {
    flex: 1,
  },
  gameListContent: {
    padding: 16,
    paddingBottom: 70,
  },
  gameItem: {
    flexDirection: 'row',
    backgroundColor: Colors.color3,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameCoverContainer: {
    width: 120,
    height: 160,
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
    padding: 16,
    justifyContent: 'space-between',
  },
  gameName: {
    color: Colors.color5,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.color4,
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  ratingLabel: {
    color: Colors.color5 + '80',
    fontSize: 14,
  },
  gameRating: {
    color: Colors.color5,
    fontSize: 16,
    fontWeight: '600',
  },
  noRating: {
    color: Colors.color5 + '60',
    fontSize: 14,
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
});
