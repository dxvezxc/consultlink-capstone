# Vercel Deployment Guide - ConsultLink Capstone

## Overview
This guide walks you through deploying the ConsultLink monorepo (React frontend + Express backend) to Vercel.

---

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **GitHub Account** - Already set up (https://github.com/dxvezxc/consultlink-capstone)
3. **MongoDB Atlas Cluster** - Already configured
4. **Git** - For pushing changes

---

## Step 1: Prepare Your Repository

The repository is already configured with:
- ✅ `vercel.json` - Monorepo configuration
- ✅ `.env.example` - Environment variable template
- ✅ `server/` directory with Express app
- ✅ `client/` directory with React app

---

## Step 2: Deploy to Vercel via GitHub

### Option A: Using Vercel Web Dashboard (Recommended)

1. **Go to Vercel:** https://vercel.com/dashboard

2. **Click "New Project"**

3. **Import Git Repository:**
   - Click "Import Project"
   - Select "GitHub" as your Git provider
   - Search for `consultlink-capstone`
   - Click "Import"

4. **Configure Project:**
   - **Project Name:** consultlink-capstone (or your preferred name)
   - **Framework:** Select "Other" (since it's a monorepo)
   - **Root Directory:** Leave as default (root)

5. **Environment Variables:**
   - Click "Add Environment Variable"
   - Add the following variables:

   ```
   ATLAS_URL = mongodb+srv://[username]:[password]@[cluster].mongodb.net/consultlink?retryWrites=true&w=majority
   REACT_APP_API_URL = https://your-deployment-url.vercel.app/api
   NODE_ENV = production
   ```

6. **Build Settings:**
   - **Build Command:** `npm run build --prefix=client`
   - **Output Directory:** `client/build`

7. **Click "Deploy"**

---

### Option B: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from Project Root:**
   ```bash
   cd c:\Users\Administrator\Desktop\consultlink-capstone
   vercel --prod
   ```

4. **Follow the CLI prompts:**
   - Link to existing project or create new one
   - Select project settings
   - Enter environment variables when prompted

---

## Step 3: Set Environment Variables

After deployment link is created:

1. **Go to Vercel Dashboard**
2. **Select your project:** `consultlink-capstone`
3. **Settings → Environment Variables**
4. **Add Variables:**

   | Key | Value | Environments |
   |-----|-------|--------------|
   | `ATLAS_URL` | Your MongoDB Atlas connection string | Production, Preview, Development |
   | `REACT_APP_API_URL` | `https://your-vercel-url.vercel.app/api` | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |

5. **Redeploy** to apply environment variables

---

## Step 4: Update MongoDB Atlas Whitelist

Your MongoDB Atlas cluster needs to allow connections from Vercel:

1. **Go to MongoDB Atlas Dashboard:** https://cloud.mongodb.com
2. **Select your cluster:** consultlink
3. **Network Access → IP Whitelist**
4. **Add IP Address:**
   - Click "Add IP Address"
   - Enter `0.0.0.0/0` (Allow from anywhere)
   - ⚠️ This is less secure; for production, add Vercel's IP ranges when available
   - Click "Confirm"

---

## Step 5: Configure CORS for Production Domain

The Express server has CORS configured for development. For production:

1. **File:** `server/config/cors.js`
2. **Update the CLIENT_URL environment variable:**
   ```javascript
   const corsOptions = {
     origin: process.env.CLIENT_URL || process.env.VERCEL_URL || 'http://localhost:3000',
     credentials: true,
     optionsSuccessStatus: 200
   };
   ```

3. **Add to Vercel Environment Variables:**
   - Key: `CLIENT_URL`
   - Value: `https://your-vercel-url.vercel.app`

---

## Step 6: Test the Deployment

### Test Frontend
```
https://your-vercel-url.vercel.app
```

### Test API
```
https://your-vercel-url.vercel.app/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-02T12:00:00.000Z",
  "uptime": 123.456,
  "database": "connected",
  "memory": {
    "used": "45MB",
    "total": "128MB"
  }
}
```

### Test Authentication
1. Go to login page
2. Register new account or login with existing
3. Check browser console for network requests
4. Verify API calls go to `https://your-vercel-url.vercel.app/api/*`

---

## Step 7: Verify All Features

Test the following:

- ✅ **Login/Register** - User authentication
- ✅ **Teacher Dashboard** - Profile, Schedule, Availability
- ✅ **Student Dashboard** - Browse Teachers, Find Teachers, Book Consultation
- ✅ **Admin Dashboard** - Monitoring cards, user management
- ✅ **Password Change** - For both teacher and student
- ✅ **Consultation Booking** - Date/time selection and creation
- ✅ **Database Sync** - Check MongoDB Atlas for new data

---

## Environment Variables Reference

### Server Environment Variables
```env
# MongoDB Connection
ATLAS_URL=mongodb+srv://username:password@cluster.mongodb.net/consultlink?retryWrites=true&w=majority

# Server Config
NODE_ENV=production
PORT=5000 (Vercel uses dynamic port)

# CORS
CLIENT_URL=https://your-vercel-url.vercel.app
```

### Client Environment Variables
```env
# API Base URL
REACT_APP_API_URL=https://your-vercel-url.vercel.app/api
```

---

## Troubleshooting

### Issue: "Failed to fetch data. Are you authorized?"
**Solution:**
1. Check that API requests are going to the correct URL
2. Verify `REACT_APP_API_URL` environment variable is set
3. Check MongoDB Atlas whitelist includes Vercel IPs
4. Verify JWT token is in localStorage

**Debug:**
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
console.log('Token:', localStorage.getItem('token'));
```

### Issue: "CORS error"
**Solution:**
1. Update `CLIENT_URL` in server environment variables
2. Add to Vercel env vars:
   ```
   CLIENT_URL=https://your-vercel-url.vercel.app
   ```
3. Redeploy

### Issue: "Database connection timeout"
**Solution:**
1. Check MongoDB Atlas Network Access
2. Add Vercel IP to whitelist (or use 0.0.0.0/0 for dev)
3. Verify `ATLAS_URL` is correct
4. Check connection string has proper credentials

### Issue: "Build failed"
**Solution:**
1. Check build logs in Vercel dashboard
2. Verify package.json scripts are correct
3. Ensure all dependencies are installed
4. Check for missing environment variables

---

## Post-Deployment Checklist

- [ ] Frontend loads without errors
- [ ] API health check responds (GET /api/health)
- [ ] Login/Register works
- [ ] Teacher dashboard loads with data
- [ ] Student dashboard loads with data
- [ ] Admin dashboard loads with data
- [ ] Consultation booking creates appointments
- [ ] Password change works
- [ ] MongoDB receives new data
- [ ] No console errors in browser DevTools
- [ ] Network requests use correct API URL
- [ ] Environment variables are set in Vercel

---

## Useful Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Your Project:** https://vercel.com/dashboard/projects
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repository:** https://github.com/dxvezxc/consultlink-capstone

---

## Next Steps After Deployment

1. **Monitor Performance:**
   - Vercel Analytics
   - MongoDB Atlas Metrics
   - Check function execution time

2. **Set Up CI/CD:**
   - Automatic deployments on git push
   - Preview deployments for pull requests

3. **Custom Domain:**
   - Add custom domain in Vercel settings
   - Update MongoDB whitelist with new domain
   - Update `CLIENT_URL` environment variable

4. **Optimize:**
   - Enable HTTP/2 Push
   - Configure caching headers
   - Monitor cold start times

---

## Support

For issues or questions:
1. Check Vercel logs: Dashboard → Project → Deployments → Logs
2. Check MongoDB logs: Atlas → Project → Logs
3. Check browser DevTools: F12 → Console & Network tabs
4. Review validation report: `SYSTEM_VALIDATION_REPORT.md`

---

**Deployment Guide Version:** 1.0  
**Last Updated:** February 2, 2026  
**Status:** Ready for Production Deployment
