import NiceSelect from "@/ui/NiceSelect";
// import Link from "next/link";
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
}

const DropdownSeven: React.FC<DropdownSevenProps> = ({
  handleBathroomChange,
  handleBedroomChange,
  handleSearchChange,
  handlePriceChange,
  maxPrice,
  priceValue,
  handleResetFilter,
  selectedAmenities,
  handleAmenityChange,
  handleLocationChange,
  handleStatusChange,
  handlePriceDropChange,
  handleAgentChange,
  filters
}) => {
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [priceRanges, setPriceRanges] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
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

  // feach price ranges from api
  useEffect(() => {
    const feachData = async () => {
      try {
        const response = await getData("price-range", {}, { lang: locale });
        setPriceRanges(response.data.data.ranges);
        console.log(response.data.data.ranges);
      } catch (error) {
        throw error;
      }
    };

    feachData();
  }, []);

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row gx-0 align-items-center">
          {/* <div className="col-xxl-2 col-xl-3 col-sm-6">
            <div className="input-box-one border-left">
              <div className="label">Im looking to...</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "apartments", text: "Buy Apartments" },
                  { value: "condos", text: "Rent Condos" },
                  { value: "houses", text: "Sell Houses" },
                  { value: "industrial", text: "Rent Industrial" },
                  { value: "villas", text: "Sell Villas" },
                ]}
                defaultCurrent={0}
                onChange={handleStatusChange}
                name=""
                placeholder=""
              />
            </div>
          </div> */}

          {/* Updated Location Section with Google Autocomplete - Egypt Only */}
          <div className="col-xl-3 col-sm-6">
            <div className="input-box-one ">
              <div className="label">{t("location")}</div>
              <div
                className="location-autocomplete-wrapper"
                style={{ position: "relative" }}
              >
                <input
                  ref={locationInputRef}
                  type="text"
                  className="form-control location-input fw-normal"
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
                    {t("loading")}
                  </div>
                )}

                {/* Suggestions Dropdown */}
                {showSuggestions &&
                  suggestions.length > 0 &&
                  isGoogleMapsLoaded && (
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
                            (e.target as HTMLElement).style.backgroundColor =
                              "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.backgroundColor =
                              "#fff";
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
            </div>
          </div>

          <div className="col-xl-1 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("price_range")}</div>
              <NiceSelect
                className="nice-select border border-[#e0e0e0] fw-normal"
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

          <div className="col-xl-1 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("bed")}</div>
              <NiceSelect
                className="nice-select border border-[#e0e0e0]  fw-normal"
                options={[
                  { value: "0", text: t("any") },
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
                className="nice-select border border-[#e0e0e0]  fw-normal"
                options={[
                  { value: "0", text: t("any") },
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

          {/* agents  */}
          <div className="col-xl-1 col-sm-4 col-6">
            <div className="input-box-one border-left">
              <div className="label">{t("by_agent")}</div>
              <NiceSelect
                className="nice-select border border-[#e0e0e0]  w-full"
                options={[
                  {
                    text: t("all agents"),
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

          {/* advanced search button */}
          {/* <div className="col-xxl-2 col-xl-1 !ms-auto ">
            <div className="input-box-one lg-mt-20">
              <div className="d-flex align-items-center justify-content-center justify-content-xl-end">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#advanceFilterModal"
                  className="search-modal-btn tran3s text-uppercase fw-500 d-inline-flex align-items-center"
                >
                  <span className="me-3 d-xl-none d-xxl-block">
                    {t("advance_search")}
                  </span>
                  <i className="fa-light fa-sliders-up"></i>
                </Link>
              </div>
            </div>
          </div> */}
        </div>
      </form>
      {/* <ListingDropdownModal
        handleSearchChange={handleSearchChange}
        handleBedroomChange={handleBedroomChange}
        handleBathroomChange={handleBathroomChange}
        handlePriceChange={handlePriceChange}
        maxPrice={maxPrice}
        priceValue={priceValue}
        handleResetFilter={handleResetFilter}
        selectedAmenities={selectedAmenities}
        handleAmenityChange={handleAmenityChange}
        handleStatusChange={handleStatusChange}
      /> */}
    </>
  );
};

export default DropdownSeven;
