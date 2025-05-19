import { useState, useCallback } from 'react';
import { lookupCity, isValidPostalCode } from '../../../../services/postalCodes';

export const useCity = (initialCity: string = '') => {
  const [city, setCity] = useState(initialCity);

  const handlePostalCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    if (isValidPostalCode(postalCode)) {
      const cities = lookupCity(postalCode);
      if (cities.length === 1) {
        setCity(cities[0]);
      }
    }
  }, []);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  }, []);

  return {
    city,
    handlePostalCodeChange,
    handleCityChange
  };
};