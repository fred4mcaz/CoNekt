# Quick Start Guide

## Important: Which URL to Use

- **Frontend (Web App)**: http://localhost:5173 ← **USE THIS ONE!**
- **Backend (API)**: http://localhost:3001 ← This is just the API server

## Starting the Application

1. **Make sure you're in the root directory:**
   ```powershell
   cd C:\Users\eduar\GithubRepos\CoNekt
   ```

2. **Start both servers:**
   ```powershell
   npm run dev
   ```

   This will start:
   - Backend API on port 3001
   - Frontend on port 5173

3. **Open your browser and go to:**
   ```
   http://localhost:5173
   ```

## If You See "Cannot GET /" Error

This means you're accessing the backend API directly. The backend (port 3001) is only for API requests - it doesn't serve a web page.

**Solution**: Go to http://localhost:5173 instead (the frontend)

## Troubleshooting

### Backend not starting?
```powershell
cd server
npm install
npm run dev
```

### Frontend not starting?
```powershell
cd client
npm install
npm run dev
```

### Database connection error?
1. Make sure PostgreSQL is running
2. Check `server/.env` file has correct DATABASE_URL
3. Run: `cd server && npm run db:push`

### Port already in use?
- Kill existing Node processes: `taskkill /F /IM node.exe`
- Or change ports in `server/.env` and `client/vite.config.ts`

