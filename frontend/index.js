// API Configuration
const API_BASE = 'http://localhost:5000/api';

// State
let currentWeatherData = null;
let isCelsius = true;
let authToken = null;
let currentUser = null;
let currentCity = null;

// Weather code to description mapping
const weatherDescriptions = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Foggy', 51: 'Light drizzle', 53: 'Moderate drizzle',
    55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

const weatherEmojis = {
    0: '☀️', 1: '🌤️', 2: '🌤️', 3: '☁️', 45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️', 80: '⛈️', 81: '⛈️',
    82: '⛈️', 85: '🌨️', 86: '🌨️', 95: '⛈️', 96: '⛈️', 99: '⛈️',
};

// DOM Elements
const authModal = document.getElementById('authModal');
const authForm = document.getElementById('authForm');
const authTitle = document.getElementById('authTitle');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authConfirm = document.getElementById('authConfirm');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authError = document.getElementById('authError');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const authToggleBtn = document.getElementById('authToggleBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userEmail = document.getElementById('userEmail');
const favoritesContainer = document.getElementById('favoritesContainer');
const favoritesGrid = document.getElementById('favoritesGrid');
const favoriteBtn = document.getElementById('favoriteBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const temperatureToggle = document.getElementById('temperatureToggle');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');
const emptyState = document.getElementById('emptyState');

let isSignupMode = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load saved token and preferences
    authToken = localStorage.getItem('authToken');
    const savedPreference = localStorage.getItem('temperatureUnit');
    if (savedPreference === 'fahrenheit') {
        isCelsius = false;
        updateTemperatureToggle();
    }

    if (authToken) {
        loadUserData();
    } else {
        showEmptyState();
    }

    // Event listeners
    authToggleBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
    closeAuthBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    logoutBtn.addEventListener('click', handleLogout);
    toggleAuthMode.addEventListener('click', toggleAuthForm);
    authForm.addEventListener('submit', handleAuth);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
    temperatureToggle.addEventListener('click', handleTemperatureToggle);
    favoriteBtn.addEventListener('click', handleFavorite);

    // Close modal when clicking outside
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) authModal.classList.add('hidden');
    });
});

function toggleAuthForm() {
    isSignupMode = !isSignupMode;
    authTitle.textContent = isSignupMode ? 'Sign Up' : 'Login';
    authSubmitBtn.textContent = isSignupMode ? 'Sign Up' : 'Login';
    authConfirm.classList.toggle('hidden');
    toggleAuthMode.textContent = isSignupMode ? 'Already have an account? Login' : "Don't have an account? Sign up";
}

