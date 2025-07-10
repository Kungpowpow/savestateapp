import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useFollowing } from '@/context/following';

interface UserCardProps {
  user: {
    id: number;
    name: string;
    username: string;
    slug: string;
    created_at: string;
    avatarUrl?: string;
    isFollowing?: boolean;
  };
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  followLoading?: boolean;
  showFollowButton?: boolean;
}

export default function UserCard({ 
  user, 
  isFollowing, 
  onToggleFollow, 
  followLoading = false,
  showFollowButton = true 
}: UserCardProps) {
  const { isFollowing: isFollowingUser } = useFollowing();
  // Use the isFollowing prop if provided, otherwise use global state, or fall back to user's isFollowing property
  const followingStatus = isFollowing !== undefined ? isFollowing : isFollowingUser(user.id);
  return (
    <View style={styles.container}>
      <Link
        push
        href={`/(tabs)/(profile)/${user.slug}`}
        style={styles.userInfo}
      >
        <View style={styles.avatarContainer}>
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.username}> {user.username} </Text>
          <Text style={styles.name}>{user.name}</Text>
        </View>
      </Link>
      {showFollowButton && onToggleFollow && (
        <Pressable
          style={[styles.followButton, followingStatus && styles.followingButton]}
          onPress={onToggleFollow}
          disabled={followLoading}
        >
          <Text style={styles.followButtonText}>
            {followingStatus ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // backgroundColor: Colors.color3,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    minHeight: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.color2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.color4,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.color5,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    color: Colors.color5 + '99',
  },
  followButton: {
    backgroundColor: '#0A84FF',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  followingButton: {
    backgroundColor: Colors.color4,
    borderWidth: 1,
    borderColor: '#0A84FF',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
}); 