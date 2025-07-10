export type ActivityType = 
  // Game Collection Actions
  | 'game_added_to_collection'
  | 'game_removed_from_collection'
  | 'game_added_to_wishlist'
  | 'game_added_to_backlog'
  // Review & Rating Actions
  | 'review_posted'
  | 'review_updated'
  | 'rating_given'
  | 'rating_updated'
  // Game List Actions
  | 'list_created'
  | 'list_updated'
  | 'custom_list_created'
  | 'game_added_to_custom_list'
  // Game Progress Actions
  | 'game_completed'
  | 'game_started'
  | 'game_abandoned'
  // Social Actions
  | 'user_followed'
  | 'user_unfollowed'
  // Interaction Actions
  | 'liked_review'
  | 'liked_list'
  | 'commented_on_review'
  | 'commented_on_list';

export type ActivityVisibility = 'public' | 'private';

export interface ActivityUser {
  id: number;
  name: string;
  username: string;
  slug: string;
}

export interface ActivityGame {
  id: number;
  name: string;
  igdb_id: string;
  cover_url?: string;
  release_date?: string;
}

export interface ActivityMetadata {
  [key: string]: any;
  // Common metadata fields
  count?: number;
  games?: string[];
  time_range?: {
    start: string;
    end: string;
  };
  // Activity-specific metadata
  collection_type?: string;
  action?: string;
  review_id?: number;
  rating?: number;
  list_id?: number;
  list_title?: string;
  target_user_id?: number;
  target_username?: string;
  target_type?: string;
  target_id?: number;
  interaction_type?: string;
  original?: any;
}

export interface Activity {
  id: number;
  user_id: number;
  game_id?: number;
  type: ActivityType;
  content: string;
  visibility: ActivityVisibility;
  metadata?: ActivityMetadata;
  created_at: string;
  updated_at: string;
  // Relationships
  user: ActivityUser;
  game?: ActivityGame;
}

export interface ActivityFeedResponse {
  data: Activity[];
  has_more: boolean;
  cursor?: string;
}

export interface ActivityStats {
  total_activities: number;
  games_added: number;
  reviews_written: number;
  ratings_given: number;
  lists_created: number;
  users_followed: number;
  most_active_day?: string;
}

export interface ActivitySearchResponse {
  data: Activity[];
  query: string;
}

export interface UserActivitiesResponse {
  data: Activity[];
  user: {
    id: number;
    username: string;
    name: string;
  };
}

// Activity type mappings for UI
export const ActivityTypeLabels: Record<ActivityType, string> = {
  'game_added_to_collection': 'Added to Collection',
  'game_removed_from_collection': 'Removed from Collection',
  'game_added_to_wishlist': 'Added to Wishlist',
  'game_added_to_backlog': 'Added to Backlog',
  'review_posted': 'Posted Review',
  'review_updated': 'Updated Review',
  'rating_given': 'Rated Game',
  'rating_updated': 'Updated Rating',
  'list_created': 'Created List',
  'list_updated': 'Updated List',
  'custom_list_created': 'Created Custom List',
  'game_added_to_custom_list': 'Added to Custom List',
  'game_completed': 'Completed Game',
  'game_started': 'Started Game',
  'game_abandoned': 'Abandoned Game',
  'user_followed': 'Followed User',
  'user_unfollowed': 'Unfollowed User',
  'liked_review': 'Liked Review',
  'liked_list': 'Liked List',
  'commented_on_review': 'Commented on Review',
  'commented_on_list': 'Commented on List',
};

export const ActivityTypeIcons: Record<ActivityType, string> = {
  'game_added_to_collection': 'game-controller',
  'game_removed_from_collection': 'game-controller',
  'game_added_to_wishlist': 'game-controller',
  'game_added_to_backlog': 'game-controller',
  'review_posted': 'edit',
  'review_updated': 'edit',
  'rating_given': 'star',
  'rating_updated': 'star',
  'list_created': 'list',
  'list_updated': 'list',
  'custom_list_created': 'list',
  'game_added_to_custom_list': 'list',
  'game_completed': 'checkmark-circle',
  'game_started': 'play-circle',
  'game_abandoned': 'close-circle',
  'user_followed': 'person-add',
  'user_unfollowed': 'person-add',
  'liked_review': 'heart',
  'liked_list': 'heart',
  'commented_on_review': 'chatbubble',
  'commented_on_list': 'chatbubble',
};

// Activity feed types
export type ActivityFeedType = 'following' | 'you';

export interface ActivityFeedParams {
  type: ActivityFeedType;
  limit?: number;
  cursor?: string;
} 