# CoNekt - Deep Connection Matching Platform

## Project Overview

CoNekt is a web application that uses machine learning to match users based on deep compatibility factors derived from modern scientific studies on friendship, professional connections, and meaningful relationships. The platform helps people find friends, cofounders, business partners, and other non-romantic connections.

## Core Value Proposition

Match users based on scientifically-backed compatibility factors that predict deep, meaningful connections rather than surface-level similarities.

---

## Technical Stack

### Frontend

- **Framework**: React (with TypeScript recommended)
- **Styling**: Modern CSS framework (e.g., Tailwind CSS) or styled-components
- **State Management**: React Context API or Redux Toolkit
- **HTTP Client**: Axios or Fetch API

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js or Fastify
- **Language**: JavaScript/TypeScript

### Database

- **Primary Database**: PostgreSQL
- **ORM/Query Builder**: Prisma or Sequelize (recommended: Prisma)

### Machine Learning

- **Approach**: Embedding-based similarity matching or collaborative filtering
- **Library Options**:
  - TensorFlow.js (for client-side or Node.js)
  - Python microservice with scikit-learn/transformers (via API)
  - Direct PostgreSQL vector similarity (pgvector extension)
- **Model**: Pre-trained embeddings or custom model trained on compatibility factors

### Authentication

- **Method**: JWT tokens or OAuth (Google/GitHub)
- **Session Management**: JWT with refresh tokens

---

## User Profile Data Model

### Required Fields (Only for Account Creation)

- `id`: Unique user identifier (UUID)
- `name`: String (only mandatory field for profile display)
- `email`: Email address (for authentication)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Personality & Demographics (All Optional)

- `age`: Integer (optional)
- `gender`: String (optional, open-ended text field - user types freely)
- `cultural_upbringing`: Text field (open-ended, user describes in their own words)
- `nationality`: Text field (optional, open-ended)
- `location`: JSON object (optional)
  - `city`: String
  - `country`: String
  - `timezone`: String
  - `region`: String (user can describe freely)

### Professional Information (All Optional)

- `career`: Text field (open-ended, user describes their work/passion in their own words)
- `industry`: Text field (open-ended)
- `skills`: Text field (open-ended, user writes freely about their skills and expertise)
- `experience_level`: Text field (open-ended, user describes their experience in their own words)
- `career_goals`: Text field (open-ended, user writes about aspirations and goals)

### Interests & Preferences (All Optional, Open-Ended)

- `favorite_books`: Text field (open-ended, user lists books or describes their reading preferences)
- `favorite_authors`: Text field (open-ended, user lists or describes authors they admire)
- `favorite_movies`: Text field (open-ended, user lists or describes cinematic preferences)
- `favorite_tv_shows`: Text field (open-ended, user lists or describes TV preferences)
- `favorite_speakers`: Text field (open-ended, user lists podcast hosts, TED speakers, thought leaders they follow)
- `hobbies`: Text field (open-ended, user describes their hobbies and activities)
- `interests`: Text field (open-ended, user writes about broader interests and curiosities)

### Values & Philosophy (All Optional, Open-Ended)

- `keystone_values`: Text field (open-ended, user describes their core values in their own words)
- `life_philosophy`: Text field (open-ended, user shares their worldview and beliefs)
- `what_im_looking_for`: Text field (open-ended, user describes ideal connections in their own words)

### Relationship Goals (All Optional)

