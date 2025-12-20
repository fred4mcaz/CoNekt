import express from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Get current user's full profile
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        culturalUpbringing: true,
        nationality: true,
        location: true,
        career: true,
        industry: true,
        skills: true,
        experienceLevel: true,
        careerGoals: true,
        favoriteBooks: true,
        favoriteAuthors: true,
        favoriteMovies: true,
        favoriteTvShows: true,
        favoriteSpeakers: true,
        hobbies: true,
        interests: true,
        keystoneValues: true,
        lifePhilosophy: true,
        whatImLookingFor: true,
        relationshipGoals: true,
        preferredCommunicationStyle: true,
        availability: true,
        profileCompleteness: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update current user's profile
router.put("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const updateData: any = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Calculate completeness
    updateData.profileCompleteness = calculateCompleteness({
      name: req.body.name || "",
      ...req.body,
    });

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        gender: true,
        culturalUpbringing: true,
        nationality: true,
        location: true,
        career: true,
        industry: true,
        skills: true,
        experienceLevel: true,
        careerGoals: true,
        favoriteBooks: true,
        favoriteAuthors: true,
        favoriteMovies: true,
        favoriteTvShows: true,
        favoriteSpeakers: true,
        hobbies: true,
        interests: true,
        keystoneValues: true,
        lifePhilosophy: true,
        whatImLookingFor: true,
        relationshipGoals: true,
        preferredCommunicationStyle: true,
        availability: true,
        profileCompleteness: true,
        updatedAt: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID (for viewing profiles)
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
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
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get profile completeness
router.get(
  "/me/completeness",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { profileCompleteness: true },
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ completeness: user.profileCompleteness });
    } catch (error) {
      console.error("Get completeness error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

function calculateCompleteness(user: any): number {
  const fields = [
    "name",
    "age",
    "culturalUpbringing",
    "career",
    "favoriteBooks",
    "favoriteAuthors",
    "interests",
    "keystoneValues",
    "relationshipGoals",
    "lifePhilosophy",
    "hobbies",
    "whatImLookingFor",
  ];

  let filled = 0;
  fields.forEach((field) => {
    const value = user[field];
    if (
      value !== null &&
      value !== undefined &&
      String(value).trim().length > 0
    ) {
      filled++;
    }
  });

  return Math.round((filled / fields.length) * 100);
}

export default router;
