import NiceSelect from "@/ui/NiceSelect";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import { useState, useEffect, useRef } from "react";
import { LocationData } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";

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

// Type assertion helper for Google Places API response
interface GooglePlacePrediction {
  placeId?: string;
  text?: {
    text?: string;
  };
  structuredFormat?: {
    mainText?: {
      text?: string;
    };
    secondaryText?: {
      text?: string;
    };
  };
}

interface DropdownSevenProps {
  handleBathroomChange: (event: any) => void;
  handleBedroomChange: (event: any) => void;
  handleSearchChange: (event: any) => void;
  handlePriceChange: (value: any) => void;
  maxPrice: any;
  priceValue: any;
  handleResetFilter: () => void;
  selectedAmenities: string[];
  handleAmenityChange: () => void;
  handleLocationChange: (location: LocationData | any) => void;
  handleStatusChange: (event: any) => void;
  handlePriceDropChange: (value: any) => void;
  handleAgentChange?: (value: any) => void;
  filters?: any;
  // New props for mobile toggle
  showMap?: boolean;
  onToggleView?: (showMap: boolean) => void;
  isMobile?: boolean;
}

const DropdownSeven: React.FC<DropdownSevenProps> = ({
  handleBathroomChange,
  handleBedroomChange,
  handleLocationChange,
  handlePriceDropChange,
  handleAgentChange,
  filters,
  showMap = false,
  onToggleView,
  isMobile = false,
}) => {
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [priceRanges, setPriceRanges] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [agents, setAgents] = useState<any[]>([]);

  // Initialize Google Places services (supporting both old and new APIs)
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Default location updated to Egypt (Cairo coordinates)
  const defaultLocation: LocationData = {
    description: "",
    placeId: "",
    coordinates: {
      lat: 30.0444, // Cairo, Egypt latitude
      lng: 31.2357, // Cairo, Egypt longitude
    },
  };

  useEffect(() => {
    const fetchAgents = async () => {
      const response = await getData("agents", {}, { lang: locale });
      setAgents(response.data.data);
    };
    fetchAgents();
  }, []);

  // Function to check if Google Maps is fully loaded
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

  // Function to initialize Google Places services
  const initializeGoogleServices = () => {
    if (isGoogleMapsReady()) {
      try {
        // Initialize AutocompleteService as fallback if new API is not available
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

        // Set default location
        setLocationQuery(defaultLocation.description);
        setSelectedLocation(defaultLocation.description);
        setIsGoogleMapsLoaded(true);

        console.log("Google Maps services initialized successfully");
      } catch (error) {
        console.error("Error initializing Google Maps services:", error);
        setIsGoogleMapsLoaded(false);
      }
    }
  };

  // Listen for Google Maps loading and poll as fallback
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 100; // Try for about 10 seconds
    let pollInterval: NodeJS.Timeout;

    const checkGoogleMaps = () => {
      attempts++;

      if (isGoogleMapsReady()) {
        initializeGoogleServices();
        if (pollInterval) clearInterval(pollInterval);
        return;
      }

      if (attempts >= maxAttempts) {
        console.warn("Google Maps API failed to load after maximum attempts");
        setIsGoogleMapsLoaded(false);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    // Listen for custom event from layout
    const handleGoogleMapsLoaded = () => {
      console.log("Received googleMapsLoaded event");
      // Small delay to ensure everything is ready
      setTimeout(() => {
        if (isGoogleMapsReady()) {
          initializeGoogleServices();
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 100);
    };

    // Add event listener for custom event
    window.addEventListener("googleMapsLoaded", handleGoogleMapsLoaded);

    // Start polling as fallback
    checkGoogleMaps();
    pollInterval = setInterval(checkGoogleMaps, 100);

    return () => {
      // Cleanup
      window.removeEventListener("googleMapsLoaded", handleGoogleMapsLoaded);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Handle location input change and fetch suggestions using new or legacy API
  const handleLocationInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setLocationQuery(query);
    setSelectedLocation(query);

    // Only proceed if Google Maps is loaded and query is long enough
    if (!isGoogleMapsLoaded || query.length <= 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Try to use the new AutocompleteSuggestion API first
      if (window.google.maps.places.AutocompleteSuggestion) {
        // Use any type for the request since the exact interface may vary
        const request: any = {
          input: query,
          includedPrimaryTypes: [
            "locality",
            "administrative_area_level_1",
            "administrative_area_level_2",
            "country",
          ], // Cities, states, governorates, and countries
          includedRegionCodes: ["EG"], // Restrict to Egypt only
          locationBias: {
            radius: 50000, // 50km radius
            center: new google.maps.LatLng(
              defaultLocation?.coordinates?.lat || 0,
              defaultLocation?.coordinates?.lng || 0
            ),
          },
        };

        const response = await (
          window.google.maps.places.AutocompleteSuggestion as any
        ).fetchAutocompleteSuggestions(request);

        if (response?.suggestions && response.suggestions.length > 0) {
          const convertedSuggestions: PlacePrediction[] =
            response.suggestions.map((suggestion: any) => {
              // Type assertion to access the nested structure
              const placePrediction =
                suggestion.placePrediction as GooglePlacePrediction;

              return {
                place_id: placePrediction?.placeId || "",
                description: placePrediction?.text?.text || "",
                structured_formatting: {
                  main_text:
                    placePrediction?.structuredFormat?.mainText?.text ||
                    placePrediction?.text?.text ||
                    "",
                  secondary_text:
                    placePrediction?.structuredFormat?.secondaryText?.text ||
                    "",
                },
              };
            });

          setSuggestions(convertedSuggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
      // Fallback to legacy AutocompleteService
      else if (autocompleteService.current) {
        const request: google.maps.places.AutocompletionRequest = {
          input: query,
          types: ["(cities)"], // Focus on cities
          componentRestrictions: { country: ["EG"] }, // Restrict to Egypt only
          // Add location bias to prioritize results near Cairo
          location: new google.maps.LatLng(
            defaultLocation.coordinates?.lat || 0,
            defaultLocation.coordinates?.lng || 0
          ),
          radius: 100000, // 100km radius from Cairo
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

      // If new API fails, try fallback to legacy API
      if (
        autocompleteService.current &&
        window.google.maps.places.AutocompleteSuggestion
      ) {
        try {
          const request: google.maps.places.AutocompletionRequest = {
            input: query,
            types: ["(cities)"], // Focus on cities
            componentRestrictions: { country: ["EG"] }, // Restrict to Egypt only
            // Add location bias to prioritize results near Cairo
            location: new google.maps.LatLng(
              defaultLocation.coordinates?.lat || 0,
              defaultLocation.coordinates?.lng || 0
            ),
            radius: 100000, // 100km radius from Cairo
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
        } catch (fallbackError) {
          console.error("Fallback autocomplete also failed:", fallbackError);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: PlacePrediction) => {
    setSelectedLocation(suggestion.description);
    setLocationQuery(suggestion.description);
    setShowSuggestions(false);
    handleLocationChange(suggestion);

    // Only get place details if Google Places service is available
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

          // Call the parent handler with the selected location data
          if (handleLocationChange) {
            handleLocationChange(locationData);
          }
        }
      });
    } else {
      // Fallback if places service is not available
      const locationData: LocationData = {
        description: suggestion.description,
        placeId: suggestion.place_id,
      };

      if (handleLocationChange) {
        handleLocationChange(locationData);
      }
    }
  };

  // Handle click outside to close suggestions
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

  // fetch price ranges from api
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData("price-range", {}, { lang: locale });
        setPriceRanges(response.data.data.ranges);
        console.log(response.data.data.ranges);
      } catch (error) {
        throw error;
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <style>{`
        .dropdown-seven-container {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 1px solid #e2e8f0;
        }

        .mobile-toggle-container {
          background: #ffffff;
          border-radius: 12px;
          padding: 8px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .mobile-toggle-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.3s ease;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .mobile-toggle-btn.active {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .mobile-toggle-btn:hover:not(.active) {
          background: #f1f5f9;
          color: #475569;
        }

        .mobile-filters-toggle {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          width: 100%;
          font-weight: 500;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .mobile-filters-toggle:hover {
          background: #f8fafc;
          border-color: #3b82f6;
        }

        .mobile-filters-toggle .chevron {
          transition: transform 0.3s ease;
        }

        .mobile-filters-toggle.active .chevron {
          transform: rotate(180deg);
        }

        .filters-container {
          background: #ffffff;
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .filters-container.mobile {
          margin-bottom: 16px;
        }

        .filters-container.mobile.hidden {
          display: none;
        }

        .desktop-filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding: 20px;
        }

        .mobile-filters-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 20px;
        }

        .input-box-one {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          transition: all 0.3s ease;
          position: relative;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .input-box-one:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }

        .input-box-one:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
        }

        .input-box-one .label {
          font-weight: 600;
          font-size: 13px;
          color: #374151;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .location-input {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: #ffffff;
          width: 100%;
        }

        .location-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .location-input:disabled {
          background: #f8fafc;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .location-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          margin-top: 4px;
        }

        .suggestion-item {
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover {
          background: #f8fafc;
        }

        .suggestion-item .main-text {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .suggestion-item .secondary-text {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .nice-select {
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
          background: #ffffff !important;
          transition: all 0.3s ease !important;
          min-height: 44px !important;
          width: 100% !important;
        }

        .nice-select:focus,
        .nice-select.open {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .nice-select .list {
          border-radius: 8px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
          border: 1px solid #e2e8f0 !important;
        }

        .nice-select .option {
          padding: 12px 16px !important;
          transition: background-color 0.2s ease !important;
        }

        .nice-select .option:hover {
          background: #f8fafc !important;
        }

        .loading-indicator {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 12px;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .dropdown-seven-container {
            padding: 12px;
            margin-bottom: 16px;
          }

          .desktop-filters-row {
            padding: 16px;
            gap: 8px;
          }

          .mobile-filters-grid {
            padding: 16px;
            gap: 12px;
          }

          .input-box-one {
            padding: 12px;
            min-height: 70px;
          }

          .input-box-one .label {
            font-size: 12px;
            margin-bottom: 6px;
          }

          .location-input {
            padding: 10px 12px;
            font-size: 14px;
          }

          .nice-select {
            padding: 10px 12px !important;
            font-size: 14px !important;
            min-height: 40px !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-toggle-btn {
            padding: 10px 12px;
            font-size: 13px;
          }

          .mobile-filters-toggle {
            padding: 10px 12px;
            font-size: 14px;
          }

          .input-box-one {
            padding: 10px;
            min-height: 65px;
          }
        }
      `}</style>

      <div className="dropdown-seven-container">
        {/* Mobile View Toggle (Map vs Properties) */}
        {isMobile && onToggleView && (
          <div className="mobile-toggle-container">
            <div className="d-flex">
              <button
                type="button"
                className={`mobile-toggle-btn ${!showMap ? "active" : ""}`}
                onClick={() => onToggleView(false)}
              >
                <i className="fa-solid fa-list"></i>
                <span>{t("properties")}</span>
              </button>
              <button
                type="button"
                className={`mobile-toggle-btn ${showMap ? "active" : ""}`}
                onClick={() => onToggleView(true)}
              >
                <i className="fa-solid fa-map"></i>
                <span>{t("map")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Filters Toggle */}
        {isMobile && (
          <button
            type="button"
            className={`mobile-filters-toggle ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="d-flex align-items-center">
              <i className="fa-solid fa-filter me-2"></i>
              <span>{t("filters")}</span>
            </div>
            <i className={`fa-solid fa-chevron-down chevron`}></i>
          </button>
        )}

        {/* Filters Container */}
        <div
          className={`filters-container ${isMobile ? "mobile" : ""} ${
            isMobile && !showFilters ? "hidden" : ""
          }`}
        >
          <form onSubmit={(e) => e.preventDefault()}>
            <div
              className={
                isMobile ? "mobile-filters-grid" : "desktop-filters-row"
              }
            >
              {/* Location Input */}
              <div
                className={isMobile ? "w-100" : "flex-1"}
                style={{ minWidth: isMobile ? "100%" : "250px" }}
              >
                <div className="input-box-one">
                  <div className="label">{t("location")}</div>
                  <div className="position-relative">
                    <input
                      ref={locationInputRef}
                      type="text"
                      className="location-input"
                      placeholder={
                        isGoogleMapsLoaded
                          ? t("search_location_placeholder")
                          : t("loading_location_services")
                      }
                      value={locationQuery}
                      onChange={handleLocationInputChange}
                      onFocus={() =>
                        suggestions.length > 0 && setShowSuggestions(true)
                      }
                      disabled={!isGoogleMapsLoaded}
                    />

                    {/* Loading indicator */}
                    {!isGoogleMapsLoaded && (
                      <div className="loading-indicator">{t("loading")}</div>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions &&
                      suggestions.length > 0 &&
                      isGoogleMapsLoaded && (
                        <div
                          ref={suggestionsRef}
                          className="location-suggestions"
                        >
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={suggestion.place_id || index}
                              className="suggestion-item"
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              <div className="main-text">
                                {suggestion.structured_formatting?.main_text ||
                                  suggestion.description}
                              </div>
                              {suggestion.structured_formatting
                                ?.secondary_text && (
                                <div className="secondary-text">
                                  {
                                    suggestion.structured_formatting
                                      .secondary_text
                                  }
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Agent Selection */}
              <div
                className={isMobile ? "w-100" : "flex-1"}
                style={{ minWidth: isMobile ? "100%" : "180px" }}
              >
                <div className="input-box-one">
                  <div className="label">{t("by_agent")}</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      {
                        text: t("all_agents"),
                        value: "all",
                      },
                      ...agents?.map((agent: any) => ({
                        value: agent.id,
                        text: agent.name,
                      })),
                    ]}
                    defaultCurrent={filters.user_id ? filters.user_id : "all"}
                    onChange={(event) =>
                      handleAgentChange && handleAgentChange(event.target.value)
                    }
                    name=""
                    placeholder=""
                  />
                </div>
              </div>

              {/* Price Range */}
              <div
                className={isMobile ? "w-100" : "flex-1"}
                style={{ minWidth: isMobile ? "100%" : "180px" }}
              >
                <div className="input-box-one">
                  <div className="label">{t("price_range")}</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "all", text: t("any") },
                      ...priceRanges.map((range) => ({
                        value: `${range.from}-${range.to}`,
                        text: range.label,
                      })),
                    ]}
                    defaultCurrent={0}
                    onChange={(event) => {
                      handlePriceDropChange(event.target.value);
                    }}
                    name=""
                    placeholder=""
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div
                className={isMobile ? "w-100" : "flex-1"}
                style={{ minWidth: isMobile ? "100%" : "120px" }}
              >
                <div className="input-box-one">
                  <div className="label">{t("bed")}</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "all", text: t("any") },
                      { value: "1", text: "1+" },
                      { value: "2", text: "2+" },
                      { value: "3", text: "3+" },
                      { value: "4", text: "4+" },
                    ]}
                    defaultCurrent={0}
                    onChange={(event) =>
                      handleBedroomChange(event.target.value)
                    }
                    name=""
                    placeholder=""
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div
                className={isMobile ? "w-100" : "flex-1"}
                style={{ minWidth: isMobile ? "100%" : "120px" }}
              >
                <div className="input-box-one">
                  <div className="label">{t("bath")}</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "all", text: t("any") },
                      { value: "1", text: "1+" },
                      { value: "2", text: "2+" },
                      { value: "3", text: "3+" },
                      { value: "4", text: "4+" },
                    ]}
                    defaultCurrent={0}
                    onChange={(event) =>
                      handleBathroomChange(event.target.value)
                    }
                    name=""
                    placeholder=""
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default DropdownSeven;
