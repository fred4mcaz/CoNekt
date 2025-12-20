# CoNekt Setup Guide

## Quick Start

1. **Install dependencies**

   ```bash
   npm run install:all
   ```

2. **Set up PostgreSQL database**

   **Option A: Using psql (Recommended for Windows)**

   ```powershell
   # Connect to PostgreSQL (adjust username as needed)
   psql -U postgres

   # Then run this SQL command:
   CREATE DATABASE conekt;

   # Exit psql
   \q
   ```

   **Option B: Using SQL directly (Windows PowerShell)**

   ```powershell
   psql -U postgres -c "CREATE DATABASE conekt;"
   ```

   **Option C: Let Prisma create it automatically**

   - Skip this step - Prisma will create the database when you run `db:push` (see step 4)
   - Just make sure your `DATABASE_URL` points to a database that doesn't exist yet, or use `postgres` database temporarily

3. **Configure environment variables**

   **Windows PowerShell:**

   ```powershell
   cd server
   Copy-Item .env.example .env
   # Then edit .env with your preferred text editor
   notepad .env
   ```

   **Or manually create server/.env file with:**

   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/conekt?schema=public"
   JWT_SECRET="your-secret-key-change-in-production"
   PORT=3001
   FRONTEND_URL="http://localhost:5173"
   ```

   **Note:** Replace `your_password` with your PostgreSQL password. If no password, use `postgresql://postgres@localhost:5432/conekt`

4. **Initialize database**

   ```bash
   cd server
   npm run db:generate  # Generate Prisma Client
   npm run db:push      # Push schema to database
   ```

5. **Start development servers**

   ```bash
   # From root directory
   npm run dev

   # Or separately:
   # Terminal 1: npm run dev:server (backend on :3001)
   # Terminal 2: npm run dev:client (frontend on :5173)
   ```

6. **Open browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## First User

1. Go to http://localhost:5173
2. Click "Sign up"
3. Enter:
   - Name (required)
   - Email
   - Password
4. Complete your profile (all fields optional except name)
5. View your matches!

## Troubleshooting

### Database connection errors

- Ensure PostgreSQL is running (check Services on Windows: `services.msc` → find "postgresql")
- Check DATABASE_URL in server/.env
- Verify database exists:
  - Windows: `psql -U postgres -l` (look for "conekt" in the list)
  - Or: `psql -U postgres -c "\l" | findstr conekt`
- If database doesn't exist, Prisma can create it automatically when you run `db:push`

### Port already in use

- Backend (3001): Change PORT in server/.env
- Frontend (5173): Change port in client/vite.config.ts

### Prisma errors

```bash
cd server
npm run db:generate
npm run db:push
```

## Development Tips

- Use Prisma Studio to view/edit database:

  ```bash
  cd server
  npm run db:studio
  ```

- Check backend logs in terminal running `npm run dev:server`
- Check frontend console for client-side errors
- API health check: http://localhost:3001/api/health
