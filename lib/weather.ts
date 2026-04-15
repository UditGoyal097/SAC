const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    humidity: number;
    wind_kph: number;
    wind_mph: number;
    pressure_mb: number;
    visibility_km: number;
    feelslike_c: number;
    feelslike_f: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        maxtemp_f: number;
        mintemp_c: number;
        mintemp_f: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        humidity: number;
        chance_of_rain: number;
      };
    }>;
  };
}

interface GeocodingResult {
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface OpenMeteoWeather {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  pressure_msl: number;
  visibility: number;
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
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
  return descriptions[code] || 'Unknown';
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '⛈️';
  if (code >= 85 && code <= 86) return '🌨️';
  if (code >= 95 && code <= 99) return '⛈️';
  return '🌤️';
}

export async function getCurrentWeather(
  query: string
): Promise<WeatherData | null> {
  try {
    // First, geocode the city name
    const geoResponse = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error('Failed to geocode location');
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return null;
    }

    const location: GeocodingResult = geoData.results[0];

    // Fetch weather data
    const weatherResponse = await fetch(
      `${WEATHER_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current as OpenMeteoWeather;
    const daily = weatherData.daily;

    // Format response to match WeatherData interface
    const formattedData: WeatherData = {
      location: {
        name: location.name,
        region: location.admin1 || '',
        country: location.country,
        lat: location.latitude,
        lon: location.longitude,
      },
      current: {
        temp_c: current.temperature_2m,
        temp_f: (current.temperature_2m * 9/5) + 32,
        condition: {
          text: getWeatherDescription(current.weather_code),
          icon: getWeatherIcon(current.weather_code),
          code: current.weather_code,
        },
        humidity: current.relative_humidity_2m,
        wind_kph: current.wind_speed_10m,
        wind_mph: current.wind_speed_10m * 0.621371,
        pressure_mb: current.pressure_msl,
        visibility_km: current.visibility / 1000,
        feelslike_c: current.apparent_temperature,
        feelslike_f: (current.apparent_temperature * 9/5) + 32,
      },
      forecast: {
        forecastday: daily.time.slice(0, 5).map((date: string, index: number) => ({
          date,
          day: {
            maxtemp_c: daily.temperature_2m_max[index],
            maxtemp_f: (daily.temperature_2m_max[index] * 9/5) + 32,
            mintemp_c: daily.temperature_2m_min[index],
            mintemp_f: (daily.temperature_2m_min[index] * 9/5) + 32,
            condition: {
              text: getWeatherDescription(daily.weather_code[index]),
              icon: getWeatherIcon(daily.weather_code[index]),
              code: daily.weather_code[index],
            },
            humidity: 0,
            chance_of_rain: daily.precipitation_probability_max[index] || 0,
          },
        })),
      },
    };

    return formattedData;
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return null;
  }
}

export async function searchCities(query: string): Promise<Array<{
  id: number;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  url: string;
}> | null> {
  try {
    const response = await fetch(
      `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results.map((result: GeocodingResult, index: number) => ({
      id: index,
      name: result.name,
      region: result.admin1 || '',
      country: result.country,
      lat: result.latitude,
      lon: result.longitude,
      url: '',
    }));
  } catch (error) {
    console.error('Failed to search cities:', error);
    return null;
  }
}
