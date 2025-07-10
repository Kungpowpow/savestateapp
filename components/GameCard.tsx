import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { getCoverImage } from '@/utils/igdbImages';

interface GameCardProps {
  game: {
    id: number;
    igdb_id: number;
    name: string;
    cover_url?: string;
    release_date?: string;
    rating?: number;
  };
  showRating?: boolean;
  onPress?: () => void;
}

export default function GameCard({ game, showRating = false, onPress }: GameCardProps) {
  const router = useRouter();
  const segments = useSegments();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Use segments[1] to get the current tab segment (trending, inventory, search, activity, or profile)
      const currentSegment = segments[1];
      if (currentSegment && ['(trending)', '(inventory)', '(search)', '(activity)', '(profile)'].includes(currentSegment)) {
        router.push({
          pathname: `/(tabs)/${currentSegment}/(game)/[id]` as any,
          params: { id: game.igdb_id }
        });
      } else {
        // Fallback to trending if no valid segment found
        router.push({
          pathname: '/(tabs)/(trending)/(game)/[id]',
          params: { id: game.igdb_id }
        });
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        {game.cover_url ? (
          <Image 
            source={{ 
              uri: getCoverImage(game.cover_url, 'logo_med')
            }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {game.name}
        </Text>
        
        {game.release_date && (
          <Text style={styles.year}>
            {formatDate(game.release_date)}
          </Text>
        )}
        
        {showRating && game.rating && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              ★ {typeof game.rating === 'number' ? game.rating.toFixed(1) : String(game.rating)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.color3,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '48%',
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.color1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.color5 + '60',
    fontSize: 14,
  },
  content: {
    padding: 8,
  },
  title: {
    color: Colors.color5,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  year: {
    color: Colors.color5 + '80',
    fontSize: 12,
  },
  ratingContainer: {
    marginTop: 4,
  },
  rating: {
    color: Colors.color5,
    fontSize: 12,
    fontWeight: '500',
  },
}); 