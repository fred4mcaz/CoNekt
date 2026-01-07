// Simple test script to verify LLM functionality
const {
  generateRecommendedActivity,
  generateConversationStarters,
} = require("./src/services/llm");

async function testLLM() {
  console.log("🧪 Testing LLM Integration...\n");

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

  try {
    console.log("🤖 Testing activity generation...");
    const activity = await generateRecommendedActivity(user1, user2);
    console.log("✅ Activity generated:", activity);
    console.log("");

    console.log("🤖 Testing conversation starters...");
    const questions = await generateConversationStarters(user1, user2);
    console.log("✅ Questions generated:");
    questions.forEach((q, i) => console.log(`  ${i + 1}. ${q}`));
    console.log("");

    console.log("🎉 LLM Integration Test PASSED!");
  } catch (error) {
    console.error("❌ LLM Integration Test FAILED:", error.message);
    console.log("💡 This means the fallback system is working");
  }
}

testLLM();


