import OpenAI from "openai";
import fetch from "cross-fetch";
import { FormData } from "formdata-node";

// Polyfill Headers and FormData for Node.js
if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = fetch.Headers;
}
if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = FormData;
}

// Lazy initialization of OpenAI client
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
      );
    }
    openai = new OpenAI({ apiKey, fetch: fetch as any });
  }
  return openai;
}

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
  // New profile fields
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
  [key: string]: any;
}

/**
 * Generate a recommended activity for two users to do together
 */
export async function generateRecommendedActivity(
  user1: UserProfile,
  user2: UserProfile
): Promise<string> {
  try {
    console.log(
      "🤖 Generating AI activity for:",
      user1.name,
      "and",
      user2.name
    );
    const prompt = `Based on these two people's profiles, suggest ONE specific, meaningful activity they could do together to build their connection. Keep it practical, engaging, and tailored to their interests and backgrounds.

Person 1 (${user1.name}):
- Connection type: ${user1.relationshipGoals || "Not specified"}
- Current focus: ${user1.currentFocus || "Not specified"}
- Current obsession: ${user1.currentObsession || "Not specified"}
- Endless topic: ${user1.endlessTopic || "Not specified"}
- Curious thoughts: ${user1.curiousThoughts || "Not specified"}
- Energizing conversations: ${user1.energizingConversations || "Not specified"}
- Conversation comfort: ${user1.conversationComfort || "Not specified"}
- Presence triggers: ${user1.presenceTriggers || "Not specified"}
- Growth areas: ${user1.growthThroughChallenge || "Not specified"}
- Build/explore/create: ${user1.buildExploreCreate || "Not specified"}

Person 2 (${user2.name}):
- Connection type: ${user2.relationshipGoals || "Not specified"}
- Current focus: ${user2.currentFocus || "Not specified"}
- Current obsession: ${user2.currentObsession || "Not specified"}
- Endless topic: ${user2.endlessTopic || "Not specified"}
- Curious thoughts: ${user2.curiousThoughts || "Not specified"}
- Energizing conversations: ${user2.energizingConversations || "Not specified"}
- Conversation comfort: ${user2.conversationComfort || "Not specified"}
- Presence triggers: ${user2.presenceTriggers || "Not specified"}
- Growth areas: ${user2.growthThroughChallenge || "Not specified"}
- Build/explore/create: ${user2.buildExploreCreate || "Not specified"}

Suggest one creative, specific activity that would help them connect meaningfully. Keep it to 1-2 sentences. Focus on shared interests or complementary strengths.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    const activity = response.choices[0]?.message?.content?.trim();

    if (!activity) {
      throw new Error("No activity generated");
    }

    console.log("✅ AI activity generated successfully");
    return activity;
  } catch (error) {
    console.error(
      "❌ Error generating AI activity, using fallback:",
      error.message
    );

    // Fallback to rule-based generation
    return generateFallbackActivity(user1, user2);
  }
}

/**
 * Generate conversation starter questions for two users
 */
export async function generateConversationStarters(
  user1: UserProfile,
  user2: UserProfile
): Promise<string[]> {
  try {
    console.log(
      "🤖 Generating AI conversation starters for:",
      user1.name,
      "and",
      user2.name
    );
    const prompt = `Based on these two people's profiles, create 3-5 thoughtful conversation starter questions that would help them connect on a deeper level. The questions should be open-ended, meaningful, and tailored to their shared interests, values, or backgrounds.

Person 1 (${user1.name}):
- Connection type: ${user1.relationshipGoals || "Not specified"}
- Current focus: ${user1.currentFocus || "Not specified"}
- Current obsession: ${user1.currentObsession || "Not specified"}
- Endless topic: ${user1.endlessTopic || "Not specified"}
- Curious thoughts: ${user1.curiousThoughts || "Not specified"}
- Energizing conversations: ${user1.energizingConversations || "Not specified"}
- Conversation comfort: ${user1.conversationComfort || "Not specified"}
- Presence triggers: ${user1.presenceTriggers || "Not specified"}
- Growth areas: ${user1.growthThroughChallenge || "Not specified"}
- Build/explore/create: ${user1.buildExploreCreate || "Not specified"}

Person 2 (${user2.name}):
- Connection type: ${user2.relationshipGoals || "Not specified"}
- Current focus: ${user2.currentFocus || "Not specified"}
- Current obsession: ${user2.currentObsession || "Not specified"}
- Endless topic: ${user2.endlessTopic || "Not specified"}
- Curious thoughts: ${user2.curiousThoughts || "Not specified"}
- Energizing conversations: ${user2.energizingConversations || "Not specified"}
- Conversation comfort: ${user2.conversationComfort || "Not specified"}
- Presence triggers: ${user2.presenceTriggers || "Not specified"}
- Growth areas: ${user2.growthThroughChallenge || "Not specified"}
- Build/explore/create: ${user2.buildExploreCreate || "Not specified"}

Generate 3-5 conversation starter questions. Each question should be engaging and help them explore shared interests or values. Return them as a numbered list.`;

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No conversation starters generated");
    }

    // Parse the numbered list into an array
    const questions = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.match(/^\d+\./)) // Only lines that start with numbers
      .map((line) => line.replace(/^\d+\.\s*/, "")) // Remove the numbering
      .filter((question) => question.length > 10); // Filter out very short questions

    if (questions.length >= 3) {
      console.log("✅ AI conversation starters generated successfully");
      return questions.slice(0, 5); // Return up to 5 questions
    }

    throw new Error("Not enough questions generated");
  } catch (error) {
    console.error(
      "❌ Error generating AI conversation starters, using fallback:",
      error.message
    );

    // Fallback to rule-based generation
    return generateFallbackConversationStarters(user1, user2);
  }
}

// Fallback functions in case LLM fails
function generateFallbackActivity(
  user1: UserProfile,
  user2: UserProfile
): string {
  const activities: string[] = [];

  // Check for book interests
  if (user1.favoriteBooks || user2.favoriteBooks) {
    activities.push(
      "Read a book together and discuss its key themes and insights"
    );
  }

  // Check for career/professional interests
  if (user1.career || user2.career) {
    activities.push(
      "Collaborate on a small project or share professional insights"
    );
  }

  // Check for philosophical interests
  if (user1.lifePhilosophy || user2.lifePhilosophy) {
    activities.push(
      "Have a deep conversation about life philosophy and worldviews"
    );
  }

  // Check for creative hobbies
  if (user1.hobbies || user2.hobbies) {
    activities.push("Explore a shared hobby or try something new together");
  }

  // Default
  if (activities.length === 0) {
    activities.push(
      "Have a meaningful conversation about your shared interests and values"
    );
  }

  return activities[0];
}

function generateFallbackConversationStarters(
  user1: UserProfile,
  user2: UserProfile
): string[] {
  const questions: string[] = [];

  // Value-based questions
  if (user1.keystoneValues && user2.keystoneValues) {
    questions.push(
      "What's a core value that has shaped how you navigate challenges?"
    );
  }

  // Interest-based questions
  if (user1.interests || user2.interests) {
    questions.push(
      "What's something you've been curious about or exploring lately?"
    );
  }

  // Philosophy/life questions
  if (user1.lifePhilosophy || user2.lifePhilosophy) {
    questions.push(
      "What's a perspective or idea that changed how you see the world?"
    );
  }

  // Relationship goal questions
  if (user1.relationshipGoals || user2.relationshipGoals) {
    questions.push("What does a meaningful connection look like to you?");
  }

  // Book/learning questions
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

  // Default questions
  if (questions.length === 0) {
    questions.push("What's a question that's been on your mind lately?");
    questions.push("What experience has shaped who you are today?");
    questions.push("What are you most curious about exploring?");
  }

  return questions.slice(0, 5);
}
