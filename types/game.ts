export interface Game {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  rating_count?: number;
  first_release_date?: number;
  cover?: {
    url: string;
  };
  platforms?: {
    name: string;
  }[];
  genres?: {
    name: string;
  }[];
  involved_companies?: {
    company: {
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }[];
  screenshots?: {
    url: string;
  }[];
  videos?: {
    video_id: string;
    name: string;
  }[];
  age_ratings?: {
    rating: number;
    category: number;
  }[];
  similar_games?: {
    id: number;
    name: string;
    cover?: {
      url: string;
    };
  }[];
  total_rating?: number;
  game_modes?: {
    name: string;
  }[];
  themes?: {
    name: string;
  }[];
}

export interface GameCategory {
  title: string;
  subtitle: string;
  icon: string;
  games: Game[];
  loading: boolean;
}

export interface PopularityPrimitive {
  id: number;
  game_id: number;
  popularity_type: number;
  value: number;
}