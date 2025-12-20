import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { hashPassword } from "../utils/auth";

const prisma = new PrismaClient();

interface PersonalityData {
  id: string;
  age?: number;
  gender?: string;
  nationality?: string;
  favorite_books?: string[];
  favorite_movies?: string[];
  favorite_tv_shows?: string[];
  favorite_authors?: string[];
  keystone_values?: string[];
  looking_for_in_a_friend?: string;
  cultural_upbringing?: string;
  career?: string;
  industry?: string;
  hobbies?: string;
  interests?: string;
  life_philosophy?: string;
  relationship_goals?: string;
  preferred_communication_style?: string;
  availability?: string;
  [key: string]: any;
}

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

async function transformPersonalityToUser(personality: PersonalityData): Promise<any> {
  // Generate a name from the ID (e.g., "person01" -> "Person 01")
  const name = personality.id
    .replace(/person/i, "")
    .replace(/^(\d+)$/, "Person $1");

  // Generate a unique email
  const email = `${personality.id.toLowerCase()}@conekt.test`;

  // Convert arrays to comma-separated strings
  const favoriteBooks = personality.favorite_books
    ? personality.favorite_books.join(", ")
    : null;
  const favoriteMovies = personality.favorite_movies
    ? personality.favorite_movies.join(", ")
    : null;
  const favoriteTvShows = personality.favorite_tv_shows
    ? personality.favorite_tv_shows.join(", ")
    : null;
  const favoriteAuthors = personality.favorite_authors
    ? personality.favorite_authors.join(", ")
    : null;
  const keystoneValues = personality.keystone_values
    ? personality.keystone_values.join(", ")
    : null;

  // Map looking_for_in_a_friend to whatImLookingFor
  const whatImLookingFor = personality.looking_for_in_a_friend || null;

  // Build user data object
  const userData: any = {
    name,
    email,
    passwordHash: await hashPassword("password123"), // Default password for bulk imports
    age: personality.age || null,
    gender: personality.gender || null,
    nationality: personality.nationality || null,
    culturalUpbringing: personality.cultural_upbringing || null,
    career: personality.career || null,
    industry: personality.industry || null,
    hobbies: personality.hobbies || null,
    interests: personality.interests || null,
    favoriteBooks,
    favoriteMovies,
    favoriteTvShows,
    favoriteAuthors,
    keystoneValues,
    whatImLookingFor,
    lifePhilosophy: personality.life_philosophy || null,
    relationshipGoals: personality.relationship_goals || null,
    preferredCommunicationStyle:
      personality.preferred_communication_style || null,
    availability: personality.availability || null,
  };

  // Calculate completeness
  userData.profileCompleteness = calculateCompleteness(userData);

  return userData;
}

async function bulkImport() {
  try {
    console.log("🚀 Starting bulk import...");

    // Get the personalities directory path
    // Try multiple possible locations
    const possiblePaths = [
      path.join(process.cwd(), "..", "personalities"), // From server/ directory
      path.join(process.cwd(), "personalities"), // From project root
      path.join(__dirname, "..", "..", "..", "personalities"), // From compiled dist/
    ];

    let personalitiesDir: string | null = null;
    for (const dirPath of possiblePaths) {
      if (fs.existsSync(dirPath)) {
        personalitiesDir = dirPath;
        break;
      }
    }

    if (!personalitiesDir) {
      console.error(`❌ Could not find personalities directory. Tried:`);
      possiblePaths.forEach((p) => console.error(`   - ${p}`));
      process.exit(1);
    }

    console.log(`📂 Using personalities directory: ${personalitiesDir}`);

    // Read all JSON files
    const files = fs
      .readdirSync(personalitiesDir)
      .filter((file) => file.endsWith(".json"));

    if (files.length === 0) {
      console.error("❌ No JSON files found in personalities directory");
      process.exit(1);
    }

    console.log(`📁 Found ${files.length} profile file(s)`);

    const results = {
      success: 0,
      skipped: 0,
      errors: 0,
    };

    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(personalitiesDir, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const personality: PersonalityData = JSON.parse(fileContent);

        console.log(`\n📄 Processing ${file}...`);

        // Transform personality data to user data
        const userData = await transformPersonalityToUser(personality);

        // Check if user already exists (by email)
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          results.skipped++;
          continue;
        }

        // Create user
        const user = await prisma.user.create({
          data: userData,
        });

        console.log(`✅ Created user: ${user.name} (${user.email})`);
        console.log(`   Profile completeness: ${user.profileCompleteness}%`);
        results.success++;
      } catch (error: any) {
        console.error(`❌ Error processing ${file}:`, error.message);
        results.errors++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Import Summary:");
    console.log(`   ✅ Successfully imported: ${results.success}`);
    console.log(`   ⏭️  Skipped (already exists): ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.errors}`);
    console.log("=".repeat(50));

    if (results.success > 0) {
      console.log(
        "\n💡 Note: All imported users have the default password 'password123'"
      );
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
bulkImport();

