import Image from 'next/image';

interface WeatherIconProps {
  iconUrl: string;
  alt: string;
  size?: number;
}

export function WeatherIcon({ iconUrl, alt, size = 64 }: WeatherIconProps) {
  const isUrlIcon =
    iconUrl.startsWith('http://') ||
    iconUrl.startsWith('https://') ||
    iconUrl.startsWith('//');

  if (!isUrlIcon) {
    return (
      <span
        role="img"
        aria-label={alt}
        style={{ fontSize: `${size}px`, lineHeight: 1 }}
      >
        {iconUrl}
      </span>
    );
  }

  const fullIconUrl = iconUrl.startsWith('//') ? `https:${iconUrl}` : iconUrl;

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
