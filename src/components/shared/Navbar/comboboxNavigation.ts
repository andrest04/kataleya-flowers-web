export function nextActiveIndex(current: number, key: string, count: number): number {
  if (count <= 0) return -1;
  const index = current >= 0 && current < count ? current : -1;

  switch (key) {
    case "ArrowDown":
      return index === count - 1 ? 0 : index + 1;
    case "ArrowUp":
      return index <= 0 ? count - 1 : index - 1;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return index;
  }
}
