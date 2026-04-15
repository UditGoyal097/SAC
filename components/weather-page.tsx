'use client';

import { useState, useEffect } from 'react';
import { SearchBar } from './search-bar';
import { CurrentWeather } from './current-weather';
import { Forecast } from './forecast';
import { TemperatureToggle } from './temperature-toggle';
import { LoadingSpinner } from './loading-spinner';
import { ErrorMessage } from './error-message';
import { getCurrentWeather, type WeatherData } from '@/lib/weather';

export function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);

  // Load temperature preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('temperatureUnit');
    if (savedPreference === 'fahrenheit') {
      setIsCelsius(false);
    }
  }, []);

  // Fetch weather for London on mount
  useEffect(() => {
    fetchWeather('London');
  }, []);

  const fetchWeather = async (city: string) => {
    setIsLoading(true);
    setError(null);

    const data = await getCurrentWeather(city);

    if (data) {
      setWeather(data);
      setError(null);
    } else {
      setError(
        `Could not find weather data for "${city}". Please try another city.`
      );
      setWeather(null);
    }

    setIsLoading(false);
  };

  const handleSearch = (city: string) => {
    fetchWeather(city);
  };

  const handleTemperatureToggle = () => {
    const newValue = !isCelsius;
    setIsCelsius(newValue);
    localStorage.setItem(
      'temperatureUnit',
      newValue ? 'celsius' : 'fahrenheit'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold">Weather App</h1>
            <p className="text-muted-foreground mt-2">
              Check the weather anywhere
            </p>
          </div>
          <TemperatureToggle
            isCelsius={isCelsius}
            onToggle={handleTemperatureToggle}
          />
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Error Message */}
        {error && (
          <ErrorMessage
            title="Weather Not Found"
            message={error}
          />
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Weather Content */}
        {!isLoading && weather && (
          <>
            {/* Current Weather */}
            <CurrentWeather
              location={weather.location}
              temperature={
                isCelsius
                  ? weather.current.temp_c
                  : weather.current.temp_f
              }
              condition={weather.current.condition}
              feelsLike={
                isCelsius
                  ? weather.current.feelslike_c
                  : weather.current.feelslike_f
              }
              humidity={weather.current.humidity}
              windSpeed={
                isCelsius
                  ? weather.current.wind_kph
                  : weather.current.wind_mph
              }
              pressure={weather.current.pressure_mb}
              visibility={
                isCelsius
                  ? weather.current.visibility_km
                  : weather.current.visibility_km * 0.621371
              }
              isCelsius={isCelsius}
            />

            {/* 5-Day Forecast */}
            <Forecast
              days={weather.forecast.forecastday.map((day) => ({
                date: day.date,
                maxTemp: isCelsius
                  ? day.day.maxtemp_c
                  : day.day.maxtemp_f,
                minTemp: isCelsius
                  ? day.day.mintemp_c
                  : day.day.mintemp_f,
                condition: day.day.condition,
                chanceOfRain: day.day.chance_of_rain,
              }))}
              isCelsius={isCelsius}
            />
          </>
        )}

        {/* Empty State */}
        {!isLoading && !weather && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
