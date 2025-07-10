import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';

interface ListItem {
  id: number;
  user_id: string;
  list_id: number;
  game_id: number;
  note?: string;
  rank?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
  game?: {
    id: number;
    name: string;
    cover_url?: string;
    release_date?: string;
    rating?: number;
  };
}

interface GameList {
  id: number;
  user_id: string;
  type: 'wishlist' | 'game' | 'collection' | 'backlog';
  title?: string;
  description?: string;
  visibility: 'public' | 'private' | 'friends';
  created_at: string;
  updated_at: string;
  items?: ListItem[];
}

interface UserListsResponse {
  data: GameList[];
  message: string | null;
  success: boolean;
}

export function useUserLists() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch user's lists with items
  const userLists = useQuery<UserListsResponse>({
    queryKey: ['userLists'],
    queryFn: async () => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user lists');
      }

      return response.json();
    },
    enabled: !!session?.access_token,
  });

  // Get specific list by type
  const getListByType = (type: 'wishlist' | 'game' | 'collection' | 'backlog') => {
    return userLists.data?.data?.find(list => list.type === type);
  };

  // Get wishlist items
  const getWishlistItems = () => {
    const wishlist = getListByType('wishlist');
    return wishlist?.items || [];
  };

  // Get collection items
  const getCollectionItems = () => {
    const collection = getListByType('collection');
    return collection?.items || [];
  };

  // Get backlog items
  const getBacklogItems = () => {
    const backlog = getListByType('backlog');
    return backlog?.items || [];
  };

  // Get game list items
  const getGameListItems = () => {
    const gameList = getListByType('game');
    return gameList?.items || [];
  };

  return {
    userLists,
    getListByType,
    getWishlistItems,
    getCollectionItems,
    getBacklogItems,
    getGameListItems,
  };
} 