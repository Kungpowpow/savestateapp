export interface User {
  id: number;
  name: string;
  username: string;
  slug: string;
  created_at: string;
  isFollowing: boolean;
}

export interface UserStats {
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

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  slug: string;
  created_at: string;
}

export interface ProfileData {
  user: UserProfile;
  stats: UserStats;
  is_following: boolean;
}