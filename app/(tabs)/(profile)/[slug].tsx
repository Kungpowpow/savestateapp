import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserProfile, toggleFollowUser } from '@/lib/api';
import { useAuth } from '@/context/auth';
import { useFollowing } from '@/context/following';

interface UserStats {
  total_reviews: number;
  quick_ratings: number;
  average_rating: number;
  total_lists: number;
  collection_size: number;
  wishlist_size: number;
  most_played_genres: any[];
  total_activities: number;
  followers_count: number;
  following_count: number;
}

interface UserProfile {
  id: number;
  name: string;
  username: string;
  slug: string;
  created_at: string;
}

interface ProfileData {
  user: UserProfile;
  stats: UserStats;
  is_following: boolean;
}

export default function UserProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user: currentUser } = useAuth();
  const { toggleFollowing, setFollowing, isFollowing: isFollowingUser } = useFollowing();
  const router = useRouter();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      loadUserProfile();
    }
  }, [slug]);



  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile(slug);
      setProfileData(data);
      // Update global following state when profile loads
      if (data) {
        setFollowing(data.user.id, data.is_following);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to follow users');
      return;
    }

    if (!profileData) return;

    try {
      setFollowLoading(true);
      const response = await toggleFollowUser(profileData.user.slug);
      // Update global following state
      toggleFollowing(profileData.user.id);
      setProfileData(prev => prev ? {
        ...prev,
        is_following: response.following,
        stats: {
          ...prev.stats,
          followers_count: response.following 
            ? prev.stats.followers_count + 1 
            : prev.stats.followers_count - 1
        }
      } : null);
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to follow/unfollow user');
    } finally {
      setFollowLoading(false);
    }
  };

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
          <Text style={styles.errorText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnProfile = currentUser?.id === profileData.user.id;
  // Use global following state if available, otherwise fall back to profile data
  const followingStatus = profileData ? isFollowingUser(profileData.user.id) : false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>@{profileData.user.username}</Text>
          <Text style={styles.name}>{profileData.user.name}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date(profileData.user.created_at).toLocaleDateString()}
          </Text>
          
          {!isOwnProfile && (
            <Pressable
              style={[
                styles.followButton,
                followingStatus && styles.followingButton
              ]}
              onPress={handleToggleFollow}
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={Colors.color4} />
              ) : (
                <Text style={styles.followButtonText}>
                  {followingStatus ? 'Following' : 'Follow'}
                </Text>
              )}
            </Pressable>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Stats</Text>
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
      </ScrollView>
    </SafeAreaView>
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
  followButton: {
    backgroundColor: Colors.color2,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: Colors.color3,
  },
  followButtonText: {
    color: Colors.color4,
    fontSize: 16,
    fontWeight: '600',
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
  },
  averageRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.color2,
  },
}); 