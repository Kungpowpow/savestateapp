import { useEffect, useState, useRef } from 'react';
import { Text, View, StyleSheet, Image, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useIGDBToken } from '@/hooks/useIGDBToken';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import GameHeader from '@/components/headers/GameHeader';
import { useGameRating } from '@/hooks/useGameRating';
import { useGameLists } from '@/hooks/useGameLists';
import { getCoverImage, getScreenshotImage } from '@/utils/igdbImages';

//todo add floating options button

interface GameDetails {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  rating_count?: number;
  first_release_date?: number;
  cover?: {
    url: string;
  };
  platforms?: {
    name: string;
  }[];
  genres?: {
    name: string;
  }[];
  involved_companies?: {
    company: {
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }[];
  screenshots?: {
    url: string;
  }[];
  videos?: {
    video_id: string;
    name: string;
  }[];
  age_ratings?: {
    rating: number;
    category: number;
  }[];
  similar_games?: {
    id: number;
    name: string;
    cover?: {
      url: string;
    };
  }[];
  total_rating?: number;
  game_modes?: {
    name: string;
  }[];
  themes?: {
    name: string;
  }[];
}

export default function GameScreen() {
  const { id } = useLocalSearchParams();
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: tokens } = useIGDBToken();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { rating } = useGameRating(Number(id), true);
  const { listStatuses } = useGameLists(Number(id));
  useEffect(() => {
    fetchGameDetails();
  }, [id, tokens]);

  const fetchGameDetails = async () => {
    if (!tokens) return;

    try {
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-ID': tokens.client_id,
          'Authorization': `Bearer ${tokens.access_token}`,
        },
        body: `
          fields name, summary, storyline, rating, rating_count, first_release_date,
          cover.url, platforms.name, genres.name, screenshots.url, videos.*,
          age_ratings.*, similar_games.name, similar_games.cover.url,
          involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
          total_rating, game_modes.name, themes.name;
          where id = ${id};
        `
      });

      const data = await response.json();
      setGame(data[0]);
    } catch (error) {
      console.error('Error fetching game details:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderListStatuses = () => {
    if (listStatuses.isLoading) {
      return (
        <View style={styles.listStatusContainer}>
          <ActivityIndicator size="small" color={Colors.color5} />
        </View>
      );
    }

    if (listStatuses.isError) {
      return null; // Or show an error state if preferred
    }

    if (!listStatuses.data?.data) {
      return null;
    }

    const { wishlist, collection, backlog, game } = listStatuses.data.data;

    return (
      <View style={styles.listStatusContainer}>
        {wishlist && (
          <View style={styles.listStatus}>
            <MaterialCommunityIcons name="heart" size={20} color={Colors.color5} />
            <Text style={styles.listStatusText}>In Wishlist</Text>
          </View>
        )}
        {collection && (
          <View style={styles.listStatus}>
            <MaterialCommunityIcons name="bookmark" size={20} color={Colors.color5} />
            <Text style={styles.listStatusText}>In Collection</Text>
          </View>
        )}
        {backlog && (
          <View style={styles.listStatus}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.color5} />
            <Text style={styles.listStatusText}>In Backlog</Text>
          </View>
        )}
        {game && (
          <View style={styles.listStatus}>
            <MaterialCommunityIcons name="ribbon" size={20} color={Colors.color5} />
            <Text style={styles.listStatusText}>In Games</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.color5} />
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load game details</Text>
      </View>
    );
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Release date unknown';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <GameHeader title={game.name} id={game.id} first_release_date={game.first_release_date} scrollY={scrollY} />
      <Animated.ScrollView
        style={styles.container}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {game.cover?.url && (
          <View>
          <Image
            source={{ 
              uri: getCoverImage(game.cover.url)
            }}
            style={styles.coverImage}
          />
          <LinearGradient 
            colors={[
              'transparent',
              'rgba(19, 19, 30, 0.1)',
              'rgba(19, 19, 30, 0.3)',
              'rgba(19, 19, 30, 0.5)',
              'rgba(19, 19, 30, 0.7)',
              'rgba(19, 19, 30, 0.9)',
              'rgba(19, 19, 30, 1)',
            ]} 
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: 150
            }}
          />
          </View>
        )}
        <View style={{ paddingBottom: 80 }}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{game.name}</Text>

          {game.rating && (
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={24} color={Colors.color5} />
              <Text style={styles.rating}>
                {Math.round(game.rating)}% ({game.rating_count} ratings)
              </Text>
            </View>
          )}

          {renderListStatuses()}

          <Text style={styles.releaseDate}>
            {formatDate(game.first_release_date)}
          </Text>

          {game.genres && game.genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genres</Text>
              <View style={styles.tagsContainer}>
                {game.genres.map((genre, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {game.platforms && game.platforms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Platforms</Text>
              <View style={styles.tagsContainer}>
                {game.platforms.map((platform, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{platform.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {game.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.description}>{game.summary}</Text>
            </View>
          )}

          {game.storyline && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Storyline</Text>
              <Text style={styles.description}>{game.storyline}</Text>
            </View>
          )}

          {game.involved_companies && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Companies</Text>
              {game.involved_companies.map((company, index) => (
                <Text key={index} style={styles.companyText}>
                  {company.company.name} - {company.developer ? 'Developer' : company.publisher ? 'Publisher' : 'Involved Company'}
                </Text>
              ))}
            </View>
          )}
        </View>

        {game.screenshots && game.screenshots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screenshots</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {game.screenshots.map((screenshot, index) => (
                <Image
                  key={index}
                  source={{ 
                    uri: getScreenshotImage(screenshot.url)
                  }}
                  style={styles.screenshotImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {game.themes && game.themes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Themes</Text>
            <View style={styles.tagsContainer}>
              {game.themes.map((theme, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{theme.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {game.game_modes && game.game_modes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Modes</Text>
            <View style={styles.tagsContainer}>
              {game.game_modes.map((mode, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{mode.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {game.similar_games && game.similar_games.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Games</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {game.similar_games.map((similarGame, index) => (
                <View key={index} style={styles.similarGameCard}>
                  {similarGame.cover?.url && (
                    <Image
                      source={{ 
                        uri: getCoverImage(similarGame.cover.url)
                      }}
                      style={styles.similarGameCover}
                    />
                  )}
                  <Text style={styles.similarGameName} numberOfLines={2}>
                    {similarGame.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
    paddingBottom: 500
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.color4,
  },
  loadingText: {
    color: Colors.color5,
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.color4,
  },
  errorText: {
    color: Colors.color5,
    fontSize: 16,
  },
  coverImage: {
    width: '100%',
    height: 310,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 20,
    // backgroundColor: Colors.color4,
    // marginTop: -50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    color: Colors.color5,
    fontSize: 18,
    marginLeft: 8,
  },
  releaseDate: {
    color: Colors.color5 + '80',
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 10,
  },
  description: {
    color: Colors.color5,
    fontSize: 16,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: Colors.color3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: Colors.color5,
    fontSize: 14,
  },
  companyText: {
    color: Colors.color5,
    fontSize: 16,
    marginBottom: 5,
  },
  screenshotImage: {
    width: 200,
    height: 150,
    resizeMode: 'cover',
    marginRight: 10,
  },
  similarGameCard: {
    width: 150,
    marginRight: 10,
  },
  similarGameCover: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  similarGameName: {
    color: Colors.color5,
    fontSize: 16,
    marginTop: 5,
  },
  listStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  listStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  listStatusText: {
    color: Colors.color5,
    fontSize: 16,
    marginLeft: 5,
  },
});