
export const validSizes = {
  EU: [
    35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5, 40, 40.5, 41, 41.5, 42, 42.5, 43, 43.5, 44, 44.5, 45, 45.5, 46, 46.5, 47, 47.5, 48, 48.5, 49, 49.5, 50
  ],
  UK: [
    2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15
  ],
  US: [
    4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17
  ]
};

export const validateShoeSize = (size: string, sizeUnit: string): boolean => {
  if (!size || !sizeUnit) return false;
  
  const numericSize = parseFloat(size);
  if (isNaN(numericSize)) return false;
  
  const validSizesForUnit = validSizes[sizeUnit as keyof typeof validSizes];
  return validSizesForUnit ? validSizesForUnit.includes(numericSize) : false;
};

export const getSizeErrorMessage = (sizeUnit: string): string => {
  const validSizesForUnit = validSizes[sizeUnit as keyof typeof validSizes];
  if (!validSizesForUnit) return "Invalid size unit";
  
  const minSize = Math.min(...validSizesForUnit);
  const maxSize = Math.max(...validSizesForUnit);
  
  return `Please enter a valid ${sizeUnit} size between ${minSize} and ${maxSize}`;
};
