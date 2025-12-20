import prisma from '../utils/prisma';

interface UserProfile {
  id: string;
  name: string;
  age?: number | null;
  location?: any;
  career?: string | null;
  interests?: string | null;
  keystoneValues?: string | null;
  favoriteBooks?: string | null;
  favoriteAuthors?: string | null;
  relationshipGoals?: string | null;
  culturalUpbringing?: string | null;
  lifePhilosophy?: string | null;
  whatImLookingFor?: string | null;
  hobbies?: string | null;
  preferredCommunicationStyle?: string | null;
  [key: string]: any;
}

interface MatchResult {
  user: UserProfile;
  compatibilityScore: number;
  matchFactors: string[];
  recommendedActivity: string;
  conversationStarters: string[];
}

// Simple text similarity function (Jaccard-like on words)
function calculateTextSimilarity(text1: string | null, text2: string | null): number {
  if (!text1 || !text2) return 0;
  
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

// Calculate compatibility score between two users
function calculateCompatibility(user1: UserProfile, user2: UserProfile): {
  score: number;
  factors: string[];
} {
  let totalScore = 0;
  let weightSum = 0;
  const factors: string[] = [];

  // Value alignment (0.25 weight)
  if (user1.keystoneValues && user2.keystoneValues) {
    const valueScore = calculateTextSimilarity(user1.keystoneValues, user2.keystoneValues);
    totalScore += valueScore * 0.25;
    weightSum += 0.25;
    if (valueScore > 0.3) factors.push('Shared values');
  }

  // Interest convergence (0.20 weight)
  let interestScore = 0;
  if (user1.interests && user2.interests) {
    interestScore = calculateTextSimilarity(user1.interests, user2.interests);
    totalScore += interestScore * 0.20;
    weightSum += 0.20;
    if (interestScore > 0.3) factors.push('Common interests');
  }
  
  // Books/authors similarity
  if (user1.favoriteBooks && user2.favoriteBooks) {
    const bookScore = calculateTextSimilarity(user1.favoriteBooks, user2.favoriteBooks);
    totalScore += bookScore * 0.10;
    weightSum += 0.10;
    if (bookScore > 0.3) factors.push('Similar reading preferences');
  }

  // Cultural/background compatibility (0.15 weight)
  if (user1.culturalUpbringing && user2.culturalUpbringing) {
    const cultureScore = calculateTextSimilarity(user1.culturalUpbringing, user2.culturalUpbringing);
    totalScore += cultureScore * 0.15;
    weightSum += 0.15;
    if (cultureScore > 0.3) factors.push('Similar background');
  }

  // Professional synergy (0.15 weight)
  if (user1.career && user2.career) {
    const careerScore = calculateTextSimilarity(user1.career, user2.career);
    totalScore += careerScore * 0.15;
    weightSum += 0.15;
    if (careerScore > 0.3) factors.push('Professional alignment');
  }

  // Relationship goal alignment (0.25 weight)
  if (user1.relationshipGoals && user2.relationshipGoals) {
    const goalScore = calculateTextSimilarity(user1.relationshipGoals, user2.relationshipGoals);
    totalScore += goalScore * 0.25;
    weightSum += 0.25;
    if (goalScore > 0.3) factors.push('Aligned relationship goals');
  }

  // Age proximity bonus (if both have age)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    const ageScore = Math.max(0, 1 - ageDiff / 20); // Within 20 years = good match
    totalScore += ageScore * 0.10;
    weightSum += 0.10;
    if (ageScore > 0.7) factors.push('Similar age range');
  }

  const finalScore = weightSum > 0 ? totalScore / weightSum : 0;

  return {
    score: Math.min(1, finalScore),
    factors: factors.length > 0 ? factors : ['Potential for connection']
  };
}

// Generate recommended activity
function generateActivity(user1: UserProfile, user2: UserProfile): string {
  const activities: string[] = [];

  // Check for book interests
  if (user1.favoriteBooks || user2.favoriteBooks) {
    activities.push('Read a book together and discuss its key themes and insights');
  }

  // Check for career/professional interests
  if (user1.career || user2.career) {
    activities.push('Collaborate on a small project or share professional insights');
  }

  // Check for philosophical interests
  if (user1.lifePhilosophy || user2.lifePhilosophy) {
    activities.push('Have a deep conversation about life philosophy and worldviews');
  }

  // Check for creative hobbies
  if (user1.hobbies || user2.hobbies) {
    activities.push('Explore a shared hobby or try something new together');
  }

  // Default
  if (activities.length === 0) {
    activities.push('Have a meaningful conversation about your shared interests and values');
  }

  return activities[0]; // Return first relevant activity
}

// Generate conversation starters
function generateConversationStarters(user1: UserProfile, user2: UserProfile): string[] {
  const questions: string[] = [];

  // Value-based questions
  if (user1.keystoneValues && user2.keystoneValues) {
    questions.push('What\'s a core value that has shaped how you navigate challenges?');
  }

  // Interest-based questions
  if (user1.interests || user2.interests) {
    questions.push('What\'s something you\'ve been curious about or exploring lately?');
  }

  // Philosophy/life questions
  if (user1.lifePhilosophy || user2.lifePhilosophy) {
    questions.push('What\'s a perspective or idea that changed how you see the world?');
  }

  // Relationship goal questions
  if (user1.relationshipGoals || user2.relationshipGoals) {
    questions.push('What does a meaningful connection look like to you?');
  }

  // Book/learning questions
  if (user1.favoriteBooks || user2.favoriteBooks || user1.favoriteAuthors || user2.favoriteAuthors) {
    questions.push('What\'s a book or idea that has deeply influenced your thinking?');
  }

  // Default questions
  if (questions.length === 0) {
    questions.push('What\'s a question that\'s been on your mind lately?');
    questions.push('What experience has shaped who you are today?');
    questions.push('What are you most curious about exploring?');
  }

  return questions.slice(0, 5); // Return up to 5 questions
}

// Find matches for a user
export async function findMatches(userId: string, limit: number = 3): Promise<MatchResult[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get all other active users
  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      isActive: true
    }
  });

  // Calculate compatibility with each user
  const matches: MatchResult[] = [];

  for (const otherUser of otherUsers) {
    const { score, factors } = calculateCompatibility(user as UserProfile, otherUser as UserProfile);
    
    matches.push({
      user: otherUser as UserProfile,
      compatibilityScore: score,
      matchFactors: factors,
      recommendedActivity: generateActivity(user as UserProfile, otherUser as UserProfile),
      conversationStarters: generateConversationStarters(user as UserProfile, otherUser as UserProfile)
    });
  }

  // Sort by compatibility score and return top matches
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  // Store matches in database
  for (const match of matches.slice(0, limit)) {
    try {
      await prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: userId,
            user2Id: match.user.id
          }
        },
        create: {
          user1Id: userId,
          user2Id: match.user.id,
          compatibilityScore: match.compatibilityScore,
          matchFactors: match.matchFactors as any,
          recommendedActivity: match.recommendedActivity,
          conversationStarters: match.conversationStarters
        },
        update: {
          compatibilityScore: match.compatibilityScore,
          matchFactors: match.matchFactors as any,
          recommendedActivity: match.recommendedActivity,
          conversationStarters: match.conversationStarters
        }
      });
    } catch (error) {
      console.error('Error storing match:', error);
      // Continue with other matches even if one fails
    }
  }

  return matches.slice(0, limit);
}

