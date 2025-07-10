import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';
import { useIGDBToken } from '@/hooks/useIGDBToken';
import { Ionicons } from '@expo/vector-icons';

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
  first_release_date?: number;
}

interface GameCategory {
  title: string;
  subtitle: string;
  icon: string;
  games: Game[];
  loading: boolean;
}

export default function SearchIndex() {
  const { data: tokens, refetch: refetchTokens } = useIGDBToken();
  const [categories, setCategories] = useState<GameCategory[]>([
    {
      title: 'Trending Games',
      subtitle: 'What\'s hot right now',
      icon: 'trending-up',
      games: [],
      loading: true,
    },
    {
      title: 'Popular This Week',
      subtitle: 'Most played games',
      icon: 'star',
      games: [],
      loading: true,
    },
    {
      title: 'Top Rated',
      subtitle: 'Highest rated games',
      icon: 'trophy',
      games: [],
      loading: true,
    },
    {
      title: 'Recently Released',
      subtitle: 'New games this month',
      icon: 'calendar',
      games: [],
      loading: true,
    },
  ]);

  const fetchGames = async (categoryIndex: number, query: string) => {
    if (!tokens) return;
    
    try {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': tokens.client_id,
          'Authorization': `Bearer ${tokens.access_token}`,
        },
        body: query
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          await refetchTokens();
          return;
        }
        throw new Error('Failed to fetch games');
      }
      
      const data = await response.json();
      setCategories(prev => prev.map((cat, index) => 
        index === categoryIndex 
          ? { ...cat, games: data, loading: false }
          : cat
      ));
    } catch (error) {
      console.error('Error fetching games:', error);
      setCategories(prev => prev.map((cat, index) => 
        index === categoryIndex 
          ? { ...cat, loading: false }
          : cat
      ));
    }
  };

  useEffect(() => {
    if (tokens) {
      // Trending games (based on rating and popularity)
      fetchGames(0, 'fields name,rating,cover.url,first_release_date; where version_parent = null & rating != null; sort rating desc; limit 10;');
      
      // Popular this week (based on release date and rating)
      const now = Math.floor(Date.now() / 1000);
      const weekAgo = now - (7 * 24 * 60 * 60);
      fetchGames(1, `fields name,rating,cover.url,first_release_date; where version_parent = null & first_release_date >= ${weekAgo}; sort rating desc; limit 10;`);
      
      // Top rated games
      fetchGames(2, 'fields name,rating,cover.url,first_release_date; where version_parent = null & rating != null; sort rating desc; limit 10;');
      
      // Recently released (last 30 days)
      const monthAgo = now - (30 * 24 * 60 * 60);
      fetchGames(3, `fields name,rating,cover.url,first_release_date; where version_parent = null & first_release_date >= ${monthAgo}; sort first_release_date desc; limit 10;`);
    }
  }, [tokens]);

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
      <Text style={styles.gameName} numberOfLines={2}>{item.name}</Text>
      {item.rating && (
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={12} color={Colors.color2} />
          <Text style={styles.ratingText}>{Math.round(item.rating)}%</Text>
        </View>
      )}
    </Link>
  );

  const renderCategory = ({ item, index }: { item: GameCategory; index: number }) => (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleContainer}>
          <Ionicons name={item.icon as any} size={24} color={Colors.color2} />
          <View style={styles.categoryTextContainer}>
            <Text style={styles.categoryTitle}>{item.title}</Text>
            <Text style={styles.categorySubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.color2} />
        </TouchableOpacity>
      </View>
      
      {item.loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={item.games}
          renderItem={renderGameItem}
          keyExtractor={(game) => game.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No games available</Text>
            </View>
          }
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
  },
  contentContainer: {
    paddingBottom: 70,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  categoryTitle: {
    color: Colors.color5,
    fontSize: 18,
    fontWeight: 'bold',
  },
  categorySubtitle: {
    color: Colors.color5 + '80',
    fontSize: 14,
    marginTop: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: Colors.color2,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  horizontalList: {
    paddingHorizontal: 8,
  },
  gameItem: {
    width: 120,
    marginHorizontal: 8,
    backgroundColor: Colors.color3,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gameCoverContainer: {
    width: '100%',
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
  gameName: {
    color: Colors.color5,
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
    paddingBottom: 4,
    lineHeight: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  ratingText: {
    color: Colors.color5,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.color5 + '80',
    fontSize: 14,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.color5 + '60',
    fontSize: 14,
  },
});
