# Windows Setup Guide for CoNekt

## Quick Fix for Database Creation

Since `createdb` isn't available on Windows, use one of these methods:

### Method 1: Use psql (Easiest)

1. **Open PowerShell or Command Prompt**

2. **Connect to PostgreSQL:**

   ```powershell
   psql -U postgres
   ```

   (You may be prompted for your PostgreSQL password)

3. **Create the database:**

   ```sql
   CREATE DATABASE conekt;
   ```

4. **Exit psql:**
   ```sql
   \q
   ```

### Method 2: Single Command

```powershell
psql -U postgres -c "CREATE DATABASE conekt;"
```

### Method 3: Let Prisma Create It Automatically (Recommended)

**You can skip manual database creation!** Prisma will create the database automatically when you run `db:push`, as long as:

1. PostgreSQL is running
2. Your `DATABASE_URL` in `server/.env` is configured correctly
3. Your PostgreSQL user has permission to create databases

## Complete Setup Steps for Windows

1. **Install dependencies:**

   ```powershell
   npm run install:all
   ```

2. **Set up environment file:**

   The `.env` file should already be created. Open `server/.env` in a text editor and update:

   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/conekt?schema=public"
   JWT_SECRET="any-random-string-here"
   PORT=3001
   FRONTEND_URL="http://localhost:5173"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

   Get your OpenAI API key from https://platform.openai.com/api-keys

   Replace `YOUR_PASSWORD` with your PostgreSQL password (or remove `:YOUR_PASSWORD` if no password).

3. **Initialize database with Prisma:**

   ```powershell
   cd server
   npm run db:generate
   npm run db:push
   ```

   This will create the database if it doesn't exist and set up all tables!

4. **Start the servers:**
   ```powershell
   # From root directory
   npm run dev
   ```

## Troubleshooting

### "psql is not recognized"

- PostgreSQL might not be in your PATH
- Find PostgreSQL installation (usually `C:\Program Files\PostgreSQL\<version>\bin\`)
- Add it to PATH, or use full path: `"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres`

### "Database connection error"

- Make sure PostgreSQL service is running:
  - Press `Win + R`, type `services.msc`, press Enter
  - Find "postgresql" service and make sure it's running
- Check your password in `DATABASE_URL`
- Try connecting manually: `psql -U postgres -d postgres`

### "Prisma can't create database"

- Make sure your PostgreSQL user has CREATE DATABASE permission
- Create database manually using Method 1 or 2 above
- Then run `npm run db:push` again
