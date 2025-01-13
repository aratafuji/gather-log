export function compareDates(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return dateB.getTime() - dateA.getTime();
}

