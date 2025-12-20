# Bulk Profile Upload Guide

CoNekt provides two methods for bulk uploading profiles:

## Method 1: Import from JSON Files (Recommended)

Use the bulk import script to automatically import all profiles from the `personalities/` directory.

### Usage

```bash
cd server
npm run bulk:import
```

### How it works

1. The script reads all `.json` files from the `personalities/` directory
2. Transforms each personality JSON to match the User schema
3. Creates users with:
   - Generated emails: `{personality_id}@conekt.test` (e.g., `person01@conekt.test`)
   - Default password: `password123`
   - All profile data from the JSON file

### Personality JSON Format

Your personality JSON files should follow this format. **Only `id` is required** - all other fields are optional:

```json
{
  "id": "person01",
  "age": 29,
  "gender": "female",
  "nationality": "Canadian",
  "cultural_upbringing": "Urban, multicultural",
  "career": "Data Scientist",
  "industry": "Technology",
  "hobbies": "Reading, hiking, cooking",
  "interests": "Philosophy, AI, sustainable living",
  "favorite_books": ["Sapiens", "Pride and Prejudice"],
  "favorite_movies": ["Arrival", "Her"],
  "favorite_tv_shows": ["The Crown", "Black Mirror"],
  "favorite_authors": ["Jane Austen", "Yuval Noah Harari"],
  "keystone_values": ["intellectual honesty", "curiosity", "empathy"],
  "life_philosophy": "Continuous learning and growth",
  "looking_for_in_a_friend": "Someone who enjoys deep conversations...",
  "relationship_goals": "Meaningful connections",
  "preferred_communication_style": "Direct and thoughtful",
  "availability": "Evenings and weekends"
}
```

### Expected JSON Fields

#### Required Fields

- **`id`** (string): Unique identifier for the personality. Used to generate name and email.
  - Example: `"person01"` → Name: "Person 01", Email: `person01@conekt.test`

#### Optional Fields

**Basic Information:**

- `age` (number): Age of the person
- `gender` (string): Gender identity
- `nationality` (string): Nationality
- `cultural_upbringing` (string): Cultural background/upbringing

**Career:**

- `career` (string): Current career or profession
- `industry` (string): Industry they work in

**Interests & Preferences:**

- `hobbies` (string): Hobbies and activities
- `interests` (string): General interests
- `favorite_books` (array of strings): List of favorite books
- `favorite_movies` (array of strings): List of favorite movies
- `favorite_tv_shows` (array of strings): List of favorite TV shows
- `favorite_authors` (array of strings): List of favorite authors
- `keystone_values` (array of strings): Core values

**Philosophy & Goals:**

- `life_philosophy` (string): Personal life philosophy
- `looking_for_in_a_friend` (string): What they're looking for in connections
- `relationship_goals` (string): Goals for relationships/connections
- `preferred_communication_style` (string): Preferred way of communicating
- `availability` (string): When they're available

### Field Mapping & Processing

- **Arrays are converted to strings**: Fields like `favorite_books`, `favorite_movies`, `keystone_values` can be arrays and will be automatically converted to comma-separated strings (e.g., `["Book 1", "Book 2"]` → `"Book 1, Book 2"`)

- **Name & Email Generation**:

  - `id: "person01"` → Name: `"Person 01"`, Email: `"person01@conekt.test"`
  - `id: "person42"` → Name: `"Person 42"`, Email: `"person42@conekt.test"`

- **Field Name Mapping**:
  - `looking_for_in_a_friend` → maps to database field `whatImLookingFor`
  - `cultural_upbringing` → maps to database field `culturalUpbringing`
  - `life_philosophy` → maps to database field `lifePhilosophy`
  - `relationship_goals` → maps to database field `relationshipGoals`
  - `preferred_communication_style` → maps to database field `preferredCommunicationStyle`

### Minimal Example

The simplest valid JSON file only needs an `id`:

```json
{
  "id": "person01"
}
```

This will create a user with:

- Name: "Person 01"
- Email: "person01@conekt.test"
- Password: "password123" (default)
- All other fields: null

### Output

The script provides a summary:

- ✅ Successfully imported profiles
- ⏭️ Skipped profiles (already exist)
- ❌ Errors (with details)

## Method 2: API Endpoint

Use the REST API to upload profiles programmatically.

### Endpoint

```
POST /api/users/bulk
```

**Authentication:** Required (Bearer token)

### Request Body

```json
{
  "profiles": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123",
      "age": 30,
      "gender": "male",
      "nationality": "American",
      "favorite_books": ["Book 1", "Book 2"],
      "favorite_movies": ["Movie 1", "Movie 2"],
      "keystone_values": ["value1", "value2"],
      "whatImLookingFor": "Looking for...",
      ...
    },
    ...
  ]
}
```

### Response

```json
{
  "message": "Bulk upload completed",
  "summary": {
    "total": 10,
    "success": 8,
    "skipped": 1,
    "errors": 1
  },
  "results": {
    "success": [...],
    "skipped": [...],
    "errors": [...]
  }
}
```

### Field Support

The API accepts both formats:

- Database format: `favoriteBooks`, `whatImLookingFor`, etc.
- Personality format: `favorite_books`, `looking_for_in_a_friend`, etc.

Arrays are automatically converted to comma-separated strings.

### Example with cURL

```bash
curl -X POST http://localhost:3001/api/users/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "profiles": [
      {
        "name": "Test User",
        "email": "test@example.com",
        "age": 25,
        "favorite_books": ["Book 1", "Book 2"]
      }
    ]
  }'
```

## Notes

- **Default Password**: When using the import script, all users get the password `password123`. Change this after import for production use.
- **Email Uniqueness**: The system will skip profiles with emails that already exist in the database.
- **Profile Completeness**: Automatically calculated based on filled fields.
- **Required Fields**:
  - For API: `name` and `email` are required
  - For script: `id` is required (name and email are generated)

## Troubleshooting

### Script can't find personalities directory

Make sure you're running the script from the `server/` directory and that the `personalities/` directory exists at the project root.

### Duplicate email errors

The script automatically skips existing users. If you want to update existing profiles, use the update endpoint instead.

### Array fields not working

Arrays are automatically converted to comma-separated strings. If you need to preserve array format, you'll need to modify the schema and import logic.
