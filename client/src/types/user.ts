export interface User {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  gender?: string | null;
  culturalUpbringing?: string | null;
  nationality?: string | null;
  location?: any;
  career?: string | null;
  industry?: string | null;
  skills?: string | null;
  experienceLevel?: string | null;
  careerGoals?: string | null;
  favoriteBooks?: string | null;
  favoriteAuthors?: string | null;
  favoriteMovies?: string | null;
  favoriteTvShows?: string | null;
  favoriteSpeakers?: string | null;
  hobbies?: string | null;
  interests?: string | null;
  keystoneValues?: string | null;
  lifePhilosophy?: string | null;
  whatImLookingFor?: string | null;
  relationshipGoals?: string | null;
  preferredCommunicationStyle?: string | null;
  availability?: string | null;
  // New profile questions
  currentFocus?: string | null;
  connectionValue?: string | null;
  currentObsession?: string | null;
  endlessTopic?: string | null;
  curiousThoughts?: string | null;
  energizingConversations?: string | null;
  excitedInConversation?: string | null;
  conversationComfort?: string | null;
  handlingTension?: string | null;
  presenceTriggers?: string | null;
  groundingPractices?: string | null;
  patternsToMoveBeyond?: string | null;
  growthThroughChallenge?: string | null;
  connectionComfortLevel?: string | null;
  buildExploreCreate?: string | null;
  closingOffTriggers?: string | null;
  feelingMostMyself?: string | null;
  profileCompleteness?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Match {
  user: User;
  compatibilityScore: number;
  matchFactors: string[];
  recommendedActivity: string;
  conversationStarters: string[];
}


