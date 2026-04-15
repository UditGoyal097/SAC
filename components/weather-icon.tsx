import Image from 'next/image';

interface WeatherIconProps {
  iconUrl: string;
  alt: string;
  size?: number;
}

export function WeatherIcon({ iconUrl, alt, size = 64 }: WeatherIconProps) {
  // Ensure the icon URL has the correct protocol
  const fullIconUrl = iconUrl.startsWith('http')
    ? iconUrl
    : `https:${iconUrl}`;

  return (
    <Image
      src={fullIconUrl}
      alt={alt}
      width={size}
      height={size}
      priority
      unoptimized
    />
  );
}
