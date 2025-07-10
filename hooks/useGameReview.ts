import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';

interface Review {
  id: number;
  game_id: number;
  user_id: string;
  rating: number;
  content?: string;
  created_at: string;
  updated_at: string;
}

interface CreateReviewParams {
  gameId: number;
  rating: number;
  content?: string;
}

export function useGameReview(gameId: number) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const review = useQuery({
    queryKey: ['review', gameId],
    queryFn: async (): Promise<Review | null> => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/games/${gameId}/review`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch review');
      }

      return response.json();
    },
    enabled: !!session?.access_token,
  });

  const updateReview = useMutation({
    mutationFn: async (params: CreateReviewParams): Promise<Review> => {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/games/${params.gameId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: params.rating,
          content: params.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['review', variables.gameId] 
      });
    },
  });

  return {
    review,
    updateReview,
  };
}