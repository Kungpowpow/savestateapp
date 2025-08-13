import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { ProfileData } from '@/types/user';

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.slug) return;
    
    try {
      setLoading(true);
      const data = await getUserProfile(user.slug);
      setProfileData(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.color5} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>@{profileData.user.username}</Text>
          <Text style={styles.name}>{profileData.user.name}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date(profileData.user.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.total_reviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.quick_ratings}</Text>
              <Text style={styles.statLabel}>Quick Ratings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.total_lists}</Text>
              <Text style={styles.statLabel}>Lists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.collection_size}</Text>
              <Text style={styles.statLabel}>Collection</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.wishlist_size}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profileData.stats.total_activities}</Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
          </View>
        </View>

        {/* Follow Stats */}
        <View style={styles.followStatsContainer}>
          <View style={styles.followStat}>
            <Text style={styles.followNumber}>{profileData.stats.followers_count}</Text>
            <Text style={styles.followLabel}>Followers</Text>
          </View>
          <View style={styles.followStat}>
            <Text style={styles.followNumber}>{profileData.stats.following_count}</Text>
            <Text style={styles.followLabel}>Following</Text>
          </View>
        </View>

        {/* Average Rating */}
        {profileData.stats.average_rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.sectionTitle}>Average Rating</Text>
            <Text style={styles.averageRating}>
              {profileData.stats.average_rating.toFixed(1)}/5.0
            </Text>
          </View>
        )}

        {/* Top Genres */}
        {profileData.stats.most_played_genres && profileData.stats.most_played_genres.length > 0 && (
          <View style={styles.genresContainer}>
            <Text style={styles.sectionTitle}>Most Played Genres</Text>
            <View style={styles.genresList}>
              {profileData.stats.most_played_genres.slice(0, 5).map((genre: any, index: number) => (
                <View key={index} style={styles.genreItem}>
                  <Text style={styles.genreName}>{genre.name}</Text>
                  <Text style={styles.genreCount}>{genre.count} games</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.color4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: Colors.color5,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    color: Colors.color5 + 'CC',
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: Colors.color5 + '80',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: Colors.color3,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.color5 + 'CC',
    textAlign: 'center',
  },
  followStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.color3,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  followStat: {
    alignItems: 'center',
  },
  followNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 4,
  },
  followLabel: {
    fontSize: 16,
    color: Colors.color5 + 'CC',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  averageRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.color2,
  },
  genresContainer: {
    marginBottom: 24,
  },
  genresList: {
    backgroundColor: Colors.color3,
    borderRadius: 12,
    padding: 16,
  },
  genreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.color4 + '30',
  },
  genreName: {
    fontSize: 16,
    color: Colors.color5,
    fontWeight: '500',
  },
  genreCount: {
    fontSize: 14,
    color: Colors.color5 + '80',
  },
});
