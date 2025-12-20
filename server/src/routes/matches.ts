import express from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { findMatches } from "../services/matching";
import {
  generateRecommendedActivity,
  generateConversationStarters,
} from "../services/llm";

const router = express.Router();

// Get top matches for current user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    console.log(`📥 GET /matches - User ID: ${req.userId}`);
    const matches = await findMatches(req.userId!, 3);

    if (matches.length === 0) {
      console.log("⚠️ No matches found - returning empty array");
      return res.json({ matches: [] });
    }

    // Fetch full user profiles for each match
    const matchResults = await Promise.all(
      matches.map(async (match) => {
        const user = await prisma.user.findUnique({
          where: { id: match.user.id },
          select: {
            id: true,
            name: true,
            age: true,
            location: true,
            career: true,
            interests: true,
            keystoneValues: true,
            favoriteBooks: true,
            favoriteAuthors: true,
            relationshipGoals: true,
            culturalUpbringing: true,
            lifePhilosophy: true,
            whatImLookingFor: true,
            hobbies: true,
            preferredCommunicationStyle: true,
          },
        });

        if (!user) {
          console.error(`⚠️ User ${match.user.id} not found in database`);
          return null;
        }

        return {
          user,
          compatibilityScore: match.compatibilityScore,
          matchFactors: match.matchFactors,
          recommendedActivity: match.recommendedActivity,
          conversationStarters: match.conversationStarters,
        };
      })
    );

    // Filter out null results
    const validMatches = matchResults.filter((m) => m !== null);
    console.log(`✅ Returning ${validMatches.length} matches`);
    res.json({ matches: validMatches });
  } catch (error: any) {
    console.error("❌ Get matches error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message || "Failed to fetch matches"
    });
  }
});

// Refresh matches
router.post("/refresh", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const matches = await findMatches(req.userId!, 3);

    const matchResults = await Promise.all(
      matches.map(async (match) => {
        const user = await prisma.user.findUnique({
          where: { id: match.user.id },
          select: {
            id: true,
            name: true,
            age: true,
            location: true,
            career: true,
            interests: true,
            keystoneValues: true,
            favoriteBooks: true,
            favoriteAuthors: true,
            relationshipGoals: true,
            culturalUpbringing: true,
            lifePhilosophy: true,
            whatImLookingFor: true,
            hobbies: true,
            preferredCommunicationStyle: true,
          },
        });

        return {
          user,
          compatibilityScore: match.compatibilityScore,
          matchFactors: match.matchFactors,
          recommendedActivity: match.recommendedActivity,
          conversationStarters: match.conversationStarters,
        };
      })
    );

    res.json({ matches: matchResults });
  } catch (error) {
    console.error("Refresh matches error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get match details for specific user
router.get("/:userId", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const match = await prisma.match.findFirst({
      where: {
        OR: [
          { user1Id: req.userId, user2Id: req.params.userId },
          { user1Id: req.params.userId, user2Id: req.userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            age: true,
            location: true,
            career: true,
            interests: true,
            keystoneValues: true,
            favoriteBooks: true,
            favoriteAuthors: true,
            relationshipGoals: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            age: true,
            location: true,
            career: true,
            interests: true,
            keystoneValues: true,
            favoriteBooks: true,
            favoriteAuthors: true,
            relationshipGoals: true,
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    const otherUser = match.user1Id === req.userId ? match.user2 : match.user1;

    res.json({
      user: otherUser,
      compatibilityScore: match.compatibilityScore,
      matchFactors: match.matchFactors,
      recommendedActivity: match.recommendedActivity,
      conversationStarters: match.conversationStarters,
    });
  } catch (error) {
    console.error("Get match details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test endpoint for LLM functionality (no auth required)
router.get("/test/llm", async (req, res) => {
  try {
    console.log("🧪 Testing LLM functionality via API endpoint");

    // Test users
    const user1 = {
      name: "Alice",
      career: "Software Engineer",
      interests: "Reading, hiking, technology",
      keystoneValues: "Curiosity, honesty, growth",
      hobbies: "Rock climbing, coding side projects",
      favoriteBooks: "Sapiens, Clean Code",
      lifePhilosophy: "Continuous learning and helping others",
    };

    const user2 = {
      name: "Bob",
      career: "UX Designer",
      interests: "Design, psychology, art",
      keystoneValues: "Empathy, creativity, balance",
      hobbies: "Drawing, meditation, travel",
      favoriteBooks: "The Design of Everyday Things, Thinking Fast and Slow",
      lifePhilosophy: "Design should serve human needs",
    };

    const activity = await generateRecommendedActivity(user1, user2);
    const conversationStarters = await generateConversationStarters(
      user1,
      user2
    );

    res.json({
      success: true,
      message: "LLM test completed",
      data: {
        activity,
        conversationStarters,
      },
    });
  } catch (error) {
    console.error("LLM test failed:", error);
    res.status(500).json({
      success: false,
      message: "LLM test failed",
      error: error.message,
    });
  }
});

export default router;
