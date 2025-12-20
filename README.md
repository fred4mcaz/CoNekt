# CoNekt - Deep Connection Matching Platform

CoNekt is a web application that uses machine learning to match users based on deep compatibility factors for meaningful, non-romantic connections (friends, cofounders, business partners, etc.).

## Features

- **Interactive Profile Creation**: Card-based, conversational interface - no forms!
- **Open-Ended Expression**: All fields (except name) are optional and free-form text
- **Smart Matching**: ML-based compatibility scoring
- **Activity Recommendations**: Personalized suggestions for matched users
- **Conversation Starters**: Thought-provoking questions to spark deeper connections

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd CoNekt
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Set up the database**

   Create a PostgreSQL database:

   ```bash
   createdb conekt
   ```

   Copy the environment file:

   ```bash
   cp server/.env.example server/.env
   ```

   Update `server/.env` with your database connection string:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/conekt?schema=public"
   JWT_SECRET="your-secret-key-here"
   ```

4. **Set up Prisma**

   ```bash
   cd server
   npm run db:generate
   npm run db:push
   ```

5. **Start the development servers**

   From the root directory:

   ```bash
   npm run dev
   ```

   This will start both the backend (port 3001) and frontend (port 5173).

   Or start them separately:

   ```bash
   # Terminal 1 - Backend
   npm run dev:server

   # Terminal 2 - Frontend
   npm run dev:client
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173`

## Project Structure

```
CoNekt/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   └── types/       # TypeScript types
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   ├── prisma/          # Prisma schema
│   └── package.json
└── package.json         # Root package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (basic)

### User Profile

- `GET /api/users/me` - Get full profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/me/completeness` - Get profile completeness

### Matching

- `GET /api/matches` - Get top 3 matches
- `POST /api/matches/refresh` - Refresh matches
- `GET /api/matches/:userId` - Get match details

## Development

### Database Migrations

```bash
cd server
npm run db:migrate        # Create migration
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
```

### Building for Production

```bash
npm run build
```

## License

MIT
