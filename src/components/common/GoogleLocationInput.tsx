// components/GoogleLocationInput.tsx

import { useState, useEffect, useRef } from "react";

// Extend Window interface to include Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

// Types for Google Places API
interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationData {
  description: string;
  placeId: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface GooglePlacePredictionText {
  text?: string; 
}

interface GoogleLocationInputProps {
  onLocationChange: (locationData: LocationData) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const GoogleLocationInput: React.FC<GoogleLocationInputProps> = ({
  onLocationChange,
  defaultValue = "Cairo, Egypt",
  placeholder = "Search for a location in Egypt...",
  disabled = false,
}) => {
  const [locationQuery, setLocationQuery] = useState<string>(defaultValue);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Refs for Google services
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Default hardcoded location (Cairo, Egypt)
  const defaultLocation: LocationData = {
    description: "Cairo, Egypt",
    placeId: "ChIJ674hC6Y_WBQRujtC6Jay33k",
    coordinates: {
      lat: 30.0444196,
      lng: 31.2357116,
    },
  };

  // Egypt bounds for location bias
  const egyptBounds = {
    north: 31.6673,
    south: 22.0,
    east: 36.8987,
    west: 24.6969,
  };

  // Filter function to ensure only Egypt results
  const isLocationInEgypt = (description: string): boolean => {
    const lowerDesc = description.toLowerCase();
    return lowerDesc.includes('egypt') || 
           lowerDesc.includes('مصر') || 
           lowerDesc.includes('eg');
  };

  // Check if Google Maps API is ready
  const isGoogleMapsReady = (): boolean => {
    return !!(
      window.google &&
      window.google.maps &&
      window.google.maps.places &&
      window.google.maps.places.AutocompleteService &&
      window.google.maps.places.PlacesService
    );
  };

  // Initialize Google services
  const initializeGoogleServices = () => {
    if (isGoogleMapsReady()) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
        setIsGoogleMapsLoaded(true);
        
        // Set default location to Egypt if defaultValue contains non-Egypt location
        if (defaultValue && !isLocationInEgypt(defaultValue)) {
          setLocationQuery("Cairo, Egypt");
        }
      } catch (error) {
        console.error("Error initializing Google Maps services:", error);
        setIsGoogleMapsLoaded(false);
      }
    }
  };

  // Polling logic for loading Google Maps
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 100;
    let pollInterval: NodeJS.Timeout;

    const checkGoogleMaps = () => {
      attempts++;
      if (isGoogleMapsReady()) {
        initializeGoogleServices();
        clearInterval(pollInterval);
        return;
      }
      if (attempts >= maxAttempts) {
        console.warn("Google Maps failed to load after maximum attempts");
        setIsGoogleMapsLoaded(false);
        clearInterval(pollInterval);
      }
    };

    const handleGoogleMapsLoaded = () => {
      setTimeout(checkGoogleMaps, 100);
    };

    window.addEventListener("googleMapsLoaded", handleGoogleMapsLoaded);
    checkGoogleMaps();
    pollInterval = setInterval(checkGoogleMaps, 100);

    return () => {
      window.removeEventListener("googleMapsLoaded", handleGoogleMapsLoaded);
      clearInterval(pollInterval);
    };
  }, [defaultValue]);

  // Handle input change and fetch suggestions
  const handleLocationInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationQuery(query);

    if (!isGoogleMapsLoaded || query.length <= 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      if (autocompleteService.current) {
        // Multiple requests with different configurations to ensure Egypt results
        const requests = [
          {
            input: query,
            types: ["geocode"],
            componentRestrictions: { country: "EG" },
            bounds: new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(egyptBounds.south, egyptBounds.west),
              new window.google.maps.LatLng(egyptBounds.north, egyptBounds.east)
            ),
          },
          {
            input: `${query} Egypt`,
            types: ["geocode"],
            componentRestrictions: { country: "EG" },
          },
          {
            input: query,
            types: ["(cities)"],
            componentRestrictions: { country: "EG" },
          }
        ];

        let allPredictions: PlacePrediction[] = [];

        // Try each request configuration
        for (const request of requests) {
          await new Promise<void>((resolve) => {
            autocompleteService.current!.getPlacePredictions(
              request,
              (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                  // Filter to ensure only Egypt results
                  const egyptPredictions = predictions.filter(p => 
                    isLocationInEgypt(p.description) || 
                    p.terms?.some(term => term.value.toLowerCase().includes('egypt'))
                  );
                  allPredictions.push(...egyptPredictions);
                }
                resolve();
              }
            );
          });
        }

        // Remove duplicates and limit results
        const uniquePredictions = allPredictions.filter((prediction, index, self) => 
          index === self.findIndex(p => p.place_id === prediction.place_id)
        ).slice(0, 10);

        if (uniquePredictions.length > 0) {
          setSuggestions(uniquePredictions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: PlacePrediction) => {
    setLocationQuery(suggestion.description);
    setShowSuggestions(false);

    if (placesService.current && isGoogleMapsLoaded) {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId: suggestion.place_id,
        fields: ["geometry", "formatted_address", "name", "address_components"],
      };

      placesService.current.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          // Verify the place is in Egypt
          const isInEgypt = place.address_components?.some(component => 
            component.types.includes('country') && 
            (component.short_name === 'EG' || component.long_name === 'Egypt')
          );

          if (isInEgypt) {
            const locationData: LocationData = {
              description: suggestion.description,
              placeId: suggestion.place_id,
              coordinates: place.geometry?.location
                ? {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                  }
                : undefined,
            };
            onLocationChange(locationData);
          } else {
            console.warn("Selected location is not in Egypt");
          }
        }
      });
    } else {
      const locationData: LocationData = {
        description: suggestion.description,
        placeId: suggestion.place_id,
      };
      onLocationChange(locationData);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="location-autocomplete-wrapper" style={{ position: "relative" }}>
      <input
        ref={locationInputRef}
        type="text"
        className="form-control location-input fw-normal"
        placeholder={isGoogleMapsLoaded ? placeholder : "Loading location services..."}
        value={locationQuery}
        onChange={handleLocationInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        disabled={!isGoogleMapsLoaded || disabled}
        style={{
          width: "100%",
          padding: "12px 15px",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          fontSize: "14px",
          backgroundColor: isGoogleMapsLoaded ? "#fff" : "#f8f9fa",
          cursor: isGoogleMapsLoaded ? "text" : "not-allowed",
        }}
      />

      {/* Loading indicator */}
      {!isGoogleMapsLoaded && (
        <div
          style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "12px",
            color: "#666",
          }}
        >
          Loading...
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && isGoogleMapsLoaded && (
        <div
          ref={suggestionsRef}
          className="location-suggestions"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              className="suggestion-item"
              onClick={() => handleSuggestionSelect(suggestion)}
              style={{
                padding: "12px 15px",
                cursor: "pointer",
                borderBottom: index < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
                fontSize: "14px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#fff";
              }}
            >
              <div style={{ fontWeight: "500", marginBottom: "2px" }}>
                {suggestion.structured_formatting?.main_text || suggestion.description}
              </div>
              {suggestion.structured_formatting?.secondary_text && (
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {suggestion.structured_formatting.secondary_text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoogleLocationInput;