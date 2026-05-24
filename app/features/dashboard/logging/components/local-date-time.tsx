import { useEffect, useState } from "react";

function formatLocalDateTime(value: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    year: "numeric",
  }).format(value);
}

interface LocalDateTimeProps {
  value: Date;
}

export function LocalDateTime({ value }: LocalDateTimeProps) {
  const isoValue = value.toISOString();
  const [label, setLabel] = useState(isoValue);

  useEffect(() => {
    setLabel(formatLocalDateTime(value));
  }, [value]);

  return (
    <time dateTime={isoValue} suppressHydrationWarning title={`UTC ${isoValue}`}>
      {label}
    </time>
  );
}
