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

type GooglePlacePrediction = {
  placeId?: string;
  text?: string | GooglePlacePredictionText;
  structuredFormat?: {
    mainText?: { text?: string };
    secondaryText?: { text?: string };
  };
};

interface GoogleLocationInputProps {
  onLocationChange: (locationData: LocationData) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const GoogleLocationInput: React.FC<GoogleLocationInputProps> = ({
  onLocationChange,
  defaultValue = "Colorado, USA",
  placeholder = "Search for a location...",
  disabled = false,
}) => {
  const [locationQuery, setLocationQuery] = useState<string>(defaultValue);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);

  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Refs for Google services
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Default hardcoded location
  const defaultLocation: LocationData = {
    description: defaultValue,
    placeId: "ChIJR2kKMCPMaokRGAlJhBgrQXo", // Colorado, USA
    coordinates: {
      lat: 39.29302101722867,
      lng: -105.54557276330914,
    },
  };

  // Check if Google Maps API is ready
  const isGoogleMapsReady = (): boolean => {
    return !!(
      window.google &&
      window.google.maps &&
      window.google.maps.places &&
      (window.google.maps.places.AutocompleteSuggestion ||
        window.google.maps.places.AutocompleteService) &&
      window.google.maps.places.PlacesService
    );
  };

  // Initialize Google services
  const initializeGoogleServices = () => {
    if (isGoogleMapsReady()) {
      try {
        if (
          !window.google.maps.places.AutocompleteSuggestion &&
          window.google.maps.places.AutocompleteService
        ) {
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
        }

        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );

        setLocationQuery(defaultValue);
        setIsGoogleMapsLoaded(true);
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
  }, []);

  // Handle input change and fetch suggestions
  const handleLocationInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setLocationQuery(query);

    if (!isGoogleMapsLoaded || query.length <= 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      if (window.google.maps.places.AutocompleteSuggestion) {
        const request: any = {
          input: query,
          includedPrimaryTypes: [
            "locality",
            "administrative_area_level_1",
            "country",
          ],
          locationBias: {
            radius: 50000,
            center: defaultLocation.coordinates
              ? new google.maps.LatLng(
                  defaultLocation.coordinates.lat,
                  defaultLocation.coordinates.lng
                )
              : new google.maps.LatLng(39.29302101722867, -105.54557276330914),
          },
        };

        const response = await (
          window.google.maps.places.AutocompleteSuggestion as any
        ).fetchAutocompleteSuggestions(request);

        if (response?.suggestions && response.suggestions.length > 0) {
          const convertedSuggestions: PlacePrediction[] =
            response.suggestions.map((suggestion: any) => {
                const placePrediction =
                suggestion.placePrediction as GooglePlacePrediction;
              
              // Safely extract text value
              const getTextValue = (text: string | GooglePlacePredictionText | undefined): string => {
                if (!text) return "";
                if (typeof text === "string") return text;
                return text.text || "";
              };
              
              return {
                place_id: placePrediction?.placeId || "",
                description: getTextValue(placePrediction?.text),
                structured_formatting: {
                  main_text:
                    placePrediction?.structuredFormat?.mainText?.text ||
                    getTextValue(placePrediction?.text),
                  secondary_text:
                    placePrediction?.structuredFormat?.secondaryText?.text || "",
                },
              };
            });
          setSuggestions(convertedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else if (autocompleteService.current) {
        const request: google.maps.places.AutocompletionRequest = {
          input: query,
          types: ["(cities)"],
          componentRestrictions: { country: [] },
        };

        autocompleteService.current.getPlacePredictions(
          request,
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
          }
        );
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
        fields: ["geometry", "formatted_address", "name"],
      };

      placesService.current.getDetails(request, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
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
        placeholder={
          isGoogleMapsLoaded ? placeholder : "Loading location services..."
        }
        value={locationQuery}
        onChange={handleLocationInputChange}
        onFocus={() =>
          suggestions.length > 0 && setShowSuggestions(true)
        }
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
                borderBottom:
                  index < suggestions.length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
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
              <div
                style={{ fontWeight: "500", marginBottom: "2px" }}
              >
                {suggestion.structured_formatting?.main_text ||
                  suggestion.description}
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