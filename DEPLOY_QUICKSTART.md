# Vercel Deployment - Quick Start

## 🚀 Deploy in 5 Minutes

### Step 1: Go to Vercel
Visit: https://vercel.com/dashboard

### Step 2: Click "Add New"
Select "Project" → "Import Git Repository"

### Step 3: Import Your Repo
Search for: `consultlink-capstone`
Click "Import"

### Step 4: Add Environment Variables
In the "Environment Variables" section, add:

```
ATLAS_URL = [Your MongoDB Atlas connection string]
REACT_APP_API_URL = https://[YOUR-DEPLOYMENT].vercel.app/api
NODE_ENV = production
```

To get your MongoDB connection string:
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Connect → Copy connection string
3. Replace `<password>` with your MongoDB password

### Step 5: Deploy
Click "Deploy" and wait for the build to complete

### Step 6: Update MongoDB Whitelist
1. Go to MongoDB Atlas
2. Network Access → IP Whitelist
3. Add: `0.0.0.0/0` (or add Vercel's specific IPs)
4. Confirm

### Step 7: Test
Once deployment is complete:
1. Visit your Vercel URL
2. Try login/register
3. Check the admin dashboard

## 📋 Important Notes

- **Your deployment URL:** Will be provided by Vercel after build completes
- **API Base URL:** Must end with `/api` (example: `https://myapp.vercel.app/api`)
- **MongoDB Access:** Whitelist must allow Vercel's IP addresses
- **Cold Start:** First request may take 5-10 seconds (serverless function startup)

## 🔗 Files Created for Deployment

1. **vercel.json** - Monorepo configuration
2. **VERCEL_DEPLOYMENT_GUIDE.md** - Detailed guide
3. **.env.example** - Environment variables template

## 🆘 Something Not Working?

1. Check Vercel Logs:
   - Dashboard → Your Project → Deployments → Click latest → Logs

2. Check MongoDB Connection:
   - Test connection string in MongoDB Compass or shell
   - Verify IP whitelist

3. Check API Response:
   - Visit `https://your-url.vercel.app/api/health`
   - Should return JSON with status

4. Check Frontend:
   - Open DevTools (F12) → Console tab
   - Look for error messages
   - Check Network tab to see API requests

## 📞 Quick Links

- **Vercel Status:** https://vercel.com/status
- **MongoDB Atlas:** https://cloud.mongodb.com
- **GitHub Repo:** https://github.com/dxvezxc/consultlink-capstone
- **Full Guide:** See `VERCEL_DEPLOYMENT_GUIDE.md`

---

**Ready to deploy? Start at Step 1 above! 🎉**
