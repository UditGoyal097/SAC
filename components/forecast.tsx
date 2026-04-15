import { Card } from '@/components/ui/card';
import { WeatherIcon } from './weather-icon';

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: {
    text: string;
    icon: string;
  };
  chanceOfRain: number;
}

interface ForecastProps {
  days: ForecastDay[];
  isCelsius: boolean;
}

export function Forecast({ days, isCelsius }: ForecastProps) {
  const tempUnit = isCelsius ? '°C' : '°F';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">5-Day Forecast</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {days.map((day, index) => (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
            <p className="font-semibold mb-3 text-center">
              {formatDate(day.date)}
            </p>

            <div className="flex justify-center mb-3">
              <WeatherIcon
                iconUrl={day.condition.icon}
                alt={day.condition.text}
                size={48}
              />
            </div>

            <p className="text-sm text-center text-muted-foreground mb-3">
              {day.condition.text}
            </p>

            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs text-muted-foreground">Max</p>
                <p className="font-semibold">
                  {Math.round(day.maxTemp)}{tempUnit}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Min</p>
                <p className="font-semibold">
                  {Math.round(day.minTemp)}{tempUnit}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Chance of Rain</p>
              <p className="font-semibold text-blue-600">
                {day.chanceOfRain}%
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
