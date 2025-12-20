import prisma from "../utils/prisma";
import {
  generateRecommendedActivity,
  generateConversationStarters,
} from "./llm";

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
function calculateTextSimilarity(
  text1: string | null,
  text2: string | null
): number {
  if (!text1 || !text2) return 0;

  const words1 = new Set(
    text1
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
  const words2 = new Set(
    text2
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

// Calculate compatibility score between two users
function calculateCompatibility(
  user1: UserProfile,
  user2: UserProfile
): {
  score: number;
  factors: string[];
} {
  let totalScore = 0;
  let weightSum = 0;
  const factors: string[] = [];

  // Value alignment (0.25 weight)
  if (user1.keystoneValues && user2.keystoneValues) {
    const valueScore = calculateTextSimilarity(
      user1.keystoneValues,
      user2.keystoneValues
    );
    totalScore += valueScore * 0.25;
    weightSum += 0.25;
    if (valueScore > 0.3) factors.push("Shared values");
  }

  // Interest convergence (0.20 weight)
  let interestScore = 0;
  if (user1.interests && user2.interests) {
    interestScore = calculateTextSimilarity(user1.interests, user2.interests);
    totalScore += interestScore * 0.2;
    weightSum += 0.2;
    if (interestScore > 0.3) factors.push("Common interests");
  }

  // Books/authors similarity
  if (user1.favoriteBooks && user2.favoriteBooks) {
    const bookScore = calculateTextSimilarity(
      user1.favoriteBooks,
      user2.favoriteBooks
    );
    totalScore += bookScore * 0.1;
    weightSum += 0.1;
    if (bookScore > 0.3) factors.push("Similar reading preferences");
  }

  // Cultural/background compatibility (0.15 weight)
  if (user1.culturalUpbringing && user2.culturalUpbringing) {
    const cultureScore = calculateTextSimilarity(
      user1.culturalUpbringing,
      user2.culturalUpbringing
    );
    totalScore += cultureScore * 0.15;
    weightSum += 0.15;
    if (cultureScore > 0.3) factors.push("Similar background");
  }

  // Professional synergy (0.15 weight)
  if (user1.career && user2.career) {
    const careerScore = calculateTextSimilarity(user1.career, user2.career);
    totalScore += careerScore * 0.15;
    weightSum += 0.15;
    if (careerScore > 0.3) factors.push("Professional alignment");
  }

  // Relationship goal alignment (0.25 weight)
  if (user1.relationshipGoals && user2.relationshipGoals) {
    const goalScore = calculateTextSimilarity(
      user1.relationshipGoals,
      user2.relationshipGoals
    );
    totalScore += goalScore * 0.25;
    weightSum += 0.25;
    if (goalScore > 0.3) factors.push("Aligned relationship goals");
  }

  // Age proximity bonus (if both have age)
  if (user1.age && user2.age) {
    const ageDiff = Math.abs(user1.age - user2.age);
    const ageScore = Math.max(0, 1 - ageDiff / 20); // Within 20 years = good match
    totalScore += ageScore * 0.1;
    weightSum += 0.1;
    if (ageScore > 0.7) factors.push("Similar age range");
  }

  const finalScore = weightSum > 0 ? totalScore / weightSum : 0;

  return {
    score: Math.min(1, finalScore),
    factors: factors.length > 0 ? factors : ["Potential for connection"],
  };
}

// Find matches for a user (optimized for speed)
export async function findMatches(
  userId: string,
  limit: number = 3
): Promise<MatchResult[]> {
  console.log(`🔍 Finding matches for user: ${userId}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check for existing matches in database first (fast path)
  const existingMatches = await prisma.match.findMany({
    where: {
      user1Id: userId,
    },
    include: {
      user2: true,
    },
    orderBy: {
      compatibilityScore: "desc",
    },
    take: limit,
  });

  // If we have recent matches, return them quickly
  if (existingMatches.length >= limit) {
    console.log(
      `⚡ Using cached matches from database (${existingMatches.length} matches)`
    );
    return existingMatches.map((match) => ({
      user: match.user2 as UserProfile,
      compatibilityScore: match.compatibilityScore
        ? Number(match.compatibilityScore)
        : 0,
      matchFactors: (match.matchFactors as string[]) || [],
      recommendedActivity:
        match.recommendedActivity ||
        "Have a meaningful conversation about your shared interests and values",
      conversationStarters: match.conversationStarters || [
        "What's something you've been curious about or exploring lately?",
        "What does a meaningful connection look like to you?",
      ],
    }));
  }

  // Get all other active users
  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      isActive: true,
    },
  });

  console.log(`📊 Found ${otherUsers.length} other active users in database`);

  if (otherUsers.length === 0) {
    console.log(
      "⚠️ No other users found in database. Cannot generate matches."
    );
    return [];
  }

  // STEP 1: Calculate compatibility scores for ALL users (fast, no LLM)
  const compatibilityScores: Array<{
    user: UserProfile;
    score: number;
    factors: string[];
  }> = [];

  for (const otherUser of otherUsers) {
    try {
      const { score, factors } = calculateCompatibility(
        user as UserProfile,
        otherUser as UserProfile
      );
      compatibilityScores.push({
        user: otherUser as UserProfile,
        score,
        factors,
      });
    } catch (error) {
      console.error(
        `❌ Error calculating compatibility with ${otherUser.name}:`,
        error
      );
    }
  }

  // STEP 2: Sort by score and get top matches
  compatibilityScores.sort((a, b) => b.score - a.score);
  const topMatches = compatibilityScores.slice(0, limit);

  console.log(
    `💫 Top ${topMatches.length} matches identified, generating LLM content...`
  );

  // STEP 3: Generate LLM content ONLY for top matches (in parallel with short timeout)
  const matches: MatchResult[] = await Promise.all(
    topMatches.map(async ({ user: otherUser, score, factors }) => {
      // Use fallback immediately, try LLM in background with short timeout
      let recommendedActivity = generateFallbackActivity(
        user as UserProfile,
        otherUser as UserProfile
      );
      let conversationStarters = generateFallbackConversationStarters(
        user as UserProfile,
        otherUser as UserProfile
      );

      // Try to enhance with LLM, but don't wait long
      try {
        const llmResults = (await Promise.race([
          Promise.all([
            generateRecommendedActivity(
              user as UserProfile,
              otherUser as UserProfile
            ),
            generateConversationStarters(
              user as UserProfile,
              otherUser as UserProfile
            ),
          ]),
          new Promise<[string, string[]]>(
            (_, reject) =>
              setTimeout(() => reject(new Error("LLM timeout")), 5000) // 5 second timeout
          ),
        ])) as [string, string[]];

        recommendedActivity = llmResults[0];
        conversationStarters = llmResults[1];
        console.log(`✅ LLM content generated for ${otherUser.name}`);
      } catch (llmError) {
        // Silently use fallbacks - already set above
        console.log(
          `⏩ Using fallback content for ${otherUser.name} (LLM timeout/failed)`
        );
      }

      return {
        user: otherUser,
        compatibilityScore: score,
        matchFactors: factors,
        recommendedActivity,
        conversationStarters,
      };
    })
  );

  // STEP 4: Store matches in database (async, don't wait)
  Promise.all(
    matches.map((match) =>
      prisma.match
        .upsert({
          where: {
            user1Id_user2Id: {
              user1Id: userId,
              user2Id: match.user.id,
            },
          },
          create: {
            user1Id: userId,
            user2Id: match.user.id,
            compatibilityScore: match.compatibilityScore,
            matchFactors: match.matchFactors as any,
            recommendedActivity: match.recommendedActivity,
            conversationStarters: match.conversationStarters,
          },
          update: {
            compatibilityScore: match.compatibilityScore,
            matchFactors: match.matchFactors as any,
            recommendedActivity: match.recommendedActivity,
            conversationStarters: match.conversationStarters,
          },
        })
        .catch((error) => {
          console.error("Error storing match:", error);
        })
    )
  ).catch(() => {
    // Ignore storage errors
  });

  console.log(`✅ Generated ${matches.length} matches in optimized time`);
  return matches;
}

// Fallback activity generator (no LLM)
function generateFallbackActivity(
  user1: UserProfile,
  user2: UserProfile
): string {
  if (user1.favoriteBooks || user2.favoriteBooks) {
    return "Read a book together and discuss its key themes and insights";
  }
  if (user1.career || user2.career) {
    return "Collaborate on a small project or share professional insights";
  }
  if (user1.lifePhilosophy || user2.lifePhilosophy) {
    return "Have a deep conversation about life philosophy and worldviews";
  }
  if (user1.hobbies || user2.hobbies) {
    return "Explore a shared hobby or try something new together";
  }
  return "Have a meaningful conversation about your shared interests and values";
}

// Fallback conversation starters generator (no LLM)
function generateFallbackConversationStarters(
  user1: UserProfile,
  user2: UserProfile
): string[] {
  const questions: string[] = [];

  if (user1.keystoneValues && user2.keystoneValues) {
    questions.push(
      "What's a core value that has shaped how you navigate challenges?"
    );
  }
  if (user1.interests || user2.interests) {
    questions.push(
      "What's something you've been curious about or exploring lately?"
    );
  }
  if (user1.lifePhilosophy || user2.lifePhilosophy) {
    questions.push(
      "What's a perspective or idea that changed how you see the world?"
    );
  }
  if (user1.relationshipGoals || user2.relationshipGoals) {
    questions.push("What does a meaningful connection look like to you?");
  }
  if (
    user1.favoriteBooks ||
    user2.favoriteBooks ||
    user1.favoriteAuthors ||
    user2.favoriteAuthors
  ) {
    questions.push(
      "What's a book or idea that has deeply influenced your thinking?"
    );
  }

  // Ensure we always have at least 3 questions
  if (questions.length === 0) {
    questions.push("What's a question that's been on your mind lately?");
    questions.push("What experience has shaped who you are today?");
    questions.push("What are you most curious about exploring?");
  }

  return questions.slice(0, 5);
}
