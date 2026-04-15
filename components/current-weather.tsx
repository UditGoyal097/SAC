import { Card } from '@/components/ui/card';
import { WeatherIcon } from './weather-icon';

interface CurrentWeatherProps {
  location: {
    name: string;
    region: string;
    country: string;
  };
  temperature: number;
  condition: {
    text: string;
    icon: string;
  };
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  isCelsius: boolean;
}

export function CurrentWeather({
  location,
  temperature,
  condition,
  feelsLike,
  humidity,
  windSpeed,
  pressure,
  visibility,
  isCelsius,
}: CurrentWeatherProps) {
  const tempUnit = isCelsius ? '°C' : '°F';
  const windUnit = isCelsius ? 'km/h' : 'mph';
  const visibilityUnit = isCelsius ? 'km' : 'mi';

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-400 to-blue-600 text-white">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold">
            {location.name}, {location.region}
          </h2>
          <p className="text-blue-100">{location.country}</p>
        </div>
        <div className="text-right">
          <div className="text-6xl font-bold">{Math.round(temperature)}</div>
          <div className="text-blue-100">{tempUnit}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <WeatherIcon
          iconUrl={condition.icon}
          alt={condition.text}
          size={80}
        />
        <div>
          <p className="text-2xl font-semibold">{condition.text}</p>
          <p className="text-blue-100">
            Feels like {Math.round(feelsLike)}{tempUnit}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 bg-opacity-50 p-4 rounded-lg">
          <p className="text-blue-100 text-sm">Humidity</p>
          <p className="text-2xl font-semibold">{humidity}%</p>
        </div>
        <div className="bg-blue-500 bg-opacity-50 p-4 rounded-lg">
          <p className="text-blue-100 text-sm">Wind Speed</p>
          <p className="text-2xl font-semibold">
            {Math.round(windSpeed)} {windUnit}
          </p>
        </div>
        <div className="bg-blue-500 bg-opacity-50 p-4 rounded-lg">
          <p className="text-blue-100 text-sm">Pressure</p>
          <p className="text-2xl font-semibold">{Math.round(pressure)} mb</p>
        </div>
        <div className="bg-blue-500 bg-opacity-50 p-4 rounded-lg">
          <p className="text-blue-100 text-sm">Visibility</p>
          <p className="text-2xl font-semibold">
            {visibility.toFixed(1)} {visibilityUnit}
          </p>
        </div>
      </div>
    </Card>
  );
}
