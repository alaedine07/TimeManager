// frontend/src/app/utils/time-format.util.ts
export function formatTimeSpan(timeSpan: string): string {
  // Example: "00:07:51.7996112"
  const parts = timeSpan.split(':');
  if (parts.length < 3) return '0h 0m';

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return `${hours}h ${minutes}m`;
}
