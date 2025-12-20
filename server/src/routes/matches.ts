import express from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { findMatches } from "../services/matching";

const router = express.Router();

// Get top matches for current user
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const matches = await findMatches(req.userId!, 3);

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
    console.error("Get matches error:", error);
    res.status(500).json({ error: "Internal server error" });
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

export default router;
