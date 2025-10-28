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
  handleTypesChange,
  setFilters,
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
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [minPriceSuggestions, setMinPriceSuggestions] = useState<any[]>([]);
  const [maxPriceSuggestions, setMaxPriceSuggestions] = useState<any[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationSuggestionsRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const maxPriceSuggestionsRef = useRef<HTMLDivElement>(null);
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
  const handleLocationInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const query = e.target.value;
    setLocationQuery(query);

    if (query.length > 2 && isGoogleMapsLoaded && autocompleteService.current) {
      try {
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
          {
            input: `${query} developer`,
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
              (predictions: any[], status: any) => {
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

          // Always include geographical places (geocode)
          if (prediction.types?.includes("geocode")) {
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

        setLocationSuggestions(filteredPredictions);
        setShowLocationSuggestions(true);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
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

  // Handle min price input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);

    // Trigger the price change handler to send request
    handlePriceChange(value.toString());

    if (value.length > 0) {
      const filteredRanges = ranges.filter(
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
    setMaxPrice(value);

    // Trigger the down price change handler to send request
    handleDown_priceChange(value);

    if (value.length > 0) {
      const filteredRanges = ranges.filter(
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
    const uniqueFromValues = ranges.reduce((acc: any[], range: any) => {
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
    const uniqueToValues = ranges.reduce((acc: any[], range: any) => {
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
    setMinPrice(range.from.toString());
    setShowMinPriceSuggestions(false);
    // Trigger the price change handler with the selected from value
    handlePriceChange(range.from.toString());
  };

  // Handle max price suggestion selection
  const handleMaxPriceSuggestionSelect = (range: any) => {
    setMaxPrice(range.to.toString());
    setShowMaxPriceSuggestions(false);
    // Trigger the price change handler with the selected to value
    handleDown_priceChange(range.to.toString());
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
                  className="type-input font-[400]"
                  value={locationQuery}
                  onChange={handleLocationInputChange}
                  onFocus={() =>
                    locationSuggestions.length > 0 &&
                    setShowLocationSuggestions(true)
                  }
                  autoComplete="off"
                  style={{
                    paddingRight: "38px", // add space for the icon
                  }}
                />
                {/* Search icon at end of input */}
                <span
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#999",
                    fontSize: "18px",
                  }}
                >
                  <i className="fa-light fa-location-dot"></i>
                </span>
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={locationSuggestionsRef}
                    className="location-suggestions hide-scrollbar"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid rgba(0, 0, 0, 0.05)",
                      borderRadius: "10px",
                      maxHeight: "220px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 13px 35px -12px rgba(35, 35, 35, 0.1)",
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
                          fontSize: "14px",
                          transition: "background-color 0.2s, color 0.2s",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#ff672508";
                          // Make all text inside orange on hover
                          Array.from(
                            e.currentTarget.querySelectorAll("div, i")
                          ).forEach((el) => {
                            (el as HTMLElement).style.color = "#FF6725";
                          });
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#fff";
                          // Restore text color
                          const mainText =
                            e.currentTarget.querySelector(".main-text");
                          if (mainText)
                            (mainText as HTMLElement).style.color = "#333";
                          const secondaryText =
                            e.currentTarget.querySelector(".secondary-text");
                          if (secondaryText)
                            (secondaryText as HTMLElement).style.color = "#666";
                          const icon = e.currentTarget.querySelector("i");
                          if (icon) (icon as HTMLElement).style.color = "#666";
                        }}
                      >
                        <i
                          className="fa-light fa-location-dot"
                          style={{ marginRight: "8px", color: "#666" }}
                        ></i>
                        <div>
                          <div
                            className="main-text"
                            style={{ fontWeight: "500", color: "#333" }}
                          >
                            {suggestion.structured_formatting?.main_text ||
                              suggestion.description}
                          </div>
                          {suggestion.structured_formatting?.secondary_text && (
                            <div
                              className="secondary-text"
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
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left">
              <div className="label">{t("im_looking_to")}</div>
              <NiceSelect
                className="nice-select font-[400]"
                currentClasses="font-[400]"
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
                  fontSize: "18px",
                  fontWeight: "400",
                }}
              >
                <span style={{ color: "#000" }}>
                  {minPrice && maxPrice
                    ? `${minPrice} ${t("EGP")} - ${maxPrice} ${t("EGP")}`
                    : minPrice
                    ? `${t("from")} ${minPrice} ${t("EGP")}`
                    : maxPrice
                    ? `${t("up_to")} ${maxPrice} ${t("EGP")}`
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
                    padding: "16px",
                    borderTopLeftRadius: "0",
                    borderTopRightRadius: "0",
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="price-input-field"
                      style={{ position: "relative", flex: 1 }}
                    >
                      <input
                        ref={minPriceInputRef}
                        type="text"
                        placeholder={t("min_price") || "Min"}
                        className="type-input"
                        value={minPrice}
                        onChange={handleMinPriceChange}
                        onFocus={handleMinPriceFocus}
                        onBlur={handleMinPriceBlur}
                        autoComplete="off"
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "14px",
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
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        onFocus={handleMaxPriceFocus}
                        onBlur={handleMaxPriceBlur}
                        autoComplete="off"
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "14px",
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
                  {(minPrice || maxPrice) && (
                    <div
                      className="d-flex justify-content-between  gap-2 mt-3"
                      style={{ marginTop: "12px" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice("");
                          setMaxPrice("");
                          setMinPriceSuggestions([]);
                          setMaxPriceSuggestions([]);
                          handlePriceChange("");
                          handleDown_priceChange("");
                          setShowPriceDropdown(false);
                          setFilters({
                            ...filters,
                            price: null,
                            down_price: null,
                          });
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
                        onClick={() => setShowPriceDropdown(false)}
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
        handleResetFilter={handleResetFilter}
        handleAgentChange={handleAgentChange}
        filters={filters}
      />
    </>
  );
};

export default DropdownTwo;
