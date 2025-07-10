import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

// Map Colors to semantic names for better readability
const AppColors = {
  background: Colors.color4,     // Screen background
  surface: Colors.color1,        // Card/surface background
  primary: Colors.color2,        // Primary accent color
  secondary: Colors.color7,      // Secondary accent color
  text: Colors.color5,          // Primary text color
  textSecondary: Colors.color3,  // Secondary text color
  border: Colors.color3,        // Border color
  error: Colors.color7,         // Error color
};
import { useActivity } from '@/hooks/useActivity';
import { 
  Activity, 
  ActivityFeedType, 
  ActivityTypeLabels, 
  ActivityTypeIcons 
} from '@/types/activity';

//list friends and your activity.

const ActivityScreen = () => {
  const [activeTab, setActiveTab] = useState<ActivityFeedType>('following');
  const {
    userFeed,
    followingFeed,
    isLoading,
    error,
    refreshing,
    hasMoreUser,
    hasMoreFollowing,
    refreshFeed,
    loadMore,
    initializeFeeds,
    getFeedData,
    getHasMore,
    clearError
  } = useActivity();

  useEffect(() => {
    initializeFeeds();
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshFeed(activeTab);
  }, [activeTab, refreshFeed]);

  const handleLoadMore = useCallback(async () => {
    if (!isLoading && getHasMore(activeTab)) {
      await loadMore(activeTab);
    }
  }, [activeTab, isLoading, getHasMore, loadMore]);

  const handleTabChange = useCallback((tab: ActivityFeedType) => {
    setActiveTab(tab);
    clearError();
  }, [clearError]);

  const renderActivityItem = useCallback(({ item }: { item: Activity }) => {
    const iconName = ActivityTypeIcons[item.type] || 'information-circle';
    const label = ActivityTypeLabels[item.type] || 'Unknown Activity';
    
    return (
      <View style={styles.activityItem}>
        <View style={styles.activityHeader}>
          <View style={styles.activityIcon}>
                         <Ionicons name={iconName as any} size={20} color={AppColors.primary} />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.activityType}>{label}</Text>
          </View>
          <Text style={styles.timeStamp}>
            {formatTimeAgo(item.created_at)}
          </Text>
        </View>
        
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>{item.content}</Text>
          
          {item.game && (
            <View style={styles.gameInfo}>
              {item.game.cover_url && (
                <Image 
                  source={{ uri: item.game.cover_url }} 
                  style={styles.gameImage}
                  resizeMode="cover"
                />
              )}
              <Text style={styles.gameName}>{item.game.name}</Text>
            </View>
          )}
          
          {item.metadata?.count && item.metadata.count > 1 && (
            <Text style={styles.aggregateCount}>
              +{item.metadata.count - 1} more
            </Text>
          )}
        </View>
      </View>
    );
  }, []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Ionicons 
        name={activeTab === 'following' ? 'people-outline' : 'person-outline'} 
        size={64} 
                 color={AppColors.textSecondary} 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'following' ? 'No Following Activity' : 'No Recent Activity'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'following' 
          ? 'Follow other users to see their activity here' 
          : 'Start adding games to your collection to see activity'}
      </Text>
    </View>
  ), [activeTab]);

  const renderFooter = useCallback(() => {
    if (!isLoading || refreshing) return null;
    
    return (
      <View style={styles.loadingFooter}>
                 <ActivityIndicator size="small" color={AppColors.primary} />
      </View>
    );
  }, [isLoading, refreshing]);

  const renderError = useCallback(() => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }, [error, handleRefresh]);

  const feedData = getFeedData(activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View> */}

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'following' && styles.activeSegment
          ]}
          onPress={() => handleTabChange('following')}
        >
          <Text style={[
            styles.segmentText,
            activeTab === 'following' && styles.activeSegmentText
          ]}>
            Following
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'you' && styles.activeSegment
          ]}
          onPress={() => handleTabChange('you')}
        >
          <Text style={[
            styles.segmentText,
            activeTab === 'you' && styles.activeSegmentText
          ]}>
            You
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderError()}
      
      <FlatList
        data={feedData}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={!isLoading && !error ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
                       colors={[AppColors.primary]}
           tintColor={AppColors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

// Utility function to format time ago
const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: AppColors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeSegment: {
    backgroundColor: AppColors.primary,
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
  },
  activeSegmentText: {
    color: AppColors.background,
  },
  listContainer: {
    padding: 16,
  },
  activityItem: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  activityType: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  timeStamp: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  activityContent: {
    marginLeft: 52,
  },
  activityText: {
    fontSize: 16,
    color: AppColors.text,
    lineHeight: 22,
  },
  gameInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: AppColors.background,
    borderRadius: 8,
  },
  gameImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.text,
    flex: 1,
  },
  aggregateCount: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: AppColors.error,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: AppColors.background,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: AppColors.background,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: AppColors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityScreen;
