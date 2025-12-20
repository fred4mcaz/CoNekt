import express from "express";
import prisma from "../utils/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { hashPassword } from "../utils/auth";

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

// Bulk upload profiles
router.post("/bulk", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { profiles } = req.body;

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res
        .status(400)
        .json({ error: "Profiles array is required and must not be empty" });
    }

    const results = {
      success: [] as any[],
      skipped: [] as any[],
      errors: [] as any[],
    };

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      try {
        // Validate required fields
        if (!profile.name || !profile.email) {
          results.errors.push({
            index: i,
            error: "Name and email are required",
            profile: profile,
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (existingUser) {
          results.skipped.push({
            index: i,
            email: profile.email,
            reason: "User already exists",
          });
          continue;
        }

        // Hash password (use provided password or default)
        const password = profile.password || "password123";
        const passwordHash = await hashPassword(password);

        // Transform arrays to strings if needed
        const transformedProfile: any = {
          name: profile.name,
          email: profile.email,
          passwordHash,
          age: profile.age || null,
          gender: profile.gender || null,
          nationality: profile.nationality || null,
          culturalUpbringing:
            profile.culturalUpbringing || profile.cultural_upbringing || null,
          career: profile.career || null,
          industry: profile.industry || null,
          skills: profile.skills || null,
          experienceLevel:
            profile.experienceLevel || profile.experience_level || null,
          careerGoals: profile.careerGoals || profile.career_goals || null,
          hobbies: profile.hobbies || null,
          interests: profile.interests || null,
          lifePhilosophy:
            profile.lifePhilosophy || profile.life_philosophy || null,
          relationshipGoals:
            profile.relationshipGoals || profile.relationship_goals || null,
          preferredCommunicationStyle:
            profile.preferredCommunicationStyle ||
            profile.preferred_communication_style ||
            null,
          availability: profile.availability || null,
          whatImLookingFor:
            profile.whatImLookingFor || profile.looking_for_in_a_friend || null,
        };

        // Handle array fields - convert to comma-separated strings
        if (profile.favoriteBooks || profile.favorite_books) {
          transformedProfile.favoriteBooks = Array.isArray(
            profile.favoriteBooks || profile.favorite_books
          )
            ? (profile.favoriteBooks || profile.favorite_books).join(", ")
            : profile.favoriteBooks || profile.favorite_books;
        }

        if (profile.favoriteAuthors || profile.favorite_authors) {
          transformedProfile.favoriteAuthors = Array.isArray(
            profile.favoriteAuthors || profile.favorite_authors
          )
            ? (profile.favoriteAuthors || profile.favorite_authors).join(", ")
            : profile.favoriteAuthors || profile.favorite_authors;
        }

        if (profile.favoriteMovies || profile.favorite_movies) {
          transformedProfile.favoriteMovies = Array.isArray(
            profile.favoriteMovies || profile.favorite_movies
          )
            ? (profile.favoriteMovies || profile.favorite_movies).join(", ")
            : profile.favoriteMovies || profile.favorite_movies;
        }

        if (profile.favoriteTvShows || profile.favorite_tv_shows) {
          transformedProfile.favoriteTvShows = Array.isArray(
            profile.favoriteTvShows || profile.favorite_tv_shows
          )
            ? (profile.favoriteTvShows || profile.favorite_tv_shows).join(", ")
            : profile.favoriteTvShows || profile.favorite_tv_shows;
        }

        if (profile.keystoneValues || profile.keystone_values) {
          transformedProfile.keystoneValues = Array.isArray(
            profile.keystoneValues || profile.keystone_values
          )
            ? (profile.keystoneValues || profile.keystone_values).join(", ")
            : profile.keystoneValues || profile.keystone_values;
        }

        // Handle location if it's an object
        if (profile.location) {
          transformedProfile.location = profile.location;
        }

        // Calculate completeness
        transformedProfile.profileCompleteness =
          calculateCompleteness(transformedProfile);

        // Create user
        const user = await prisma.user.create({
          data: transformedProfile,
          select: {
            id: true,
            name: true,
            email: true,
            profileCompleteness: true,
          },
        });

        results.success.push({
          index: i,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      } catch (error: any) {
        results.errors.push({
          index: i,
          error: error.message,
          profile: profile,
        });
      }
    }

    res.status(201).json({
      message: "Bulk upload completed",
      summary: {
        total: profiles.length,
        success: results.success.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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
