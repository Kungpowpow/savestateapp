import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { 
  Activity, 
  ActivityFeedResponse, 
  ActivityFeedType, 
  ActivityStats, 
  ActivitySearchResponse,
  UserActivitiesResponse
} from '@/types/activity';

export const useActivity = () => {
  const [userFeed, setUserFeed] = useState<Activity[]>([]);
  const [followingFeed, setFollowingFeed] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination states
  const [userCursor, setUserCursor] = useState<string | null>(null);
  const [followingCursor, setFollowingCursor] = useState<string | null>(null);
  const [hasMoreUser, setHasMoreUser] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);

  /**
   * Fetch user's own activities
   */
  const fetchUserFeed = useCallback(async (refresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cursor = refresh ? null : userCursor;
      const response = await api.get<ActivityFeedResponse>('/activity/user', {
        params: { cursor, limit: 20 }
      });

      if (refresh) {
        setUserFeed(response.data.data);
      } else {
        setUserFeed(prev => [...prev, ...response.data.data]);
      }

      setUserCursor(response.data.cursor || null);
      setHasMoreUser(response.data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activities');
    } finally {
      setIsLoading(false);
    }
  }, [userCursor]);

  /**
   * Fetch activities from followed users
   */
  const fetchFollowingFeed = useCallback(async (refresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cursor = refresh ? null : followingCursor;
      const response = await api.get<ActivityFeedResponse>('/activity/following', {
        params: { cursor, limit: 20 }
      });

      if (refresh) {
        setFollowingFeed(response.data.data);
      } else {
        setFollowingFeed(prev => [...prev, ...response.data.data]);
      }

      setFollowingCursor(response.data.cursor || null);
      setHasMoreFollowing(response.data.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch following activities');
    } finally {
      setIsLoading(false);
    }
  }, [followingCursor]);

  /**
   * Fetch activity statistics
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get<ActivityStats>('/activity/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch activity stats:', err);
    }
  }, []);

  /**
   * Search activities
   */
  const searchActivities = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get<ActivitySearchResponse>('/activity/search', {
        params: { q: query, limit: 20 }
      });

      return response.data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search activities');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get activities for a specific user
   */
  const getUserActivities = useCallback(async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get<UserActivitiesResponse>(`/users/${userId}/activities`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activities');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh a specific feed
   */
  const refreshFeed = useCallback(async (type: ActivityFeedType) => {
    setRefreshing(true);
    
    try {
      if (type === 'you') {
        await fetchUserFeed(true);
      } else {
        await fetchFollowingFeed(true);
      }
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserFeed, fetchFollowingFeed]);

  /**
   * Load more activities for a specific feed
   */
  const loadMore = useCallback(async (type: ActivityFeedType) => {
    if (isLoading) return;
    
    const hasMore = type === 'you' ? hasMoreUser : hasMoreFollowing;
    if (!hasMore) return;

    if (type === 'you') {
      await fetchUserFeed(false);
    } else {
      await fetchFollowingFeed(false);
    }
  }, [isLoading, hasMoreUser, hasMoreFollowing, fetchUserFeed, fetchFollowingFeed]);

  /**
   * Initialize feeds
   */
  const initializeFeeds = useCallback(async () => {
    await Promise.all([
      fetchUserFeed(true),
      fetchFollowingFeed(true),
      fetchStats()
    ]);
  }, [fetchUserFeed, fetchFollowingFeed, fetchStats]);

  /**
   * Get feed data by type
   */
  const getFeedData = useCallback((type: ActivityFeedType) => {
    return type === 'you' ? userFeed : followingFeed;
  }, [userFeed, followingFeed]);

  /**
   * Get has more status by type
   */
  const getHasMore = useCallback((type: ActivityFeedType) => {
    return type === 'you' ? hasMoreUser : hasMoreFollowing;
  }, [hasMoreUser, hasMoreFollowing]);

  return {
    // Data
    userFeed,
    followingFeed,
    stats,
    
    // States
    isLoading,
    error,
    refreshing,
    hasMoreUser,
    hasMoreFollowing,
    
    // Actions
    fetchUserFeed,
    fetchFollowingFeed,
    fetchStats,
    searchActivities,
    getUserActivities,
    refreshFeed,
    loadMore,
    initializeFeeds,
    getFeedData,
    getHasMore,
    
    // Utilities
    clearError: () => setError(null),
  };
};

export default useActivity; 