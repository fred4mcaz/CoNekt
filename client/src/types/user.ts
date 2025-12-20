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

