// API URLs
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

// State
let currentWeatherData = null;
let isCelsius = true;

// Weather code to description mapping
const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with hail',
};

// Weather code to emoji mapping
const weatherEmojis = {
    0: '☀️',
    1: '🌤️',
    2: '🌤️',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌦️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    77: '❄️',
    80: '⛈️',
    81: '⛈️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️',
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const temperatureToggle = document.getElementById('temperatureToggle');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const currentWeather = document.getElementById('currentWeather');
const forecast = document.getElementById('forecast');
const emptyState = document.getElementById('emptyState');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load temperature preference from localStorage
    const savedPreference = localStorage.getItem('temperatureUnit');
    if (savedPreference === 'fahrenheit') {
        isCelsius = false;
        updateTemperatureToggle();
    }

    // Fetch weather for London on load
    fetchWeather('London');

    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    temperatureToggle.addEventListener('click', handleTemperatureToggle);
});

function handleSearch() {
    const city = searchInput.value.trim();
    if (city) {
        fetchWeather(city);
    }
}

function handleTemperatureToggle() {
    isCelsius = !isCelsius;
    localStorage.setItem('temperatureUnit', isCelsius ? 'celsius' : 'fahrenheit');
    updateTemperatureToggle();
    if (currentWeatherData) {
        updateWeatherDisplay();
    }
}

function updateTemperatureToggle() {
    const label = document.querySelector('.toggle-label');
    label.textContent = isCelsius ? '°C' : '°F';
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

    try {
        // Geocod the city name
        const geoResponse = await fetch(
            `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
        );

        if (!geoResponse.ok) {
            throw new Error('Failed to geocode location');
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showError(`Could not find weather data for "${city}". Please try another city.`);
            showLoading(false);
            return;
        }

        const location = geoData.results[0];

        // Fetch weather data
        const weatherResponse = await fetch(
            `${WEATHER_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
        );

        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;
        const daily = weatherData.daily;

        // Format the data
        currentWeatherData = {
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
        };

        showLoading(false);
        updateWeatherDisplay();
        showWeatherContent();
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        showError('Failed to fetch weather data. Please try again.');
        showLoading(false);
    }
}

function updateWeatherDisplay() {
    if (!currentWeatherData) return;

    const { location, current, forecast: forecastDays } = currentWeatherData;

    // Update location
    document.getElementById('locationName').textContent = location.name;
    document.getElementById('locationRegion').textContent = `${location.region ? location.region + ', ' : ''}${location.country}`;

    // Update current weather
    const temp = isCelsius ? current.temp_c : celsiusToFahrenheit(current.temp_c);
    const feelsLike = isCelsius ? current.feelslike_c : celsiusToFahrenheit(current.feelslike_c);
    const visibility = isCelsius ? current.visibility_km : current.visibility_km * 0.621371;
    const windSpeed = isCelsius ? current.wind_kph : current.wind_kph * 0.621371;
    const windUnit = isCelsius ? 'km/h' : 'mph';
    const visibilityUnit = isCelsius ? 'km' : 'mi';
    const temperatureUnit = isCelsius ? '°C' : '°F';

    document.getElementById('temperatureValue').textContent = Math.round(temp);
    document.getElementById('temperatureUnit').textContent = temperatureUnit;
    document.getElementById('feelsLike').textContent = Math.round(feelsLike);
    document.getElementById('humidity').textContent = `${current.humidity}%`;
    document.getElementById('windSpeed').textContent = Math.round(windSpeed);
    document.getElementById('windUnit').textContent = windUnit;
    document.getElementById('pressure').textContent = Math.round(current.pressure_mb);
    document.getElementById('visibility').textContent = visibility.toFixed(1);
    document.getElementById('visibilityUnit').textContent = visibilityUnit;

    const weatherIcon = getWeatherIcon(current.weather_code);
    const weatherDescription = getWeatherDescription(current.weather_code);
    document.getElementById('weatherIcon').textContent = weatherIcon;
    document.getElementById('weatherCondition').textContent = weatherDescription;

    // Update forecast
    const forecastGrid = document.getElementById('forecastGrid');
    forecastGrid.innerHTML = '';

    forecastDays.forEach((day) => {
        const maxTemp = isCelsius ? day.maxtemp_c : celsiusToFahrenheit(day.maxtemp_c);
        const minTemp = isCelsius ? day.mintemp_c : celsiusToFahrenheit(day.mintemp_c);
        const icon = getWeatherIcon(day.weather_code);
        const description = getWeatherDescription(day.weather_code);
        const dateObj = new Date(day.date);
        const dateStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-icon">${icon}</div>
            <div class="forecast-condition">${description}</div>
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
