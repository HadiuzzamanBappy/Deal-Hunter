// Location detection utility
export const detectUserLocation = async (availableCountries) => {
  try {
    // First try to get location from IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data && data.country_code) {
      const detectedCountry = data.country_code.toUpperCase();
      
      // Check if detected country is in our available countries
      const matchedCountry = availableCountries.find(
        country => country.code === detectedCountry
      );
      
      if (matchedCountry) {
        console.log(`Location detected: ${matchedCountry.name} (${matchedCountry.code})`);
        return matchedCountry.code;
      }
    }
  } catch (error) {
    console.log('Location detection failed:', error.message);
  }
  
  // Fallback to BD (Bangladesh) as default
  console.log('Using default location: Bangladesh (BD)');
  return 'BD';
};

export const getCountryName = (countryCode, availableCountries) => {
  const country = availableCountries.find(c => c.code === countryCode);
  return country ? country.name : countryCode;
};
