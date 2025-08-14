import NiceSelect from "@/ui/NiceSelect";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import { useState, useEffect, useRef } from "react";
import { LocationData } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";

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
  // Advanced filter handlers
  handleAmenitiesChange: (amenities: number[]) => void;
  handlePaymentMethodChange: (paymentMethod: string) => void;
  handleFurnishingChange: (furnishing: string) => void;
  handleSizeChange: (size: string) => void;
  handleLocationChange: (location: LocationData | any) => void;
  handleStatusChange: (event: any) => void;
  handlePriceDropChange: (value: any) => void;
  handleAgentChange?: (value: any) => void;
  handleAreaChange?: (value: any) => void;
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
  handleAreaChange,
  handleStatusChange,
  handleAgentChange,
  handleSearchChange,
  handlePriceChange,
  maxPrice,
  priceValue,
  handleResetFilter,
  handleAmenitiesChange,
  handlePaymentMethodChange,
  handleFurnishingChange,
  handleSizeChange,
  filters,
  showMap = false,
  onToggleView,
  isMobile = false,
}) => {
  // Get default location from localStorage filters.location
  const getDefaultLocationQuery = () => {
    if (typeof window !== "undefined") {
      try {
        const filters = JSON.parse(localStorage.getItem("filters") || "{}");
        return filters.location || "";
      } catch {
        return "";
      }
    }
    return "";
  };

  const [locationQuery, setLocationQuery] = useState<string>(
    getDefaultLocationQuery()
  );
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
  const [areas, setAreas] = useState<any[]>([]);

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

  const fetchAreas = async () => {
    const response = await getData("areas", {}, { lang: locale });
    setAreas(response.data.data);
  };

  useEffect(() => {
    fetchAreas();
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
        setLocationQuery(getDefaultLocationQuery());
        setSelectedLocation(getDefaultLocationQuery());
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

    // --- Save location to localStorage filters.location ---
    if (typeof window !== "undefined") {
      try {
        const filters = JSON.parse(localStorage.getItem("filters") || "{}");
        filters.location = query;
        localStorage.setItem("filters", JSON.stringify(filters));
      } catch (err) {
        // ignore
      }
    }
    // ------------------------------------------------------

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

    // --- Save location to localStorage filters.location ---
    if (typeof window !== "undefined") {
      try {
        const filters = JSON.parse(localStorage.getItem("filters") || "{}");
        filters.location = suggestion.description;
        localStorage.setItem("filters", JSON.stringify(filters));
      } catch (err) {
        // ignore
      }
    }
    // ------------------------------------------------------

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
      } catch (error) {
        throw error;
      }
    };

    fetchData();
  }, []);

  const selectHandler = (e: any) => {};

  return (
    <>
      <style>{`
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

        .location-input-container {
          position: relative;
        }

        .location-input {
          border: none;
          background: none;
          width: 100%;
          font-size: inherit;
          color: inherit;
          outline: none;
        }

        .location-input:disabled {
          background: transparent;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .loading-indicator {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
          font-size: 12px;
        }
      `}</style>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row gx-0 align-items-center">
          <div className="col-xl-3 col-sm-6">
            <div className="input-box-one border-left">
              <div className="label">{t("location")}</div>
              <div className="location-input-container">
                <input
                  ref={locationInputRef}
                  type="text"
                  className="location-input nice-select fw-normal"
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
                    <div ref={suggestionsRef} className="location-suggestions">
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
                          {suggestion.structured_formatting?.secondary_text && (
                            <div className="secondary-text">
                              {suggestion.structured_formatting.secondary_text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="col-xl-2 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("status")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  { value: "sale", text: t("sale") },
                  { value: "rent", text: t("rent") },
                ]}
                defaultCurrent={filters?.status || "all"}
                onChange={(event) => handleStatusChange(event.target.value)}
                name="status"
                placeholder=""
              />
            </div>
          </div>

          <div className="col-xl-2 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("price_range")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  ...priceRanges.map((range) => ({
                    value: `${range.from}-${range.to}`,
                    text: range.label,
                  })),
                ]}
                defaultCurrent={
                  typeof window !== "undefined" &&
                  localStorage.getItem("filters") &&
                  JSON.parse(localStorage.getItem("filters") || "{}").price &&
                  JSON.parse(localStorage.getItem("filters") || "{}").down_price
                    ? `${
                        JSON.parse(localStorage.getItem("filters") || "{}")
                          .price
                      }-${
                        JSON.parse(localStorage.getItem("filters") || "{}")
                          .down_price
                      }`
                    : "all"
                }
                onChange={(event) => {
                  handlePriceDropChange(event.target.value);
                }}
                name=""
                placeholder=""
              />
            </div>
          </div>

          {/* <div className="col-xl-2 col-sm-4">
            <div className="input-box-one border-left">
              <div className="label">{t("area")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  ...areas?.map((area: any) => ({
                    value: area.id,
                    text: area.name,
                  })),
                ]}
                defaultCurrent={0}
                onChange={(event) =>
                  handleAreaChange && handleAreaChange(event.target.value)
                }
                name="area"
                placeholder=""
              />
            </div>
          </div> */}
          <div className="col-xl-1 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("bed")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  { value: "1", text: "1+" },
                  { value: "2", text: "2+" },
                  { value: "3", text: "3+" },
                  { value: "4", text: "4+" },
                ]}
                defaultCurrent={0}
                onChange={(event) => handleBedroomChange(event.target.value)}
                name=""
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-1 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("bath")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  { value: "1", text: "1+" },
                  { value: "2", text: "2+" },
                  { value: "3", text: "3+" },
                  { value: "4", text: "4+" },
                ]}
                defaultCurrent={0}
                onChange={(event) => handleBathroomChange(event.target.value)}
                name=""
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-2 col-sm-4">
            <div className="input-box-one border-left">
              <div className="label">{t("area")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  ...areas?.map((area: any) => ({
                    value: area.id,
                    text: area.name,
                  })),
                ]}
                defaultCurrent={0}
                onChange={(event) =>
                  handleAreaChange && handleAreaChange(event.target.value)
                }
                name="area"
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-1 col-sm-4 col-6">
            <div className="input-box-one md-mt-10">
              <div className="d-flex align-items-center justify-content-center justify-content-lg-end">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#advanceFilterModal"
                  className="search-modal-btn sm rounded-circle tran3s text-uppercase fw-500 d-inline-flex align-items-center justify-content-center me-3"
                >
                  <i className="fa-light fa-sliders-up"></i>
                </Link>
                {/* <button className="fw-500 text-uppercase tran3s search-btn w-auto m0">
                  Search
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </form>

      <ListingDropdownModal
        handleAmenitiesChange={handleAmenitiesChange}
        handlePaymentMethodChange={handlePaymentMethodChange}
        handleFurnishingChange={handleFurnishingChange}
        handleSizeChange={handleSizeChange}
        handleResetFilter={handleResetFilter}
        filters={filters}
      />
    </>
  );
};

export default DropdownSeven;
