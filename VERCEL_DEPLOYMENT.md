# 🚀 Deploy CineVerse to Vercel

This guide will help you deploy your CineVerse project to Vercel in minutes.

## 📋 Prerequisites

1. **GitHub Account** - Your code is already on GitHub ✅
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **TMDB API Key** - Get it from [themoviedb.org](https://www.themoviedb.org/settings/api)

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

**Build Command:** Leave empty (static site + serverless functions)

**Output Directory:** Leave empty

**Install Command:** `cd backend && npm install`

### **Step 4: Add Environment Variables**

This is **CRITICAL** - your app won't work without this!

1. In the **"Environment Variables"** section, add:

   ```
   Key: TMDB_BEARER_TOKEN
   Value: [Your TMDB Bearer Token]
   ```

2. Make sure it's enabled for **Production**, **Preview**, and **Development**

### **Step 5: Deploy!**

1. Click **"Deploy"**
2. Wait 1-2 minutes for the build to complete
3. You'll get a URL like: `https://your-project.vercel.app`

---

## 🔧 Post-Deployment Configuration

### **Update CORS Settings (if needed)**

Your backend is already configured to accept Vercel domains:
```javascript
origin: ['https://cineverse040406.netlify.app', 'http://localhost:3000', /\.vercel\.app$/]
```

This regex `/\.vercel\.app$/` allows all Vercel preview and production URLs.

### **Custom Domain (Optional)**

1. Go to your project settings in Vercel
2. Click **"Domains"**
3. Add your custom domain (e.g., `cineverse.com`)
4. Follow Vercel's DNS configuration instructions

---

## 📁 Project Structure on Vercel

```
/
├── api/
│   └── index.js          # Serverless function entry point
├── backend/
│   ├── server.js         # Express app (runs as serverless)
│   └── package.json      # Backend dependencies
├── frontend/
│   ├── index.html        # Static frontend
│   ├── script.js         # Frontend logic
│   └── style.css         # Styles
└── vercel.json           # Vercel configuration
```

**How it works:**
- Frontend files are served as static assets
- Backend runs as serverless functions at `/api/*` routes
- `vercel.json` routes requests appropriately

---

## 🧪 Testing Your Deployment

After deployment, test these URLs:

1. **Frontend:** `https://your-project.vercel.app/`
2. **API Health:** `https://your-project.vercel.app/api/`
3. **Trending:** `https://your-project.vercel.app/api/trending`
4. **Movies:** `https://your-project.vercel.app/api/movies`

---

## 🐛 Troubleshooting

### **Issue: "TMDB error" or API not working**

**Solution:** Check environment variables
1. Go to Project Settings → Environment Variables
2. Verify `TMDB_BEARER_TOKEN` is set correctly
3. Redeploy: Deployments → ⋯ → Redeploy

### **Issue: "CORS error" in browser console**

**Solution:** Update CORS origin in `backend/server.js`
```javascript
origin: ['your-vercel-url.vercel.app', /\.vercel\.app$/]
```

### **Issue: Frontend loads but no data**

**Solution:** Check API routes
- Open browser DevTools → Network tab
- Look for failed requests to `/api/*`
- Check if requests are going to the correct URL

### **Issue: "Module not found" error**

**Solution:** Ensure dependencies are installed
1. Check `backend/package.json` has all dependencies
2. Redeploy the project

---

## 🔄 Updating Your Deployment

Every time you push to GitHub:
1. Vercel automatically detects the changes
2. Builds and deploys the new version
3. You get a preview URL for each commit

**Manual Redeploy:**
1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"**
4. Click ⋯ on latest deployment → **"Redeploy"**

---

## 💡 Pro Tips

1. **Preview Deployments:** Every branch gets its own preview URL
2. **Environment Variables:** Use different values for Production vs Preview
3. **Analytics:** Enable Vercel Analytics in project settings (free)
4. **Logs:** Check Function Logs in Vercel dashboard for debugging
5. **Performance:** Vercel automatically optimizes your static assets

---

## 📊 Vercel vs Render (Your Current Backend)

| Feature | Vercel | Render |
|---------|--------|--------|
| **Frontend Hosting** | ✅ Excellent | ❌ Not specialized |
| **Serverless Functions** | ✅ Built-in | ❌ Requires separate service |
| **Auto-scaling** | ✅ Automatic | ⚠️ Manual |
| **Cold Starts** | ~100-300ms | ~1-2s |
| **Free Tier** | ✅ Generous | ✅ Good |
| **Custom Domains** | ✅ Free SSL | ✅ Free SSL |
| **CI/CD** | ✅ Automatic | ✅ Automatic |

**Recommendation:** Use Vercel for this project - it's perfect for your stack!

---

## 🎉 Success!

Your CineVerse app is now live on Vercel! Share your URL:
```
https://your-project.vercel.app
```

**Next Steps:**
- Add a custom domain
- Enable Vercel Analytics
- Monitor function logs
- Share with friends! 🚀

---

## 📞 Need Help?

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord:** [vercel.com/discord](https://vercel.com/discord)
- **TMDB API Docs:** [developers.themoviedb.org](https://developers.themoviedb.org)
