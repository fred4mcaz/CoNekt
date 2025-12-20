# How to View User Data

## Method 1: Prisma Studio (Easiest - Recommended)

Prisma Studio provides a web-based GUI to view and edit your database.

1. **Open a new terminal/PowerShell window**

2. **Navigate to server directory and run:**

   ```powershell
   cd server
   npm run db:studio
   ```

3. **Prisma Studio will open in your browser** at `http://localhost:5555`

4. **View your data:**
   - Click on the "User" model to see all users
   - Click on any user to see their full profile data
   - You can edit fields directly in the interface

## Method 2: Using psql (Command Line)

1. **Connect to PostgreSQL:**

   ```powershell
   psql -U postgres -d conekt
   ```

2. **View all users:**

   ```sql
   SELECT id, name, email, created_at FROM users;
   ```

3. **View a specific user's full profile:**

   ```sql
   SELECT * FROM users WHERE email = 'user@example.com';
   ```

4. **View matches:**

   ```sql
   SELECT * FROM matches;
   ```

5. **Exit psql:**
   ```sql
   \q
   ```

## Method 3: Using a Database GUI Tool

You can use any PostgreSQL client tool:

- **pgAdmin** (official PostgreSQL tool)
- **DBeaver** (free, cross-platform)
- **TablePlus** (paid, beautiful UI)
- **DataGrip** (JetBrains IDE)

Connection details:

- Host: `localhost`
- Port: `5432`
- Database: `conekt`
- Username: `postgres` (or your PostgreSQL username)
- Password: (your PostgreSQL password)

## Quick Commands

### View all users (quick check)

```powershell
psql -U postgres -d conekt -c "SELECT id, name, email, created_at FROM users;"
```

### Count users

```powershell
psql -U postgres -d conekt -c "SELECT COUNT(*) FROM users;"
```

### View user profiles

```powershell
psql -U postgres -d conekt -c "SELECT name, email, profile_completeness, career, interests, keystone_values FROM users;"
```
