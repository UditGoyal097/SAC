'use client';

import { Button } from '@/components/ui/button';

interface TemperatureToggleProps {
  isCelsius: boolean;
  onToggle: () => void;
}

export function TemperatureToggle({
  isCelsius,
  onToggle,
}: TemperatureToggleProps) {
  return (
    <div className="flex gap-2 bg-muted p-1 rounded-lg">
      <Button
        variant={isCelsius ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggle}
        className="w-12"
      >
        °C
      </Button>
      <Button
        variant={!isCelsius ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggle}
        className="w-12"
      >
        °F
      </Button>
    </div>
  );
}
