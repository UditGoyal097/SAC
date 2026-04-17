# Full Stack Weather App

A modern weather application with user authentication, favorite city management, and a beautiful responsive UI.

## Features

- 🌤️ Real-time weather data from Open-Meteo API
- 👤 User authentication (signup/login)
- ⭐ Save favorite cities  
- 🌡️ Temperature unit toggle (Celsius/Fahrenheit)
- 📱 Fully responsive design
- 🌓 Dark mode support
- 📊 5-day weather forecast

## Project Structure

```
/SAC/
├── frontend/              # Frontend files
│   ├── index.html        # Main HTML
│   ├── index.js          # Client-side JavaScript
│   └── style.css         # Styles
│
├── backend/              # Express.js backend
│   ├── server.js         # Main server
│   ├── routes/
│   │   ├── auth.js       # Authentication routes
│   │   └── favorites.js  # Favorite cities routes
│   ├── models/
│   │   └── User.js       # User model with JSON storage
│   └── middleware/
│       └── auth.js       # JWT authentication middleware
│
├── package.json          # Dependencies
├── .env                  # Environment variables
└── data/                 # User data (auto-created)
    └── users.json        # User accounts storage
```

## Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. The .env file is already configured. Update JWT_SECRET if needed for production.

### Running the App

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

Open your browser and navigate to `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login to existing account
- `GET /api/auth/me` - Get current user (requires auth token)

### Weather
- `GET /api/weather?city=<city>` - Get weather for a city

### Favorites
- `GET /api/favorites` - Get user's favorite cities (requires auth token)
- `POST /api/favorites` - Add city to favorites (requires auth token)
- `DELETE /api/favorites/:city` - Remove city from favorites (requires auth token)

## Authentication

The app uses JWT (JSON Web Tokens) for authentication. After login/signup, the token is stored in `localStorage` and automatically sent with API requests.

## Data Storage

User data is stored as JSON in `data/users.json`. Passwords are hashed using bcryptjs.

## Technologies Used

- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework dependencies)
- **Backend:** Node.js + Express.js
- **Authentication:** JWT + bcryptjs
- **Data:** JSON file storage
- **Weather API:** Open-Meteo (free, no API key required)

## License

MIT
