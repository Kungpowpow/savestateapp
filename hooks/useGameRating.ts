import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import debounce from 'lodash/debounce';
import { useAuth } from '@/context/auth';

interface UpdateRatingParams {
  gameId: number;
  rating: number;
}

interface RatingSuccessResponse {
  success: true;
  message: null;
  data: {
    rating: number;
  };
}

interface RatingErrorResponse {
  success: false;
  message: string;
}

type RatingResponse = RatingSuccessResponse | RatingErrorResponse;

const RATING_QUERY_KEY = (gameId: number) => ['rating', gameId] as const;
const DEBOUNCE_DELAY = 1000;

export function useGameRating(gameId: number, enabled: boolean = true) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // Extract API calls to separate functions for reusability
  const fetchRating = useCallback(async (): Promise<RatingResponse> => {
    if (!session?.user?.slug) {
      throw new Error('User not authenticated');
    }
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/u/${session.user.slug}/games/${gameId}/rating`
    );
    return response.json();
  }, [gameId, session?.user?.slug]);

  // Main rating query with longer staleTime
  const rating = useQuery({
    queryKey: RATING_QUERY_KEY(gameId),
    queryFn: fetchRating,
    select: (data: RatingResponse) => data.success ? data.data.rating : 0,
    enabled: enabled && !!session?.access_token && !!session?.user.slug,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10,   // Keep in cache for 10 minutes
  });

  // Update rating mutation
  const updateRatingMutation = useMutation({
    mutationFn: async ({ rating }: Omit<UpdateRatingParams, 'gameId'>): Promise<RatingResponse> => {
      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://savestate.social/api'}/games/${gameId}/rating`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update rating');
      }
      return data;
    },
    onMutate: async ({ rating }) => {
      await queryClient.cancelQueries({ queryKey: RATING_QUERY_KEY(gameId) });
      const previousRating = queryClient.getQueryData(RATING_QUERY_KEY(gameId));
      
      // Optimistically update to the new value
      queryClient.setQueryData(RATING_QUERY_KEY(gameId), {
        success: true,
        message: null,
        data: { rating },
      });

      return { previousRating };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousRating) {
        queryClient.setQueryData(RATING_QUERY_KEY(gameId), context.previousRating);
      }
      console.error('Error updating rating:', err);
    },
    onSuccess: (data) => {
      // Only update the cache with the server response on success
      queryClient.setQueryData(RATING_QUERY_KEY(gameId), data);
    },
    onSettled: () => {
      // Refetch to ensure cache is in sync with server
      queryClient.invalidateQueries({ queryKey: RATING_QUERY_KEY(gameId) });
    },
  });

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce((params: UpdateRatingParams) => {
      updateRatingMutation.mutate({ rating: params.rating });
    }, DEBOUNCE_DELAY),
    [updateRatingMutation]
  );

  // Prefetch function
  const prefetchRating = useCallback(async () => {
    if (!session?.user?.slug) return;
    
    await queryClient.prefetchQuery({
      queryKey: RATING_QUERY_KEY(gameId),
      queryFn: fetchRating,
    });
  }, [gameId, session?.user?.slug, queryClient, fetchRating]);

  return {
    rating: rating.data ?? 0,
    isLoading: rating.isLoading,
    isError: rating.isError,
    error: rating.error,
    updateRating: debouncedUpdate,
    isUpdating: updateRatingMutation.isPending,
    prefetchRating,
  };
} 