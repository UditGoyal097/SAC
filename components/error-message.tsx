import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title: string;
  message: string;
}

export function ErrorMessage({ title, message }: ErrorMessageProps) {
  return (
    <Card className="p-6 bg-red-50 border-red-200">
      <div className="flex gap-4">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-red-700 mt-1">{message}</p>
        </div>
      </div>
    </Card>
  );
}
