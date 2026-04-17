# Deployment Guide - Option 1

Deploy backend to Render.com (free) and frontend to GitHub Pages.

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Connect your repository

### Step 2: Create a Web Service
1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repository (UditGoyal097/SAC)
4. Configure:
   - **Name:** `sac-weather` (or any name)
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Free Plan:** Select it

### Step 3: Set Environment Variables
1. In Render dashboard, go to your service
2. Click "Environment"
3. Add:
   ```
   PORT=5000
   JWT_SECRET=your_secret_key_here_change_in_production
   NODE_ENV=production
   ```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. You'll get a URL like: `https://sac-weather.onrender.com`

**Save this URL!** You'll need it for the frontend.

---

## Part 2: Update Frontend with Backend URL

1. Open `frontend/index.js`
2. Find line 2-3:
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000/api'
     : 'https://your-render-app.onrender.com/api';
   ```
3. Replace `https://your-render-app.onrender.com` with your actual Render URL + `/api`
   
   **Example:**
   ```javascript
   const API_BASE = window.location.hostname === 'localhost' 
     ? 'http://localhost:5000/api'
     : 'https://sac-weather.onrender.com/api';
   ```

---

## Part 3: Deploy Frontend to GitHub Pages

### Step 1: Update `package.json`
Add homepage:
```json
{
  "homepage": "https://UditGoyal097.github.io/SAC",
  ...
}
```

### Step 2: Enable GitHub Pages in Your Repository
1. Go to your GitHub repo (UditGoyal097/SAC)
2. Settings → Pages
3. Under "Source", select:
   - Branch: `main`
   - Folder: `frontend` (NOT root)
4. Click "Save"

### Step 3: Update HTML Base Path (if serving from subfolder)
The frontend assets may need a base path. You can either:

**Option A:** Serve from GitHub Pages root
- Keep everything as is, GitHub Pages will work automatically

**Option B:** If you want a clean URL
- The current setup should work fine

### Step 4: Verify Deployment
1. Wait 2-3 minutes for GitHub Pages to build
2. Visit: `https://UditGoyal097.github.io/SAC`
3. You should see the weather app!

---

## Testing

### Local Development
```bash
npm run dev
```
App runs on `http://localhost:5000` and uses local backend.

### Production
Frontend: `https://UditGoyal097.github.io/SAC`
Backend: `https://sac-weather.onrender.com`

---

## Troubleshooting

### Backend deployment fails
- Check `npm start` works locally: `npm start`
- Verify `backend/server.js` exists
- Check environment variables are set

### Frontend can't reach backend
- Verify backend URL in `frontend/index.js`
- Check CORS is enabled in `backend/server.js`
- Check browser console for error messages

### GitHub Pages shows README instead of app
- Make sure the branch/folder settings point to `frontend` folder
- Or ensure `index.html` is in the right location

---

## After Deployment

1. **Test the app:**
   - Sign up with an account
   - Search for a city
   - Add to favorites
   - Toggle temperature

2. **Share your live URL:**
   ```
   Frontend: https://UditGoyal097.github.io/SAC
   Backend: https://sac-weather.onrender.com
   ```

3. **Keep backend alive:**
   - Render's free tier spins down after 15 minutes of inactivity
   - First request takes ~30 seconds to wake up
   - Upgrade to paid plan if you need instant response

---

## Next Steps

- Monitor both deployments
- Update the API URL if backend URL changes
- Consider upgrading Render to paid plan for always-on backend
