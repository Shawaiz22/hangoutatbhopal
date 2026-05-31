export interface QuizAnswers {
  mood: string;
  company: string;
  budget: string;
  distance: string;
}

export interface GeminiSuggestion {
  name: string;
  category: string;
  tagline: string;
  why: string;
  address: string;
  googleMapsQuery: string;
  estimatedBudget: string;
  bestTimeToVisit: string;
  mustTry: string;
  weatherSuitability: string;
  vibeScore: number;
}

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_address?: string;
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  reviews?: GoogleReview[];
  formatted_phone_number?: string;
  website?: string;
  open_now?: boolean;
  lat?: number;
  lng?: number;
}

export interface CommuteOption {
  duration: string;
  distance: string;
  summary: string;
}

export interface CommuteDetails {
  walking: CommuteOption;
  driving: CommuteOption;
  transit?: CommuteOption;
}

export interface CombinedPlace {
  suggestion: GeminiSuggestion;
  details: PlaceDetails | null;
  commute: CommuteDetails | null;
  olaLink: string | null;
  googleMapsLink: string;
}

export interface WeatherInfo {
  temperature: number;
  weathercode: number;
  windspeed: number;
  description: string;
  emoji: string;
}
