import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';

type ListType = 'wishlist' | 'game' | 'collection' | 'backlog';

interface List {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

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
}

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  rating?: number;
  // ... other game properties
}

interface AddToListParams {
  game_id: number;
  type: ListType;
  note?: string;
  rank?: number;
}

interface GameListResponse {
  data: {
    backlog: boolean;
    collection: boolean;
    game: boolean;
    wishlist: boolean;
  };
  message: string | null;
  success: boolean;
}

export function useGameLists(gameId: number) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Query to check if game is in each list type
  const listStatuses = useQuery<GameListResponse>({
    queryKey: ['gameListStatus', gameId],
    queryFn: async () => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/u/${session?.user.slug}/checklists/${gameId}/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch list statuses');
      }
      //response example = {"data": {"backlog": true, "collection": true, "game": false, "wishlist": true}, "message": null, "success": true}
      return response.json();
    },
    enabled: !!session?.access_token,
  });

  // Add game to list
  const addToList = useMutation({
    mutationFn: async (params: AddToListParams): Promise<ListItem> => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to add game to list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameListStatus', gameId] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  // Remove game from list
  const removeFromList = useMutation({
    mutationFn: async ({ type }: { type: ListType }): Promise<void> => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/items/${gameId}/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove game from list');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gameListStatus', gameId] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  return {
    listStatuses,
    addToList,
    removeFromList,
    isInWishlist: () => listStatuses.data?.data?.wishlist ?? false,
    isInCollection: () => listStatuses.data?.data?.collection ?? false,
    isInBacklog: () => listStatuses.data?.data?.backlog ?? false,
    isInGame: () => listStatuses.data?.data?.game ?? false,
  };
}