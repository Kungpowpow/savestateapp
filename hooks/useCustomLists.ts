import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';

interface CustomList {
  id: number;
  user_id: string;
  type: 'game';
  title: string;
  description?: string;
  visibility: 'public' | 'private' | 'friends';
  created_at: string;
  updated_at: string;
  items?: ListItem[];
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
  game?: {
    id: number;
    igdb_id: number;
    name: string;
    cover_url?: string;
    release_date?: string;
    rating?: number;
  };
}

interface CreateListData {
  title: string;
  description?: string;
  visibility: 'public' | 'private' | 'friends';
}

interface UpdateListData {
  title: string;
  description?: string;
  visibility: 'public' | 'private' | 'friends';
}

interface ReorderData {
  item_orders: Array<{
    id: number;
    order: number;
  }>;
}

export function useCustomLists() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch custom lists
  const customLists = useQuery<{ data: CustomList[]; success: boolean; message: string | null }>({
    queryKey: ['customLists'],
    queryFn: async () => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/custom`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch custom lists');
      }

      return response.json();
    },
    enabled: !!session?.access_token,
  });

  // Mutation to create a new custom list
  const createList = useMutation({
    mutationFn: async (data: CreateListData) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLists'] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  // Mutation to update a custom list
  const updateList = useMutation({
    mutationFn: async ({ listId, data }: { listId: number; data: UpdateListData }) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/custom/${listId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLists'] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  // Mutation to delete a custom list
  const deleteList = useMutation({
    mutationFn: async (listId: number) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/custom/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLists'] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  // Mutation to add a game to a custom list
  const addGameToList = useMutation({
    mutationFn: async ({ gameId, listId, note, rank }: { gameId: number; listId: number; note?: string; rank?: number }) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game_id: gameId,
          type: 'game',
          list_id: listId,
          note,
          rank,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add game to list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLists'] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  // Mutation to remove a game from a custom list
  const removeGameFromList = useMutation({
    mutationFn: async ({ listId, gameId }: { listId: number; gameId: number }) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/custom/${listId}/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove game from list');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLists'] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  // Mutation to reorder list items
  const reorderListItems = useMutation({
    mutationFn: async ({ listId, data }: { listId: number; data: ReorderData }) => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/lists/custom/${listId}/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder list items');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customLists'] });
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });

  return {
    customLists,
    createList,
    updateList,
    deleteList,
    addGameToList,
    removeGameFromList,
    reorderListItems,
  };
} 