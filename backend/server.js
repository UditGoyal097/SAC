const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const favoritesRoutes = require('./routes/favorites');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'http://127.0.0.1:5000',
    'https://uditgoyal097.github.io'
  ],
  credentials: true
}));

// Serve static frontend files from root
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoritesRoutes);

// Weather proxy endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ error: 'City parameter required' });
    }

    // Geocode the city
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'City not found' });
    }

    const location = geoData.results[0];

    // Fetch weather data
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
    );
    const weatherData = await weatherResponse.json();

    // Format response
    const current = weatherData.current;
    const daily = weatherData.daily;

    res.json({
      location: {
        name: location.name,
        region: location.admin1 || '',
        country: location.country,
        lat: location.latitude,
        lon: location.longitude,
      },
      current: {
        temp_c: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        wind_kph: current.wind_speed_10m,
        pressure_mb: current.pressure_msl,
        visibility_km: current.visibility / 1000,
        feelslike_c: current.apparent_temperature,
        weather_code: current.weather_code,
      },
      forecast: daily.time.slice(0, 5).map((date, index) => ({
        date,
        maxtemp_c: daily.temperature_2m_max[index],
        mintemp_c: daily.temperature_2m_min[index],
        weather_code: daily.weather_code[index],
        chance_of_rain: daily.precipitation_probability_max[index] || 0,
      })),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Root endpoint serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(404).send('index.html not found');
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
