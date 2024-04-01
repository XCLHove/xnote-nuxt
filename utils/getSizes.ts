export const getSizes = (total: number, minSize?: number, maxSize?: number) => {
  if (!minSize) minSize = 10;
  if (!maxSize) maxSize = 200;
  maxSize = Math.min(maxSize, total);

  let currentSize = minSize;
  const sizes: number[] = [];
  while (currentSize < maxSize) {
    sizes.push(currentSize);
    currentSize *= 2;
  }
  sizes.push(Math.min(currentSize, maxSize));
  return [...new Set(sizes)];
};
