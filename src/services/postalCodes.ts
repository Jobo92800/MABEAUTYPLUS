// French postal codes database
// This is a simplified version - in production you'd want a complete database or API
const postalCodeData: Record<string, string[]> = {
  "34070": ["Montpellier"],
  "34000": ["Montpellier"],
  "34080": ["Montpellier"],
  "34090": ["Montpellier"],
  "34170": ["Castelnau-le-Lez"],
  "34830": ["Jacou"],
  "34920": ["Le Crès"],
  "30240": ["Le Grau-du-Roi"],
  "34410": ["Sérignan"],
  "66330": ["Cabestany"],
  // Add more postal codes as needed
};

export const lookupCity = (postalCode: string): string[] => {
  return postalCodeData[postalCode] || [];
};

// Validate French postal code format
export const isValidPostalCode = (postalCode: string): boolean => {
  return /^[0-9]{5}$/.test(postalCode);
};