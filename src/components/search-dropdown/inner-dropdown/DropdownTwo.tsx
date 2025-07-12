import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import NiceSelect from "@/ui/NiceSelect";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";

// Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

const DropdownTwo = ({
  filters,
  handleDown_priceChange,
  handleSearchChange,
  handlePriceChange,
  handleResetFilter,
  handleAgentChange,
  handlerangeChange,
  handleLocationChange,
  handleTypesChange,
  popup = true,
}: any) => {
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [ranges, setRanges] = useState([]);
  const [types, setTypes] = useState([]);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        initializeGoogleMapsServices();
        return;
      }

      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        window.initGoogleMaps = initializeGoogleMapsServices;

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    const initializeGoogleMapsServices = () => {
      if (window.google && window.google.maps) {
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
        // Create a dummy div for PlacesService (required but not used for display)
        const dummyDiv = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(
          dummyDiv
        );
        setIsGoogleMapsLoaded(true);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  // fetch price ranges from api
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getData("price-range", {}, { lang: locale });
        setRanges(response.data.data.ranges);
      } catch (error) {
        throw error;
      }
    };

    fetchData();
  }, []);

  // fetch types from api
  useEffect(() => {
    const fetchTypes = async () => {
      const response = await getData("types", {}, { lang: locale });
      setTypes(response.data.data);
    };
    fetchTypes();
  }, [locale]);

  // Handle location input change with Google Maps autocomplete
  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setLocationQuery(query);

    if (query.length > 2 && isGoogleMapsLoaded && autocompleteService.current) {
      const request = {
        input: query,
        types: ["establishment", "geocode"], // You can customize this based on your needs
        // You can add country restrictions if needed:
        // componentRestrictions: { country: 'us' }
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: any[], status: any) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setLocationSuggestions(predictions);
            setShowLocationSuggestions(true);
          } else {
            setLocationSuggestions([]);
            setShowLocationSuggestions(false);
          }
        }
      );
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }

    // Trigger search change on typing
    handleSearchChange({ target: { value: query } });
  };

  // Handle location suggestion selection
  const handleLocationSuggestionSelect = (prediction: any) => {
    setLocationQuery(prediction.description);
    setShowLocationSuggestions(false);

    // Get place details if needed
    if (placesService.current) {
      const request = {
        placeId: prediction.place_id,
        fields: ["geometry", "formatted_address", "name"],
      };

      placesService.current.getDetails(request, (place: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // You can use place.geometry.location.lat() and place.geometry.location.lng()
          // to get coordinates if needed for your search functionality
          const locationData = {
            address: prediction.description,
            placeId: prediction.place_id,
            lat: place.geometry?.location?.lat(),
            lng: place.geometry?.location?.lng(),
          };

          // Pass the location data to your search handler
          handleSearchChange({
            target: {
              value: prediction.description,
              locationData: locationData,
            },
          });
        }
      });
    } else {
      handleSearchChange({ target: { value: prediction.description } });
    }
  };

  // Hide suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationSuggestionsRef.current &&
        !locationSuggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row gx-0 align-items-center">
          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left border-lg-0">
              <div className="label">{t("location")}</div>
              <div style={{ position: "relative" }}>
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder={
                    t("search_location_placeholder") || "Enter location..."
                  }
                  className="type-input"
                  value={locationQuery}
                  onChange={handleLocationInputChange}
                  onFocus={() =>
                    locationSuggestions.length > 0 &&
                    setShowLocationSuggestions(true)
                  }
                  autoComplete="off"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={locationSuggestionsRef}
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
                    {locationSuggestions.map((suggestion, idx) => (
                      <div
                        key={suggestion.place_id}
                        className="suggestion-item"
                        onClick={() =>
                          handleLocationSuggestionSelect(suggestion)
                        }
                        style={{
                          padding: "12px 15px",
                          cursor: "pointer",
                          borderBottom:
                            idx < locationSuggestions.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                          fontSize: "14px",
                          transition: "background-color 0.2s",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.backgroundColor =
                            "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.backgroundColor =
                            "#fff")
                        }
                      >
                        <i
                          className="fa-light fa-location-dot"
                          style={{ marginRight: "8px", color: "#666" }}
                        ></i>
                        <div>
                          <div style={{ fontWeight: "500", color: "#333" }}>
                            {suggestion.structured_formatting?.main_text ||
                              suggestion.description}
                          </div>
                          {suggestion.structured_formatting?.secondary_text && (
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "2px",
                              }}
                            >
                              {suggestion.structured_formatting.secondary_text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!isGoogleMapsLoaded && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      padding: "8px 12px",
                      fontSize: "12px",
                      color: "#666",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e0e0e0",
                      borderRadius: "0 0 4px 4px",
                    }}
                  >
                    Loading location services...
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left">
              <div className="label">{t("im_looking_to")}</div>
              <NiceSelect
                className="nice-select"
                options={[
                  {
                    text: t("all"),
                    value: "all",
                  },
                  ...types?.map((type: any) => ({
                    value: type.id,
                    text: type.title,
                  })),
                ]}
                defaultCurrent={filters.type_id ? filters.type_id : "all"}
                onChange={handleTypesChange}
                name=""
                placeholder=""
              />
            </div>
          </div>

          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left">
              <div className="label">{t("price_range")}</div>
              <NiceSelect
                className="nice-select location"
                options={[
                  {
                    text: t("all"),
                    value: "all",
                  },
                  ...ranges?.map((range: any) => ({
                    value: `${range.from}-${range.to}`,
                    text: range.label,
                  })),
                ]}
                defaultCurrent={
                  `${filters.price}-${filters.down_price}` || "all"
                }
                onChange={(e) => handlerangeChange(e.target.value)}
                name=""
                placeholder=""
              />
            </div>
          </div>

          <div className="col-xl-3">
            <div className="input-box-one lg-mt-20">
              <div className="d-flex align-items-center">
                {popup && (
                  <Link
                    href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#advanceFilterModal"
                    className="search-modal-btn sm tran3s text-uppercase fw-500 d-inline-flex align-items-center me-3"
                  >
                    <i className="fa-light fa-sliders-up"></i>
                  </Link>
                )}
                <button className="fw-500 text-uppercase tran3s search-btn">
                  <Link href={!popup ? "/properties" : "#"}>{t("search")}</Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ListingDropdownModal
        handlePriceChange={handlePriceChange}
        handleDown_priceChange={handleDown_priceChange}
        handleResetFilter={handleResetFilter}
        handleAgentChange={handleAgentChange}
        filters={filters}
      />
    </>
  );
};

export default DropdownTwo;
