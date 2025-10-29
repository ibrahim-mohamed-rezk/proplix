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

const DropdownSeven = ({
  handleLocationChange,
  handleResetFilter,
  filters,
  setFilters,
}: any) => {
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
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState<boolean>(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [minPriceSuggestions, setMinPriceSuggestions] = useState<any[]>([]);
  const [maxPriceSuggestions, setMaxPriceSuggestions] = useState<any[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const maxPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [types, setTypes] = useState<any[]>([]);

  // Initialize Google Places services (legacy AutocompleteService like DropdownTwo)
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Default location updated to Egypt (Cairo coordinates)
  const defaultLocation: LocationData = {
    description: "",
    placeId: "",
    coordinates: {
      lat: 30.0444, // Cairo, Egypt latitude
      lng: 31.2357, // Cairo, Egypt longitude
    },
  };

  const fetchAgents = async () => {
    const response = await getData("types", {}, { lang: locale });
    setTypes(response.data.data);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  // Load Google Maps API like DropdownTwo (script with callback)
  useEffect(() => {
    const initializeGoogleMapsServices = () => {
      if (window.google && window.google.maps) {
        try {
          autocompleteService.current =
            new window.google.maps.places.AutocompleteService();
          const dummyDiv = document.createElement("div");
          placesService.current = new window.google.maps.places.PlacesService(
            dummyDiv
          );
          setIsGoogleMapsLoaded(true);
        } catch (err) {
          setIsGoogleMapsLoaded(false);
        }
      }
    };

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

    loadGoogleMapsAPI();
  }, []);

  // Handle location input change and fetch suggestions (match DropdownTwo behavior)
  const handleLocationInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setLocationQuery(query);

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
    if (
      query.length <= 2 ||
      !isGoogleMapsLoaded ||
      !autocompleteService.current
    ) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      // Legacy AutocompleteService requests parallel (geocode + establishments + specific devs)
      // Multiple requests to get geographical places and specific real estate companies
      const requests = [
        {
          input: query,
          types: ["geocode"], // Geographical places
          componentRestrictions: { country: "EG" },
        },
        {
          input: query,
          types: ["establishment"], // Business establishments
          componentRestrictions: { country: "EG" },
        },
        // Specific searches for major Egyptian real estate developers and compounds
        {
          input: `${query} SODIC`,
          types: ["establishment"],
          componentRestrictions: { country: "EG" },
        },
        {
          input: `${query} Palm Hills`,
          types: ["establishment"],
          componentRestrictions: { country: "EG" },
        },
        {
          input: `${query} Talaat Moustafa`,
          types: ["establishment"],
          componentRestrictions: { country: "EG" },
        },
        {
          input: `${query} Madinaty`,
          types: ["establishment"],
          componentRestrictions: { country: "EG" },
        },
        {
          input: `${query} New Cairo`,
          types: ["establishment"],
          componentRestrictions: { country: "EG" },
        },
        {
          input: `${query} compound`,
          types: ["establishment"],
          componentRestrictions: { country: "EG" },
        },
      ];

      let allPredictions: any[] = [];

      // Execute all requests in parallel
      const promises = requests.map((request) => {
        return new Promise<any[]>((resolve) => {
          autocompleteService.current.getPlacePredictions(
            request,
            (predictions: any[] | null, status: any) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                resolve(predictions);
              } else {
                resolve([]);
              }
            }
          );
        });
      });

      const results = await Promise.all(promises);
      allPredictions = results.flat();

      // Remove duplicates based on place_id
      const uniquePredictions = allPredictions.filter(
        (prediction, index, self) =>
          index === self.findIndex((p) => p.place_id === prediction.place_id)
      );

      // Keywords for specific Egyptian real estate companies and compounds
      const specificRealEstateKeywords = [
        "sodic",
        "palm hills",
        "talaat moustafa",
        "madinaty",
        "new cairo",
        "new capital",
        "compound",
        "developer",
        "real estate",
        "property",
        "residential",
        "villa",
        "apartment",
        "townhouse",
        "community",
        "housing",
        "estate",
        "sodic west",
        "sodic east",
        "palm hills new cairo",
        "palm hills sheikh zayed",
        "talaat moustafa group",
        "madinaty compound",
        "new cairo compound",
        "سوديك",
        "بالم هيلز",
        "طلعت مصطفى",
        "مدينتي",
        "القاهرة الجديدة",
        "العاصمة الإدارية",
        "مجمع",
        "مطور",
        "عقارات",
        "سكني",
        "فيلا",
        "شقة",
        "تاون هاوس",
        "مجتمع",
        "إسكان",
      ];

      // Keywords for irrelevant business establishments
      const irrelevantBusinessKeywords = [
        "restaurant",
        "cafe",
        "hotel",
        "gym",
        "market",
        "mall",
        "shop",
        "store",
        "bank",
        "hospital",
        "clinic",
        "school",
        "university",
        "mosque",
        "church",
        "pharmacy",
        "supermarket",
        "gas station",
        "station",
        "airport",
        "bus stop",
        "مطعم",
        "كافيه",
        "فندق",
        "جيم",
        "سوق",
        "مول",
        "متجر",
        "بنك",
        "مستشفى",
        "عيادة",
        "مدرسة",
        "جامعة",
        "مسجد",
        "كنيسة",
        "صيدلية",
        "محطة وقود",
      ];

      const filteredPredictions = uniquePredictions.filter((prediction) => {
        const description = prediction.description.toLowerCase();

        // Always include geographical places (cities)
        if (
          prediction.types?.includes("locality") ||
          prediction.types?.includes("administrative_area_level_1")
        ) {
          return true;
        }

        // For business establishments, check if they're relevant real estate companies
        if (prediction.types?.includes("establishment")) {
          const hasRelevantKeywords = specificRealEstateKeywords.some(
            (keyword) => description.includes(keyword)
          );

          const hasIrrelevantKeywords = irrelevantBusinessKeywords.some(
            (keyword) => description.includes(keyword)
          );

          return hasRelevantKeywords && !hasIrrelevantKeywords;
        }

        return false;
      });

      setSuggestions(filteredPredictions);
      setShowSuggestions(true);
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

      placesService.current.getDetails(request, (place: any, status: any) => {
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

  // Handle min price input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Trigger the price change handler to send request (min input -> price parameter)
    setFilters({
      ...filters,
      price: value,
    });

    if (value.length > 0) {
      const filteredRanges = priceRanges.filter(
        (range: any) =>
          range.from.toString().includes(value) ||
          range.label.toLowerCase().includes(value.toLowerCase())
      );
      setMinPriceSuggestions(filteredRanges);
    } else {
      setMinPriceSuggestions([]);
    }
  };

  // Handle max price input change
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Trigger the down price change handler to send request (max input -> down_price parameter)
    setFilters({
      ...filters,
      down_price: value,
    });

    if (value.length > 0) {
      const filteredRanges = priceRanges.filter(
        (range: any) =>
          range.to.toString().includes(value) ||
          range.label.toLowerCase().includes(value.toLowerCase())
      );
      setMaxPriceSuggestions(filteredRanges);
    } else {
      setMaxPriceSuggestions([]);
    }
  };

  // Handle min price input focus
  const handleMinPriceFocus = () => {
    // Show only unique "from" values for min price
    const uniqueFromValues = priceRanges.reduce((acc: any[], range: any) => {
      if (!acc.find((item) => item.from === range.from)) {
        acc.push({ from: range.from, label: range.from.toString() });
      }
      return acc;
    }, []);
    setMinPriceSuggestions(uniqueFromValues);
    setShowMinPriceSuggestions(true);
  };

  // Handle max price input focus
  const handleMaxPriceFocus = () => {
    // Show only unique "to" values for max price
    const uniqueToValues = priceRanges.reduce((acc: any[], range: any) => {
      if (!acc.find((item) => item.to === range.to)) {
        acc.push({ to: range.to, label: range.to.toString() });
      }
      return acc;
    }, []);
    setMaxPriceSuggestions(uniqueToValues);
    setShowMaxPriceSuggestions(true);
  };

  // Handle min price input blur
  const handleMinPriceBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowMinPriceSuggestions(false);
    }, 150);
  };

  // Handle max price input blur
  const handleMaxPriceBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowMaxPriceSuggestions(false);
    }, 150);
  };

  // Handle min price suggestion selection
  const handleMinPriceSuggestionSelect = (range: any) => {
    setShowMinPriceSuggestions(false);
    // Trigger the price change handler with the selected from value
    setFilters({
      ...filters,
      price: range.from.toString(),
    });
  };

  // Handle max price suggestion selection
  const handleMaxPriceSuggestionSelect = (range: any) => {
    setShowMaxPriceSuggestions(false);
    // Trigger the price change handler with the selected to value
    setFilters({
      ...filters,
      down_price: range.to.toString(),
    });
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

      if (
        priceDropdownRef.current &&
        !priceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriceDropdown(false);
      }

      if (
        minPriceSuggestionsRef.current &&
        !minPriceSuggestionsRef.current.contains(event.target as Node) &&
        minPriceInputRef.current &&
        !minPriceInputRef.current.contains(event.target as Node)
      ) {
        setShowMinPriceSuggestions(false);
      }

      if (
        maxPriceSuggestionsRef.current &&
        !maxPriceSuggestionsRef.current.contains(event.target as Node) &&
        maxPriceInputRef.current &&
        !maxPriceInputRef.current.contains(event.target as Node)
      ) {
        setShowMaxPriceSuggestions(false);
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

  return (
    <>
      <style>{`
        .location-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 13px 35px -12px rgba(35, 35, 35, 0.1);
          z-index: 1000;
          margin-top: 0;
          border: 1px solid rgba(0, 0, 0, 0.05);
          padding: 0;
          min-width: 100%;
          max-height: 220px;
          overflow-y: auto;
          font-size: 15px;
        }
        .suggestion-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s, color 0.2s;
          border-bottom: none;
        }
        .suggestion-item:last-child {
          border-bottom: none;
        }
        .suggestion-item:hover, .suggestion-item.active {
          background-color: #ff672508;
        }
        .suggestion-item:hover .main-text,
        .suggestion-item:hover .secondary-text,
        .suggestion-item:hover i {
          color: #FF6725 !important;
        }
        .suggestion-item .main-text {
          font-weight: 500;
          color: #333;
          font-size: 15px;
        }
        .suggestion-item .secondary-text {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }
        .suggestion-item i {
          margin-right: 8px;
          color: #666;
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
              <div
                className="location-input-container"
                style={{ position: "relative" }}
              >
                <input
                  ref={locationInputRef}
                  type="text"
                  className="location-input nice-select fw-normal "
                  style={{ paddingRight: 32 }}
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
                  autoComplete="off"
                />
                <span
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <i className="fa-solid fa-location-dot"></i>
                </span>

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
                      className="location-suggestions hide-scrollbar"
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.place_id || index}
                          className="suggestion-item"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <i
                            className="fa-regular fa-location-dot"
                            style={{ color: "#6b7280", fontSize: 16 }}
                          ></i>
                          <div>
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
                  { value: "commercial-sale", text: t("commercialSale") },
                  { value: "commercial-rent", text: t("commercialRent") },
                ]}
                defaultCurrent={filters?.status || "all"}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    status:
                      event.target.value === "all" ? null : event.target.value,
                  })
                }
                name="status"
                placeholder=""
              />
            </div>
          </div>

          <div className="col-xl-2 col-sm-4 col-6">
            <div
              className="input-box-one border-left"
              style={{ position: "relative" }}
            >
              <div className="label">{t("price_range")}</div>
              <div
                className="price-range-trigger"
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#fff",
                  transition: "all 0.2s ease",
                  position: "relative",
                  minHeight: "44px",
                  fontSize: "14px",
                  fontWeight: "400",
                }}
              >
                <span
                  className="line-clamp-1 overflow-hidden text-ellipsis"
                  style={{
                    color: "#000",
                    fontSize: "18px",
                    fontWeight: "400",
                  }}
                >
                  {filters.price && filters.down_price
                    ? `${filters.price} - ${filters.down_price} ${t("EGP")}`
                    : filters.price
                    ? `From ${filters.price} ${t("EGP")}`
                    : filters.down_price
                    ? `Up to ${filters.down_price} ${t("EGP")}`
                    : t("select_price_range") || "Select Price Range"}
                </span>
                <i
                  className={`fa-solid fa-chevron-down ${
                    showPriceDropdown ? "rotated" : ""
                  }`}
                  style={{
                    transition: "transform 0.2s",
                    transform: showPriceDropdown
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                ></i>
              </div>

              {showPriceDropdown && (
                <div
                  ref={priceDropdownRef}
                  className="price-range-dropdown"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 1000,
                    marginTop: "4px",
                    padding: "16px 5px",
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "0",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="price-input-field"
                      style={{ position: "relative", flex: 1 }}
                    >
                      <input
                        ref={minPriceInputRef}
                        type="text"
                        placeholder={t("min_price") || "Min"}
                        className="type-input"
                        value={filters.price || ""}
                        onChange={handleMinPriceChange}
                        onFocus={handleMinPriceFocus}
                        onBlur={handleMinPriceBlur}
                        autoComplete="off"
                        style={{
                          padding: "10px 5px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "400",
                          transition: "all 0.2s ease",
                          backgroundColor: "#fff",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#FF6725";
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(255, 103, 37, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      {showMinPriceSuggestions && (
                        <div
                          ref={minPriceSuggestionsRef}
                          className="price-suggestions"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "#fff",
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            borderRadius: "4px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1001,
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            marginTop: "2px",
                          }}
                        >
                          {minPriceSuggestions.map((range, idx) => (
                            <div
                              key={idx}
                              className="suggestion-item"
                              onClick={() =>
                                handleMinPriceSuggestionSelect(range)
                              }
                              style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "400",
                                transition: "all 0.2s ease",
                                borderBottom: "1px solid #f3f4f6",
                                borderRadius: "2px",
                                margin: "1px 0",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor = "#ff672508";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor = "#fff";
                              }}
                            >
                              {range.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                        fontWeight: "400",
                        padding: "0 6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "16px",
                      }}
                    >
                      -
                    </span>
                    <div
                      className="price-input-field"
                      style={{ position: "relative", flex: 1 }}
                    >
                      <input
                        ref={maxPriceInputRef}
                        type="text"
                        placeholder={t("max_price") || "Max"}
                        className="type-input"
                        value={filters.down_price || ""}
                        onChange={handleMaxPriceChange || ""}
                        onFocus={handleMaxPriceFocus}
                        onBlur={handleMaxPriceBlur}
                        autoComplete="off"
                        style={{
                          padding: "10px 5px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "400",
                          transition: "all 0.2s ease",
                          backgroundColor: "#fff",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#FF6725";
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(255, 103, 37, 0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                      {showMaxPriceSuggestions && (
                        <div
                          ref={maxPriceSuggestionsRef}
                          className="price-suggestions"
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "#fff",
                            border: "1px solid rgba(0, 0, 0, 0.05)",
                            borderRadius: "4px",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1001,
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            marginTop: "2px",
                          }}
                        >
                          {maxPriceSuggestions.map((range, idx) => (
                            <div
                              key={idx}
                              className="suggestion-item"
                              onClick={() =>
                                handleMaxPriceSuggestionSelect(range)
                              }
                              style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "400",
                                transition: "all 0.2s ease",
                                borderBottom: "1px solid #f3f4f6",
                                borderRadius: "2px",
                                margin: "1px 0",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor = "#ff672508";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.backgroundColor = "#fff";
                              }}
                            >
                              {range.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {(filters.price || filters.down_price) && (
                    <div
                      className="d-flex justify-content-between gap-2 mt-3"
                      style={{ marginTop: "12px" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFilters({
                            ...filters,
                            price: null,
                            down_price: null,
                          });

                          localStorage.setItem(
                            "filters",
                            JSON.stringify({
                              ...filters,
                              price: null,
                              down_price: null,
                            })
                          );
                        }}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          background: "#fff",
                          color: "#111827",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                      >
                        {t("clear") || "Clear"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPriceDropdown(false);
                        }}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #ff6725",
                          borderRadius: "6px",
                          background: "#ff6725",
                          color: "#fff",
                          fontSize: "14px",
                          cursor: "pointer",
                        }}
                      >
                        {t("done") || "Done"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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
                defaultCurrent={filters?.bedrooms || "all"}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    bedrooms:
                      event.target.value === "all" ? null : event.target.value,
                  })
                }
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
                defaultCurrent={filters?.bathrooms || "all"}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    bathrooms:
                      event.target.value === "all" ? null : event.target.value,
                  })
                }
                name=""
                placeholder=""
              />
            </div>
          </div>

          <div className="col-xl-2 col-sm-4">
            <div className="input-box-one border-left">
              <div className="label">{t("type")}</div>
              <NiceSelect
                className="nice-select fw-normal"
                options={[
                  { value: "all", text: t("any") },
                  ...types?.map((area: any) => ({
                    value: area.id,
                    text: area.title,
                  })),
                ]}
                defaultCurrent={filters?.type_id || "all"}
                onChange={(event) =>
                  setFilters({
                    ...filters,
                    type_id:
                      event.target.value === "all" ? null : event.target.value,
                  })
                }
                name="type"
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
        handleResetFilter={handleResetFilter}
        filters={filters}
        setFilters={setFilters}
      />
    </>
  );
};

export default DropdownSeven;
