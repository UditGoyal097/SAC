// Frontend Configuration
// Update the API_BASE_URL to match your backend deployment

const CONFIG = {
  // Development
  DEV_API_BASE: 'http://localhost:5000/api',
  
  // Production - UPDATE THIS with your Render deployment URL
  PROD_API_BASE: 'https://your-render-app.onrender.com/api',
  
  // Get the appropriate API base based on environment
  getApiBase() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return this.DEV_API_BASE;
    }
    return this.PROD_API_BASE;
  }
};

// Use the config
const API_BASE = CONFIG.getApiBase();