async function handleAuth(e) {
    e.preventDefault();
    authError.classList.add('hidden');

    const email = authEmail.value.trim();
    const password = authPassword.value;
    const confirmPassword = authConfirm.value;

    if (!email || !password) {
        showAuthError('Email and password are required');
        return;
    }

    if (isSignupMode && password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }

    try {
        const endpoint = isSignupMode ? '/signup' : '/login';
        const response = await fetch(`${API_BASE}/auth${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                confirmPassword: isSignupMode ? confirmPassword : undefined,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            showAuthError(data.error || 'Authentication failed');
            return;
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);

        authModal.classList.add('hidden');
        authForm.reset();
        updateAuthUI();
        loadFavorites();
    } catch (error) {
        console.error('Auth error:', error);
        showAuthError('Failed to authenticate. Please try again.');
    }
}

function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
}

async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
            loadFavorites();
        } else {
            logoutOnUnauth();
        }
    } catch (error) {
        console.error('Failed to load user data:', error);
        logoutOnUnauth();
    }
}

async function loadFavorites() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE}/favorites`, {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.ok) {
            const favorites = await response.json();
            if (favorites.length > 0) {
                displayFavorites(favorites);
            }
        }
    } catch (error) {
        console.error('Failed to load favorites:', error);
    }
}

function displayFavorites(favorites) {
    favoritesContainer.classList.remove('hidden');
    favoritesGrid.innerHTML = '';

    favorites.forEach((city) => {
        const card = document.createElement('button');
        card.className = 'favorite-card';
        card.textContent = city;
        card.addEventListener('click', () => {
            searchInput.value = city;
            fetchWeather(city);
        });
        favoritesGrid.appendChild(card);
    });
}

async function handleFavorite() {
    if (!authToken || !currentCity) {
        alert('Please login and search for a city first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/favorites`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ city: currentCity }),
        });

        const data = await response.json();

        if (response.ok) {
            favoriteBtn.classList.add('active');
            if (data.favorites) {
                displayFavorites(data.favorites);
            }
        } else {
            alert(data.error || 'Failed to add favorite');
        }
    } catch (error) {
        console.error('Favorite error:', error);
        alert('Failed to add favorite');
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    updateAuthUI();
    favoritesContainer.classList.add('hidden');
    showEmptyState();
}

function logoutOnUnauth() {
    handleLogout();
    alert('Session expired. Please login again.');
    authModal.classList.remove('hidden');
}

function updateAuthUI() {
    if (currentUser) {
        authToggleBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = currentUser.email;
        document.querySelector('.header-buttons').style.gap = '0.5rem';
    } else {
        authToggleBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        userInfo.classList.add('hidden');
    }
}

function handleSearch() {
    const city = searchInput.value.trim();
    if (city) fetchWeather(city);
}

function handleTemperatureToggle() {
    isCelsius = !isCelsius;
    localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    updateTemperatureToggle();
    if (currentWeatherData) updateWeatherDisplay();
}

function updateTemperatureToggle() {
    document.querySelector('.toggle-label').textContent = isCelsius ? '°C' : '°F';
}

function getWeatherDescription(code) {
    return weatherDescriptions[code] || 'Unknown';
}

function getWeatherIcon(code) {
    return weatherEmojis[code] || '🌤️';
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

async function fetchWeather(city) {
    showLoading(true);
    hideError();
    currentCity = city;
    favoriteBtn.classList.remove('active');

    try {
        const response = await fetch(`${API_BASE}/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok) {
            showError(`Could not find weather data for "${city}". Please try another city.`);
            showLoading(false);
            return;
        }

        currentWeatherData = data;
        showLoading(false);
        updateWeatherDisplay();
        showWeatherContent();

        // Check if already favorited
        if (currentUser && currentUser.favorites?.includes(city)) {
            favoriteBtn.classList.add('active');
        }
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError('Failed to fetch weather data. Please try again.');
        showLoading(false);
    }
}

function updateWeatherDisplay() {
    if (!currentWeatherData) return;

    const { location, current, forecast: forecastDays } = currentWeatherData;

    document.getElementById('locationName').textContent = location.name;
    document.getElementById('locationRegion').textContent = `${location.region ? location.region + ', ' : ''}${location.country}`;

    const temp = isCelsius ? current.temp_c : celsiusToFahrenheit(current.temp_c);
    const feelsLike = isCelsius ? current.feelslike_c : celsiusToFahrenheit(current.feelslike_c);
    const visibility = isCelsius ? current.visibility_km : current.visibility_km * 0.621371;
    const windSpeed = isCelsius ? current.wind_kph : current.wind_kph * 0.621371;

    document.getElementById('temperatureValue').textContent = Math.round(temp);
    document.getElementById('temperatureUnit').textContent = isCelsius ? '°C' : '°F';
    document.getElementById('feelsLike').textContent = Math.round(feelsLike);
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('windSpeed').textContent = Math.round(windSpeed);
    document.getElementById('windUnit').textContent = isCelsius ? 'km/h' : 'mph';
    document.getElementById('pressure').textContent = Math.round(current.pressure_mb);
    document.getElementById('visibility').textContent = visibility.toFixed(1);
    document.getElementById('visibilityUnit').textContent = isCelsius ? 'km' : 'mi';
    document.getElementById('weatherIcon').textContent = getWeatherIcon(current.weather_code);
    document.getElementById('weatherCondition').textContent = getWeatherDescription(current.weather_code);

    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    forecastDays.forEach((day) => {
        const maxTemp = isCelsius ? day.maxtemp_c : celsiusToFahrenheit(day.maxtemp_c);
        const minTemp = isCelsius ? day.mintemp_c : celsiusToFahrenheit(day.mintemp_c);
        const dateObj = new Date(day.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">${getWeatherIcon(day.weather_code)}</div>
            <div class="forecast-condition">${getWeatherDescription(day.weather_code)}</div>
            <div class="forecast-temps">
                <span class="forecast-temp-max">${Math.round(maxTemp)}°</span>
                <span class="forecast-temp-min">${Math.round(minTemp)}°</span>
            </div>
            <div class="forecast-rain">💧 ${day.chance_of_rain}%</div>
        `;
        forecastGrid.appendChild(forecastDay);
    });
}

function showWeatherContent() {
    errorMessage.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
    emptyState.classList.add('hidden');
    currentWeather.classList.remove('hidden');
    forecast.classList.remove('hidden');
}

function showError(message) {
    document.getElementById('errorBody').textContent = message;
    errorMessage.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
    emptyState.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
        currentWeather.classList.add('hidden');
        forecast.classList.add('hidden');
        errorMessage.classList.add('hidden');
        emptyState.classList.add('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showEmptyState() {
    emptyState.classList.remove('hidden');
    currentWeather.classList.add('hidden');
    forecast.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loadingSpinner.classList.add('hidden');
}
