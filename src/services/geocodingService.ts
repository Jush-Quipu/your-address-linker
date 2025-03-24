
import { toast } from 'sonner';

// Using the free Nominatim OpenStreetMap service for geocoding
// Note: For production, consider using a paid service with better rate limits
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  confidence: number;
}

export const geocodeAddress = async (
  street: string,
  city: string,
  state: string,
  postalCode: string,
  country: string
): Promise<GeocodingResult | null> => {
  try {
    // Build the full address string
    const addressString = `${street}, ${city}, ${state} ${postalCode}, ${country}`;
    
    // Call the OpenStreetMap API
    const response = await fetch(
      `${NOMINATIM_API}?q=${encodeURIComponent(addressString)}&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'SecureAddressBridge/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const results = await response.json();
    
    if (results && results.length > 0) {
      // Add a confidence score based on match quality
      results[0].confidence = calculateAddressConfidence(
        results[0], 
        { street, city, state, postalCode, country }
      );
      return results[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    toast.error('Failed to verify address location', {
      description: error instanceof Error ? error.message : 'Unknown error'
    });
    return null;
  }
};

// Calculate a confidence score for the match quality
const calculateAddressConfidence = (
  result: any, 
  input: { street: string; city: string; state: string; postalCode: string; country: string }
): number => {
  let score = 0;
  const address = result.address;
  
  // Check each component for matches
  if (address.road && input.street.toLowerCase().includes(address.road.toLowerCase())) {
    score += 0.25;
  }
  
  if (address.city && input.city.toLowerCase() === address.city.toLowerCase()) {
    score += 0.25;
  }
  
  if (address.state && input.state.toLowerCase() === address.state.toLowerCase()) {
    score += 0.2;
  }
  
  if (address.postcode && input.postalCode === address.postcode) {
    score += 0.2;
  }
  
  if (address.country && input.country.toLowerCase() === address.country.toLowerCase()) {
    score += 0.1;
  }
  
  return Math.min(score, 1); // Normalize to 0-1
};

// Function to validate an address before submission
export const validateAddress = async (
  street: string,
  city: string,
  state: string,
  postalCode: string,
  country: string
): Promise<{
  isValid: boolean;
  confidence: number;
  message: string;
  geocodingResult: GeocodingResult | null;
}> => {
  // Basic format validation
  if (!street || !city || !state || !postalCode || !country) {
    return {
      isValid: false,
      confidence: 0,
      message: 'All address fields are required',
      geocodingResult: null
    };
  }
  
  // Get geocoding result
  const result = await geocodeAddress(street, city, state, postalCode, country);
  
  if (!result) {
    return {
      isValid: false,
      confidence: 0,
      message: 'Address could not be verified',
      geocodingResult: null
    };
  }
  
  // Check confidence level
  if (result.confidence < 0.6) {
    return {
      isValid: false,
      confidence: result.confidence,
      message: 'Low confidence in address match',
      geocodingResult: result
    };
  }
  
  return {
    isValid: true,
    confidence: result.confidence,
    message: 'Address successfully verified',
    geocodingResult: result
  };
};