- `relationship_goals`: Text field (open-ended, user describes what kinds of connections they're seeking - friends, cofounders, business partners, mentors, study partners, adventure companions, creative collaborators, etc.)

### Communication Preferences (All Optional, Open-Ended)

- `preferred_communication_style`: Text field (open-ended, user describes how they like to communicate and connect)
- `availability`: Text field (open-ended, user describes when/how they're available)

### Profile Metadata

- `profile_completeness`: Integer (0-100, calculated based on filled fields - informational only, not required)
- `is_active`: Boolean
- `last_login`: Timestamp

**Key Principle**: All fields except `name` are completely optional. Users should feel free to express themselves naturally in open-ended text fields rather than being constrained by dropdowns or predefined options.

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- Only mandatory field (besides email for auth)
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- if using password auth
  age INTEGER, -- All fields below are nullable/optional
  gender TEXT, -- Open-ended text field
  cultural_upbringing TEXT, -- Open-ended text field
  nationality TEXT, -- Open-ended text field
  location JSONB, -- Optional
  career TEXT, -- Open-ended text field
  industry TEXT, -- Open-ended text field
  skills TEXT, -- Open-ended text field
  experience_level TEXT, -- Open-ended text field
  career_goals TEXT, -- Open-ended text field
  favorite_books TEXT, -- Open-ended text field
  favorite_authors TEXT, -- Open-ended text field
  favorite_movies TEXT, -- Open-ended text field
  favorite_tv_shows TEXT, -- Open-ended text field
  favorite_speakers TEXT, -- Open-ended text field
  hobbies TEXT, -- Open-ended text field
  interests TEXT, -- Open-ended text field
  keystone_values TEXT, -- Open-ended text field
  life_philosophy TEXT, -- Open-ended text field
  what_im_looking_for TEXT, -- Open-ended text field
  relationship_goals TEXT, -- Open-ended text field
  preferred_communication_style TEXT, -- Open-ended text field
  availability TEXT, -- Open-ended text field
  profile_completeness INTEGER DEFAULT 0, -- Calculated, informational only
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_industry ON users(industry);
CREATE INDEX idx_users_location ON users USING GIN(location);
CREATE INDEX idx_users_skills ON users USING GIN(skills);
CREATE INDEX idx_users_relationship_goals ON users USING GIN(relationship_goals);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### User Embeddings Table (for ML matching)

```sql
CREATE TABLE user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  embedding VECTOR(512), -- or appropriate dimension based on model
  model_version VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX idx_user_embeddings_vector ON user_embeddings USING ivfflat (embedding vector_cosine_ops);
```

### Matches Table (optional, for tracking)

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(5,4), -- 0.0000 to 1.0000
  match_factors JSONB, -- breakdown of why they matched
  recommended_activity TEXT, -- Suggested activity for the matched pair
  conversation_starters TEXT[], -- Array of thought-provoking questions
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_score ON matches(compatibility_score DESC);
```

---

## Matching Algorithm

### Approach: ML-Based Compatibility Matching

#### Step 1: Feature Engineering

Transform user profile data into numerical features based on scientific compatibility factors:

1. **Value Alignment** (High Weight: 0.25)

   - Extract values from open-ended text fields using NLP/semantic analysis
   - Cosine similarity of extracted values (using embeddings)
   - Semantic similarity of life philosophy text using sentence embeddings
   - Theme extraction and alignment from free-form value descriptions

2. **Interest Convergence** (Medium Weight: 0.20)

   - Extract themes and topics from open-ended interest fields using NLP
   - Content similarity (books, movies, TV shows) using embeddings from text mentions
   - Author/speaker preference alignment (extracted from free-form text)
   - Semantic similarity of hobbies and interests using embeddings

3. **Cultural & Background Compatibility** (Medium Weight: 0.15)

   - Semantic similarity of cultural upbringing descriptions (if provided)
   - Age proximity (if age provided, with preference curve)
   - Geographic/timezone considerations (if location provided)
   - Extract cultural themes from open-ended background descriptions

4. **Professional Synergy** (Medium Weight: 0.15)

   - Extract industry/career themes from open-ended career descriptions using NLP
   - Semantic similarity of career descriptions and goals
   - Extract and compare skills mentioned in free-form text
   - Skill complementarity vs. overlap (using embeddings)
   - Career goal alignment (semantic similarity of goal descriptions)

5. **Relationship Goal Alignment** (High Weight: 0.25)
   - Extract relationship goals from open-ended text using NLP
   - Semantic similarity of relationship goal descriptions
   - Communication style compatibility (extracted from open-ended preferences)

#### Step 2: Embedding Generation

- Use pre-trained language models (e.g., sentence-transformers) to create embeddings for:
  - All open-ended text fields combined into user profile embedding
  - Extract and embed: values, philosophy, career, interests, hobbies, books/authors/speakers mentioned
  - Use NLP to extract key entities and themes from free-form text
  - Create embeddings for extracted themes (interests, values, goals)
  - Create a composite user embedding (512-dimensional vector) combining:
    - Full profile text embedding (weighted combination of all text fields)
    - Thematic embeddings (interests, values, goals extracted via NLP)
    - Entity embeddings (books, authors, speakers, skills mentioned)

#### Step 3: Similarity Calculation

- Use cosine similarity or Euclidean distance on user embeddings
- Apply weighted scoring combining:
  - Embedding similarity (60%)
  - Explicit overlap scores (40%)
- Normalize to 0-1 compatibility score

#### Step 4: Ranking & Filtering

- Rank all users by compatibility score
- Filter based on:
  - Active users only
  - Relationship goal overlap (if specified in open-ended text)
  - Optional: Age range preferences (if age provided)
  - Optional: Geographic preferences (if location provided)
- Return top 3 matches per user

#### Step 5: Activity & Question Generation

For each matched pair, generate:

1. **Recommended Activity**:

   - Analyze shared interests, values, and goals from open-ended text
   - Use NLP to extract key themes (books, activities, topics, skills)
   - Generate personalized activity suggestions:
     - If both mention books: Suggest a book to read together
     - If both mention tech/skills: Suggest a collaboration project
     - If both mention philosophy/ideas: Suggest a discussion topic or podcast
     - If both mention creativity: Suggest a creative collaboration
     - If location mentioned: Suggest local meetup ideas
   - Format: Natural language description of activity

2. **Conversation Starters**:
   - Generate 3-5 thought-provoking questions using:
     - Shared interests extracted from profiles
     - Values alignment points
     - Complementary perspectives
     - Deep connection principles (vulnerability, curiosity, authenticity)
   - Questions should:
     - Go beyond surface-level ("How are you?" → "What's a question that's been on your mind lately?")
     - Connect to shared interests or values
     - Encourage meaningful dialogue
     - Be open-ended and exploratory
   - Use LLM (e.g., GPT) or template-based generation with profile-specific variables

### Implementation Options

**Option A: PostgreSQL + pgvector (Recommended for MVP)**

- Generate embeddings server-side using Python service or Node.js ML library
- Store embeddings in PostgreSQL with pgvector extension
- Use vector similarity search for fast retrieval

**Option B: External ML Service**

- Python microservice with scikit-learn/transformers
- REST API endpoint for matching
- Cache results in PostgreSQL

**Option C: TensorFlow.js**

- Generate embeddings in Node.js backend
- Real-time matching without external service

---

## User Experience Flow

### 1. Signup & Profile Creation (Interactive, Not a Form)

**Philosophy**: The profile creation experience should feel like a conversation or a creative exercise, not filling out paperwork. Use interactive elements, animations, and engaging prompts.

**Step 1: Minimal Entry**

- Email address
- Password (or OAuth: "Continue with Google")
- "Get Started" button with friendly, inviting copy

**Step 2: Name Collection (Only Required Field)**

- Friendly prompt: "What should we call you?" or "Hi there! What's your name?"
- Single text input with encouraging placeholder
- Emphasize: "This is the only thing we need - everything else is optional!"

**Step 3: Interactive Profile Building Experience**

**Design Principles**:

- No traditional form fields
- Conversation-style prompts
- Visual, engaging interface
- Everything is optional (except name)
- Users can skip any section
- Save progress automatically as they type

**Interface Approach**:

- **Card-based, conversational prompts** instead of form sections
- Each "card" asks one question or invites one type of sharing
- Cards can be swiped away, answered, or skipped
- Smooth animations between cards
- Progress is visual but non-intrusive (e.g., "You've shared X things about yourself")

**Example Card Interactions**:

1. **"Tell us about your cultural background"** (not "Cultural Upbringing:")

   - Large, friendly text area with placeholder: "Where are you from? How did your background shape you? Share as much or as little as feels right."
   - Animated character or illustration
   - "Skip" button always visible
   - Auto-save as they type

2. **"What lights you up?"**

   - Open text area: "Books, movies, ideas, hobbies, experiences - what captures your imagination?"
   - Rich text editor with suggestions (not requirements)
   - Visual examples fade in/out showing what others have shared

3. **"Describe your work or passion"**

   - Friendly prompt: "What do you do? What are you building? What drives you professionally?"
   - No dropdowns, no constraints
   - Encouraging tone throughout

4. **"What kind of connection are you open to?"**

   - Open prompt: "Friendship, co-builders, mentors, mentees, dating, exploration - what connections are you open to?"
   - User writes freely, no checkboxes or limits

5. **"What matters most to you?"**

   - Inviting text area: "What are your core values? What principles guide you? Share what feels important."
   - Natural language, no predefined lists

6. **"Your personality in your own words"**
   - Various open-ended prompts rotate or can be selected:
     - "What's a book that changed how you think?"
     - "Who are the speakers or thinkers you admire?"
     - "Describe an ideal conversation partner"
     - "What questions keep you up at night?"

**Key UX Features**:

- **Auto-save**: Everything saves automatically, no "Save" button anxiety
- **Skip anytime**: Every card has a prominent "Skip" or "Maybe later" option
- **Visual feedback**: Subtle animations, progress indicators that celebrate completion (not pressure)
- **No completion pressure**: Never show "Profile 20% complete" as a requirement - show "You've shared 3 things about yourself!" as celebration
- **Come back anytime**: Users can add more anytime from their profile page
- **Rich text support**: Allow formatting, links, lists where natural

**Step 4: Immediate Value**

- After name entry: "Finding your matches..."
- Show matches immediately (even with just a name - ML can work with minimal data)
- Encouraging message: "Add more about yourself anytime to improve matches, but we found some great connections already!"

### 2. Dashboard / Match Display

**Layout**: Clean, card-based design with focus on connection-building

**Top Section**:

- Welcome message with user's name
- Subtle "Add more about yourself" option (not a completion meter)
- "Update Profile" button (styled as an invitation, not a requirement)

**Matches Section**:

- Title: "People We Think You'd Connect With"
- Three profile cards displayed horizontally (or stacked on mobile)
- Each card is interactive and expandable

**Profile Card Design**:
Each card shows:

- **Header**: Name, and any shared info they've provided (age, location if available)
- **Compatibility Score**: Visual indicator (e.g., "92% match") with brief explanation
- **Match Highlights**: Key alignment points (e.g., "Shared interests in philosophy and technology", "Similar values around curiosity and growth")
- **Profile Preview**: Natural excerpts from their open-ended responses (not structured fields)

  - If they wrote about their work: Show their career description
  - If they wrote about interests: Show a snippet
  - If they wrote about values: Show a snippet
  - Displayed as quoted text, not form fields

- **Recommended Activity Section** (New Feature):

  - Title: "💡 Try This Together"
  - Personalized activity suggestion based on shared interests/values
  - Examples:
    - "Read [book] together and discuss chapter 3's implications"
    - "Watch [TED talk/podcast episode] and explore the questions it raises"
    - "Try a design thinking workshop on [topic relevant to both]"
    - "Collaborate on a small project: [suggestion based on skills/interests]"
    - "Explore [location/activity] together and discuss what you discover"
  - Activity is generated by ML based on:
    - Shared interests mentioned in profiles
    - Complementary skills
    - Values alignment
    - Relationship goals

- **Conversation Starters Section** (New Feature):

  - Title: "Questions To Get Things Started"
  - 3-5 thought-provoking questions tailored to both users
  - Questions are designed to:
    - Explore shared interests deeply
    - Reveal values and worldview
    - Encourage vulnerability and authenticity
    - Move beyond surface-level small talk
  - Examples (generated based on profile content):
    - "You both mentioned [shared interest]. What's a question about [interest] that you've been wrestling with?"
    - "Based on your values around [value], how do you navigate [relevant situation]?"
    - "What's a perspective on [topic] that changed how you see the world?"
    - "If you could explore one idea together, what would it be and why?"
    - "What's something you've learned recently that challenged your assumptions?"
  - Questions are displayed in an engaging, readable format
  - Can be copied/shared easily

- **Action Buttons**:
  - "View Full Profile" (expands to show complete profile with all their open-ended responses)
  - "Save Match" (future: save for later)
  - "Connect" / "Send Message" (future feature)

**Empty State**:

- If no matches: "We're finding your matches. Add more about yourself to help us connect you with amazing people!" (friendly, not demanding)

**Profile Detail View** (Expanded):

- Show all their open-ended responses in a natural, readable format
- Present as their story, not form data
- Continue showing recommended activity and conversation starters

### 3. Profile Management

**Profile Edit Experience**:

- Same interactive, card-based approach as initial creation
- No "form" feeling
- Users can edit any section anytime
- Sections appear as friendly prompts, not form fields
- Auto-save throughout
- Real-time match refresh after profile updates (happens in background, user notified gently)

---

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile

### User Profile

- `GET /api/users/:id` - Get user profile by ID
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/me` - Get current user's profile
- `PUT /api/users/me` - Update current user's profile
- `GET /api/users/me/completeness` - Get profile completeness percentage

### Matching

- `GET /api/matches` - Get top 3 matches for current user (includes recommended activities and conversation starters)
- `POST /api/matches/refresh` - Force refresh matches (recalculate)
- `GET /api/matches/:userId` - Get match details between current user and specified user (includes activities and questions)
- `GET /api/matches/explanation/:userId` - Get detailed explanation of match factors
- `GET /api/matches/:userId/activity` - Get recommended activity for matched pair
- `GET /api/matches/:userId/conversation-starters` - Get thought-provoking questions for matched pair

### Admin/ML

- `POST /api/admin/generate-embeddings` - Regenerate embeddings for all users (admin)
- `POST /api/admin/recalculate-matches` - Recalculate all matches (admin)

---

## Frontend Components Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── SignupForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── OAuthButton.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── InteractiveProfileBuilder.tsx (card-based, conversational)
│   │   ├── ProfilePromptCard.tsx (individual prompt cards)
│   │   ├── ProfileEditPage.tsx
│   │   └── AutoSaveIndicator.tsx (subtle save feedback)
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   ├── MatchesGrid.tsx
│   │   ├── CompatibilityScore.tsx
│   │   ├── MatchExplanation.tsx
│   │   ├── RecommendedActivity.tsx (activity suggestion component)
│   │   └── ConversationStarters.tsx (questions component)
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── LoadingSpinner.tsx
├── pages/
│   ├── SignupPage.tsx
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   └── ProfilePage.tsx
├── services/
│   ├── api.ts (HTTP client)
│   └── auth.ts (auth utilities)
├── hooks/
│   ├── useAuth.ts
│   ├── useMatches.ts
│   └── useProfile.ts
└── types/
    └── user.ts (TypeScript interfaces)
```

---

## Implementation Priorities

### Phase 1: MVP (Minimum Viable Product)

1. User signup/login (email/password)
2. Interactive profile creation (name only required, open-ended text fields)
3. Simple matching algorithm (rule-based text similarity, no ML yet)
4. Display 3 matches on dashboard with profile previews
5. Basic activity recommendations (template-based)
6. Basic conversation starter questions (template-based)
7. Profile viewing and editing

### Phase 2: Enhanced Matching

1. Implement ML-based embedding generation from open-ended text
2. Integrate pgvector for similarity search
3. Refined compatibility scoring using NLP to extract themes from free-form text
4. Detailed match explanations
5. ML-generated activity recommendations (using LLM or trained model)
6. ML-generated personalized conversation starters (using LLM or trained model)

### Phase 3: Polish & Optimization

1. OAuth integration (Google/GitHub)
2. Profile completion incentives
3. Real-time match updates
4. Performance optimization
5. Mobile responsiveness

### Phase 4: Future Features

1. Messaging system
2. Connection requests
3. Match history
4. Search/filter options
5. Location-based matching
6. Activity feed

---

## Key Design Principles

1. **Not a Form**: The profile creation experience should never feel like filling out paperwork. It should feel like a conversation, a creative exercise, or a journal entry.
2. **Interactive & Lively**: Use animations, engaging prompts, visual feedback, and conversational language throughout.
3. **Everything Optional (Except Name)**: No field is mandatory except the user's name. Users should feel free to share as much or as little as they want.
4. **Open-Ended Expression**: All profile fields are free-form text areas. No dropdowns, no predefined options (except where absolutely necessary for data consistency). Users express themselves in their own words.
5. **Connection-Focused Matching Results**: Match cards don't just show compatibility - they provide recommended activities and thought-provoking questions to help matched users develop deeper connections.
6. **Progressive & Non-Pressured**: Let users add details gradually. Never pressure completion. Celebrate what they've shared, don't highlight what's missing.
7. **Transparency**: Show why matches were made (builds trust)
8. **Scientific Rigor**: Base matching on research-backed factors
9. **Respect Privacy**: Clear privacy controls, minimal required data
10. **Non-Romantic Focus**: Clear messaging that this is for friendships and professional connections

---

## Scientific Compatibility Factors Reference

Based on modern studies, key factors for deep connections include:

- **Value alignment** (Schwartz Theory of Basic Values)
- **Interest similarity** (Homophily principle)
- **Complementary skills** (for professional connections)
- **Similar communication styles** (Attachment theory)
- **Shared life experiences** (Cultural background)
- **Mutual relationship goals** (Goal congruence)

---

## Security & Privacy Considerations

1. **Data Protection**: Encrypt sensitive data at rest and in transit
2. **Password Security**: Bcrypt hashing with salt rounds ≥ 10
3. **JWT Security**: Short-lived access tokens, longer refresh tokens
4. **Input Validation**: Sanitize all user inputs
5. **Rate Limiting**: Prevent abuse on signup/login endpoints
6. **GDPR Compliance**: User data export and deletion capabilities
7. **Profile Visibility**: Users control what's visible to matches

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/conekt

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ML Service (if using external)
ML_SERVICE_URL=http://localhost:8000

# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000
```

---

## Testing Strategy

1. **Unit Tests**: Matching algorithm, data transformations
2. **Integration Tests**: API endpoints, database operations
3. **E2E Tests**: Signup flow, matching display
4. **ML Model Validation**: Test matching accuracy with sample data

---

## Success Metrics

- Signup completion rate
- Profile completion rate
- Time to first match
- User engagement (profile views, connections)
- Match quality (user feedback on matches)
