# 🚀 Deploy CineVerse Frontend to Vercel

This guide will help you deploy your CineVerse frontend to Vercel in minutes.

## 📋 Prerequisites

1. **GitHub Account** - Your code is already on GitHub ✅
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **Backend on Render** - Already running at `https://cineverse-8je0.onrender.com` ✅

---

## 🎯 Step-by-Step Deployment

### **Step 1: Sign Up for Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

### **Step 2: Import Your Project**

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your **CINEVERSE** repository in the list
3. Click **"Import"**

### **Step 3: Configure Project Settings**

Vercel will auto-detect your project. Configure these settings:

**Framework Preset:** Other (or leave as detected)

**Root Directory:** `./` (leave as default)

**Build Command:** Leave empty (no build needed for static site)

**Output Directory:** Leave empty (handled by `vercel.json`)

**Install Command:** Leave empty (no dependencies to install)

### **Step 4: Deploy!**

1. Click **"Deploy"** (no environment variables needed!)
2. Wait 30-60 seconds for deployment to complete
3. You'll get a URL like: `https://your-project.vercel.app`

---

## 🔧 Post-Deployment Configuration

### **CORS is Already Configured**

Your backend on Render is already configured to accept requests from Vercel:
```javascript
origin: ['https://cineverse040406.netlify.app', 'http://localhost:3000', /\.vercel\.app$/]
```

This regex `/\.vercel\.app$/` allows all Vercel preview and production URLs automatically.

### **Custom Domain (Optional)**

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain (e.g., `cineverse.com`)
4. Follow Vercel's DNS configuration instructions

---

## 📁 Project Structure

```
/
├── frontend/
│   ├── index.html        # Static frontend (entry point)
│   ├── script.js         # Frontend logic (connects to Render backend)
│   └── style.css         # Styles
└── vercel.json           # Vercel configuration (points to frontend/)
```

**How it works:**
- Frontend files are served as static assets from the `frontend/` directory
- All API calls go to your Render backend: `https://cineverse-8je0.onrender.com`
- No serverless functions needed - pure static site deployment

---

## 🧪 Testing Your Deployment

After deployment, test your site:

1. **Frontend:** `https://your-project.vercel.app/`
2. **Check Network Tab:** Open DevTools → Network, verify API calls go to `https://cineverse-8je0.onrender.com`
3. **Test Features:**
   - Browse trending movies
   - Search for movies
   - Filter by year/genre
   - Click on a movie to see details

---

## 🐛 Troubleshooting

### **Issue: "CORS error" in browser console**

**Solution:** Your Render backend needs to allow your Vercel domain
1. Go to your Render backend code (`backend/server.js`)
2. Update CORS configuration:
```javascript
origin: ['https://your-vercel-url.vercel.app', /\.vercel\.app$/]
```
3. Push changes to GitHub (Render will auto-deploy)

### **Issue: Frontend loads but no data**

**Solution:** Check backend connection
- Open browser DevTools → Network tab
- Look for failed requests to `https://cineverse-8je0.onrender.com`
- Verify your Render backend is running (visit the URL directly)
- Check if Render backend is in "sleeping" state (free tier sleeps after inactivity)

### **Issue: Slow initial load**

**Solution:** This is normal for Render free tier
- Render free tier "sleeps" after 15 minutes of inactivity
- First request takes 30-60 seconds to "wake up" the backend
- Subsequent requests are fast
- Consider upgrading Render to paid tier for always-on backend

### **Issue: 404 errors on page refresh**

**Solution:** Already handled by `vercel.json`
- The `cleanUrls: true` setting handles this
- If still having issues, check `vercel.json` is properly configured

---

## 🔄 Updating Your Deployment

Every time you push changes to the `frontend/` directory on GitHub:
1. Vercel automatically detects the changes
2. Rebuilds and deploys the new version (takes ~30 seconds)
3. You get a preview URL for each commit

**Manual Redeploy:**
1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click ⋯ on latest deployment → **"Redeploy"**

**Updating Backend:**
- Backend changes are deployed through Render (not Vercel)
- Push backend changes to GitHub → Render auto-deploys
- No changes needed on Vercel side

---

## 💡 Pro Tips

1. **Preview Deployments:** Every branch gets its own preview URL
2. **No Environment Variables Needed:** Backend handles all API keys
3. **Analytics:** Enable Vercel Analytics in project settings (free)
4. **Performance:** Vercel automatically optimizes your static assets
5. **Edge Network:** Your frontend is served from 100+ global locations

---

## 📊 Architecture Overview

```
User Browser
    ↓
Vercel CDN (Frontend - HTML/CSS/JS)
    ↓
Render Backend (API - Node.js/Express)
    ↓
TMDB API (Movie Data)
```

**Benefits of this setup:**
- ✅ Frontend on Vercel: Fast global CDN, instant deployments
- ✅ Backend on Render: Persistent server, database connections, API keys
- ✅ Separation of concerns: Frontend and backend can be updated independently
- ✅ Cost effective: Both have generous free tiers

---

## 🎉 Success!

Your CineVerse frontend is now live on Vercel! Share your URL:
```
https://your-project.vercel.app
```

**What you've deployed:**
- ✅ Static frontend on Vercel (HTML, CSS, JavaScript)
- ✅ Connected to your Render backend API
- ✅ Automatic HTTPS and global CDN
- ✅ Auto-deployments on every push

**Next Steps:**
- Add a custom domain
- Enable Vercel Analytics
- Share with friends! 🚀

---

## 📞 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord:** [vercel.com/discord](https://vercel.com/discord)
- **Render Docs:** [render.com/docs](https://render.com/docs)
