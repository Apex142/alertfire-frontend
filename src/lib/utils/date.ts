export function formatHour(time: string): string {
  return time.replace(':', 'H');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
} 