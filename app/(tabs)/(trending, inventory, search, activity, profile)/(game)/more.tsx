import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated } from 'react-native';
import { useRouter, useLocalSearchParams, useSegments } from 'expo-router';
import { Octicons } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating-widget';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { useGameLists } from '@/hooks/useGameLists';
import { useGameRating } from '@/hooks/useGameRating';

export default function MoreOptionsScreen() {
  const router = useRouter();
  const segments = useSegments();
  const currentSegment = segments[1];
  const insets = useSafeAreaInsets();
  const { title, first_release_date, id } = useLocalSearchParams();
  const { rating, updateRating } = useGameRating(Number(id), true);
  const [localRating, setLocalRating] = useState(0);
  const { listStatuses, addToList, removeFromList, isInWishlist, isInCollection, isInBacklog } = useGameLists(Number(id));
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
 
  const displayYear = new Date(Number(first_release_date) * 1000).getFullYear();

  useEffect(() => {
    setLocalRating(rating);
  }, [rating]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handleContentPress = (e: any) => {
    e.stopPropagation();
  };

  const handleRatingChange = (newRating: number) => {
    setLocalRating(newRating);
    updateRating({
      gameId: Number(id),
      rating: newRating,
    });
  };

  const handleWishlistToggle = async () => {
    try {
      if (isInWishlist()) {
        await removeFromList.mutateAsync({ type: 'wishlist' });
      } else {
        await addToList.mutateAsync({ 
          game_id: Number(id),
          type: 'wishlist'
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleCollectionToggle = async () => {
    try {
      if (isInCollection()) {
        await removeFromList.mutateAsync({ type: 'collection' });
      } else {
        await addToList.mutateAsync({ 
          game_id: Number(id),
          type: 'collection'
        });
      }
    } catch (error) {
      console.error('Error toggling collection:', error);
    }
  };

  const handleBacklogToggle = async () => {
    try {
      if (isInBacklog()) {
        await removeFromList.mutateAsync({ type: 'backlog' });
      } else {
        await addToList.mutateAsync({ 
          game_id: Number(id),
          type: 'backlog'
        });
      }
    } catch (error) {
      console.error('Error toggling backlog:', error);
    }
  };

  const handleAddToList = () => {
    router.push({
      pathname: `/(tabs)/${currentSegment}/add-to-list` as any,
      params: { 
        gameId: id,
        gameTitle: title
      }
    });
  };

  return (
    <Animated.View 
      style={[styles.overlay, { opacity: fadeAnim }]}
    >
      <Pressable 
        style={styles.dismissArea}
        onPress={closeModal}
      >
        <Animated.View 
          style={[
            styles.content,
            { 
              paddingBottom: insets.bottom,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Pressable onPress={handleContentPress} style={{  }}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.year}>{displayYear}</Text>
            </View>

            <View style={styles.optionsContainer}>
              <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.toggleButton, 
                      isInWishlist() && styles.toggleButtonActive
                    ]}
                    onPress={handleWishlistToggle}
                  >
                    <Octicons 
                      name={isInWishlist() ? "heart-fill" : "heart"} 
                      size={24} 
                      color={Colors.color5}
                    />
                    <Text style={styles.toggleText}>Wishlist</Text>
                  </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    isInCollection() && styles.toggleButtonActive
                  ]}
                  onPress={handleCollectionToggle}
                >
                  <Octicons 
                    name={"bookmark"} 
                    size={24} 
                    color={Colors.color5}
                  />
                  <Text style={styles.toggleText}>Collection</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.toggleButton, 
                    isInBacklog() && styles.toggleButtonActive
                  ]}
                  onPress={handleBacklogToggle}
                >
                  <Octicons 
                    name={"checklist"} 
                    size={24} 
                    color={Colors.color5}
                  />
                  <Text style={styles.toggleText}>Backlog</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ratingSection}>
                <Text style={styles.ratingTitle}>
                  {localRating > 0 ? 'Rated' : 'Rate'}
                </Text>
                <StarRating
                  rating={localRating}
                  onChange={handleRatingChange}
                  starSize={32}
                  color={Colors.color5}
                  emptyColor={Colors.color5 + '20'}
                  enableHalfStar={true}
                  animationConfig={{
                    scale: 1.2,
                    duration: 300,
                    delay: 300,
                  }}
                  style={styles.starRating}
                />
              </View>

              <TouchableOpacity style={styles.option} onPress={handleAddToList}>
                <Octicons name="bookmark" size={24} color={Colors.color5} />
                <Text style={styles.optionText}>Add to list</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <Octicons name="image" size={24} color={Colors.color5} />
                <Text style={styles.optionText}>Write a review</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <Octicons name="share" size={24} color={Colors.color5} />
                <Text style={styles.optionText}>Share</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.doneButton}
              onPress={closeModal}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  dismissArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.color1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: Colors.color5,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  year: {
    color: Colors.color5 + '80',
    fontSize: 16,
    marginTop: 4,
  },
  optionsContainer: {
    backgroundColor: Colors.color3,
    borderRadius: 12,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color1,
  },
  optionText: {
    color: Colors.color5,
    fontSize: 16,
    marginLeft: 15,
    flex: 1,
  },
  patronBadge: {
    backgroundColor: Colors.color2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  patronText: {
    color: Colors.color5,
    fontSize: 12,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: Colors.color3,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneText: {
    color: Colors.color5,
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color1,
    alignItems: 'center',
  },
  starRating: {
    paddingVertical: 8,
  },
  ratingTitle: {
    color: Colors.color5 + '80',
    fontSize: 14,
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color1,
  },
  toggleButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    width: '30%',
    backgroundColor: Colors.color3,
  },
  toggleButtonActive: {
    backgroundColor: Colors.color2,
  },
  toggleText: {
    color: Colors.color5,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
}); 