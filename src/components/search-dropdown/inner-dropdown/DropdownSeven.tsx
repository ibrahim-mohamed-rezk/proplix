import NiceSelect from "@/ui/NiceSelect";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { LocationData } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";
import { priceRanges, rentPriceRanges } from "@/data/price-rnages";
import { areaRanges } from "@/data/area-ranges";

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
  const [areas, setAreas] = useState<any[]>([]);
  const [showAreaSuggestions, setShowAreaSuggestions] =
    useState<boolean>(false);
  const [isAreasLoading, setIsAreasLoading] = useState<boolean>(false);
  const [selectedAreas, setSelectedAreas] = useState<
    Array<{ id: string | number; name: string }>
  >([]);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [minPriceSuggestions, setMinPriceSuggestions] = useState<any[]>([]);
  const [maxPriceSuggestions, setMaxPriceSuggestions] = useState<any[]>([]);
  const [showSpaceDropdown, setShowSpaceDropdown] = useState(false);
  const [showMinSpaceSuggestions, setShowMinSpaceSuggestions] = useState(false);
  const [showMaxSpaceSuggestions, setShowMaxSpaceSuggestions] = useState(false);
  const [minSpaceSuggestions, setMinSpaceSuggestions] = useState<any[]>([]);
  const [maxSpaceSuggestions, setMaxSpaceSuggestions] = useState<any[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const areaSuggestionsRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const spaceDropdownRef = useRef<HTMLDivElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const maxPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const minSpaceInputRef = useRef<HTMLInputElement>(null);
  const maxSpaceInputRef = useRef<HTMLInputElement>(null);
  const minSpaceSuggestionsRef = useRef<HTMLDivElement>(null);
  const maxSpaceSuggestionsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [types, setTypes] = useState<any[]>([]);

  // Check if status is commercial
  const isCommercial =
    filters?.status === "commercial-sale" ||
    filters?.status === "commercial-rent";

  // Determine which price ranges to use based on status
  const activePriceRanges = useMemo(() => {
    const status = filters?.status;
    if (status === "rent" || status === "commercial-rent") {
      return rentPriceRanges;
    }
    return priceRanges;
  }, [filters?.status]);

  // Clear filters when switching between commercial and non-commercial
  useEffect(() => {
    const currentStatus = filters?.status;
    const wasCommercial =
      currentStatus === "commercial-sale" ||
      currentStatus === "commercial-rent";

    if (wasCommercial) {
      // Clear beds and baths when switching to commercial
      if (filters?.bedrooms || filters?.bathrooms) {
        setFilters((prev: any) => ({
          ...prev,
          bedrooms: null,
          bathrooms: null,
        }));
      }
    } else {
      // Clear space filters when switching away from commercial
      if (filters?.space_min || filters?.space_max) {
        setFilters((prev: any) => ({
          ...prev,
          space_min: null,
          space_max: null,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status]);

  const fetchAgents = async () => {
    const response = await getData("types", {}, { lang: locale });
    setTypes(response.data.data);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const getAreaDisplayName = useCallback(
    (area: any) => {
      if (!area) return "";
      if (locale === "ar") {
        return (
          area.name_ar ||
          area.title_ar ||
          area.title ||
          area.name_en ||
          area.name ||
          ""
        );
      }

      return (
        area.name_en ||
        area.title_en ||
        area.title ||
        area.name_ar ||
        area.name ||
        ""
      );
    },
    [locale]
  );

  const getAreaDeveloperName = useCallback(
    (area: any) => {
      if (!area) return "";
      if (locale === "ar") {
        return (
          area.developer_ar ||
          area.developer_name_ar ||
          area.developer ||
          area.developer_en ||
          ""
        );
      }

      return (
        area.developer_en ||
        area.developer_name_en ||
        area.developer ||
        area.developer_ar ||
        ""
      );
    },
    [locale]
  );

  const fetchAreas = useCallback(
    async (searchTerm: string) => {
      try {
        setIsAreasLoading(true);
        const trimmedTerm = searchTerm.trim();
        const params = trimmedTerm ? { search: trimmedTerm } : {};
        const response = await getData("area-search", params, { lang: locale });
        const list = response?.data?.data;
        setAreas(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching areas:", error);
        setAreas([]);
      } finally {
        setIsAreasLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    fetchAreas(locationQuery || "");
  }, [fetchAreas]);

  // Initialize selected areas from filters
  useEffect(() => {
    if (filters?.area_id) {
      if (Array.isArray(filters.area_id) && filters.area_id.length > 0) {
        // If we have area IDs but no selected areas, we need to fetch area names
        // For now, we'll use the location string if available
        if (selectedAreas.length === 0 && filters?.location) {
          const locationNames = filters.location.split(", ").filter(Boolean);
          if (locationNames.length === filters.area_id.length) {
            const areas = locationNames.map((name: string, idx: number) => ({
              id: filters.area_id[idx],
              name: name.trim(),
            }));
            setSelectedAreas(areas);
          }
        }
      } else if (!Array.isArray(filters.area_id)) {
        // Convert single area_id to array format for backward compatibility
        if (typeof setFilters === "function") {
          setFilters((prev: any) => ({
            ...prev,
            area_id: [filters.area_id],
          }));
        }
      }
    } else if (!filters?.area_id && selectedAreas.length > 0) {
      // Clear selected areas if area_id is cleared
      setSelectedAreas([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.area_id, filters?.location]);

  useEffect(() => {
    if (
      typeof filters?.location === "string" &&
      filters.location !== locationQuery &&
      !selectedAreas.length
    ) {
      setLocationQuery(filters.location);
    }
  }, [filters?.location, locationQuery, selectedAreas.length]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAreas(locationQuery || "");
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [locationQuery, fetchAreas]);

  const persistFiltersLocation = useCallback(
    (areaIds: Array<string | number> | null) => {
      if (typeof window === "undefined") return;
      try {
        const storedFilters = JSON.parse(
          localStorage.getItem("filters") || "{}"
        );
        if (selectedAreas.length > 0) {
          storedFilters.location = selectedAreas.map((a) => a.name).join(", ");
        } else {
          storedFilters.location = "";
        }
        storedFilters.area_id = areaIds;
        localStorage.setItem("filters", JSON.stringify(storedFilters));
      } catch {
        // ignore
      }
    },
    [selectedAreas]
  );

  const handleAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    setShowAreaSuggestions(true);
  };

  const handleAreaSuggestionSelect = (area: any) => {
    const displayName = getAreaDisplayName(area);
    const areaId = area?.id ?? area?.value ?? area?.slug ?? null;

    if (!areaId) return;

    // Check if area is already selected
    const isAlreadySelected = selectedAreas.some(
      (a) => String(a.id) === String(areaId)
    );
    if (isAlreadySelected) {
      setShowAreaSuggestions(false);
      setLocationQuery("");
      return;
    }

    // Add to selected areas
    const newSelectedArea = { id: areaId, name: displayName };
    const updatedSelectedAreas = [...selectedAreas, newSelectedArea];
    setSelectedAreas(updatedSelectedAreas);

    // Update filters with array of area IDs
    const areaIds = updatedSelectedAreas.map((a) => a.id);
    if (typeof setFilters === "function" && filters) {
      setFilters({
        ...filters,
        location: updatedSelectedAreas.map((a) => a.name).join(", "),
        area_id: areaIds,
      });
    }

    persistFiltersLocation(areaIds);

    setLocationQuery("");
    setShowAreaSuggestions(false);

    const locationData: LocationData = {
      description: displayName,
      placeId: String(areaId),
    };

    if (typeof handleLocationChange === "function") {
      handleLocationChange(locationData);
    }
  };

  const handleRemoveArea = (areaId: string | number) => {
    const updatedSelectedAreas = selectedAreas.filter(
      (a) => String(a.id) !== String(areaId)
    );
    setSelectedAreas(updatedSelectedAreas);

    const areaIds =
      updatedSelectedAreas.length > 0
        ? updatedSelectedAreas.map((a) => a.id)
        : null;

    if (typeof setFilters === "function" && filters) {
      setFilters({
        ...filters,
        location:
          updatedSelectedAreas.length > 0
            ? updatedSelectedAreas.map((a) => a.name).join(", ")
            : "",
        area_id: areaIds,
      });
    }

    persistFiltersLocation(areaIds);
  };

  const handleEmptyarea = () => {
    setShowAreaSuggestions(false);
    setLocationQuery("");
    setSelectedAreas([]);
    if (typeof setFilters === "function" && filters) {
      setFilters({
        ...filters,
        location: "",
        area_id: null,
      });
    }
    persistFiltersLocation(null);
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
      const filteredRanges = activePriceRanges.filter(
        (range: any) =>
          range.toString().includes(value) ||
          range.toString().toLowerCase().includes(value.toLowerCase())
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
      const filteredRanges = activePriceRanges.filter(
        (range: any) =>
          range.toString().includes(value) ||
          range.toString().toLowerCase().includes(value.toLowerCase())
      );
      setMaxPriceSuggestions(filteredRanges);
    } else {
      setMaxPriceSuggestions([]);
    }
  };

  // Handle min price input focus
  const handleMinPriceFocus = () => {
    // Show only unique "from" values for min price
    const uniqueFromValues = activePriceRanges.reduce(
      (acc: any[], range: any) => {
        if (!acc.find((item) => item.toString() === range.toString())) {
          acc.push(range);
        }
        return acc;
      },
      []
    );
    setMinPriceSuggestions(uniqueFromValues);
    setShowMinPriceSuggestions(true);
  };

  // Handle max price input focus
  const handleMaxPriceFocus = () => {
    // Show only unique "to" values for max price
    const uniqueToValues = activePriceRanges.reduce(
      (acc: any[], range: any) => {
        if (!acc.find((item) => item.toString() === range.toString())) {
          acc.push(range);
        }
        return acc;
      },
      []
    );
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
      price: range.toString(),
    });
  };

  // Handle max price suggestion selection
  const handleMaxPriceSuggestionSelect = (range: any) => {
    setShowMaxPriceSuggestions(false);
    // Trigger the price change handler with the selected to value
    setFilters({
      ...filters,
      down_price: range.toString(),
    });
  };

  // Handle min space input change
  const handleMinSpaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Trigger the space change handler to send request (min input -> space_min parameter)
    setFilters({
      ...filters,
      space_min: value,
    });

    if (value.length > 0) {
      const filteredRanges = areaRanges.filter(
        (range: any) =>
          range.toString().includes(value) ||
          range.toString().toLowerCase().includes(value.toLowerCase())
      );
      setMinSpaceSuggestions(filteredRanges);
    } else {
      setMinSpaceSuggestions([]);
    }
  };

  // Handle max space input change
  const handleMaxSpaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Trigger the space change handler to send request (max input -> space_max parameter)
    setFilters({
      ...filters,
      space_max: value,
    });

    if (value.length > 0) {
      const filteredRanges = areaRanges.filter(
        (range: any) =>
          range.toString().includes(value) ||
          range.toString().toLowerCase().includes(value.toLowerCase())
      );
      setMaxSpaceSuggestions(filteredRanges);
    } else {
      setMaxSpaceSuggestions([]);
    }
  };

  // Handle min space input focus
  const handleMinSpaceFocus = () => {
    // Show all space ranges for min space
    setMinSpaceSuggestions(areaRanges);
    setShowMinSpaceSuggestions(true);
  };

  // Handle max space input focus
  const handleMaxSpaceFocus = () => {
    // Show all space ranges for max space
    setMaxSpaceSuggestions(areaRanges);
    setShowMaxSpaceSuggestions(true);
  };

  // Handle min space input blur
  const handleMinSpaceBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowMinSpaceSuggestions(false);
    }, 150);
  };

  // Handle max space input blur
  const handleMaxSpaceBlur = () => {
    // Small delay to allow clicking on suggestions
    setTimeout(() => {
      setShowMaxSpaceSuggestions(false);
    }, 150);
  };

  // Handle min space suggestion selection
  const handleMinSpaceSuggestionSelect = (range: any) => {
    setShowMinSpaceSuggestions(false);
    // Trigger the space change handler with the selected from value
    setFilters({
      ...filters,
      space_min: range.toString(),
    });
  };

  // Handle max space suggestion selection
  const handleMaxSpaceSuggestionSelect = (range: any) => {
    setShowMaxSpaceSuggestions(false);
    // Trigger the space change handler with the selected to value
    setFilters({
      ...filters,
      space_max: range.toString(),
    });
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        areaSuggestionsRef.current &&
        !areaSuggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowAreaSuggestions(false);
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

      if (
        spaceDropdownRef.current &&
        !spaceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSpaceDropdown(false);
      }

      if (
        minSpaceSuggestionsRef.current &&
        !minSpaceSuggestionsRef.current.contains(event.target as Node) &&
        minSpaceInputRef.current &&
        !minSpaceInputRef.current.contains(event.target as Node)
      ) {
        setShowMinSpaceSuggestions(false);
      }

      if (
        maxSpaceSuggestionsRef.current &&
        !maxSpaceSuggestionsRef.current.contains(event.target as Node) &&
        maxSpaceInputRef.current &&
        !maxSpaceInputRef.current.contains(event.target as Node)
      ) {
        setShowMaxSpaceSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
                {selectedAreas.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                      marginBottom: "8px",
                      padding: "8px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "6px",
                      minHeight: "36px",
                    }}
                  >
                    {selectedAreas.map((area) => (
                      <span
                        key={area.id}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 8px",
                          backgroundColor: "#FF6725",
                          color: "#fff",
                          borderRadius: "4px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        {area.name}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveArea(area.id);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            fontSize: "14px",
                            lineHeight: 1,
                          }}
                          aria-label={`Remove ${area.name}`}
                        >
                          <i className="fa-light fa-xmark"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <input
                  ref={locationInputRef}
                  type="text"
                  className="location-input nice-select fw-normal "
                  style={{
                    paddingInlineEnd: "38px", // add space for the icon button
                  }}
                  placeholder={
                    selectedAreas.length > 0
                      ? t("add_more_locations") || "Add more locations..."
                      : t("search_location_placeholder") || "Enter location..."
                  }
                  value={locationQuery}
                  onChange={handleAreaInputChange}
                  onFocus={() =>
                    (areas.length > 0 || isAreasLoading) &&
                    setShowAreaSuggestions(true)
                  }
                  autoComplete="off"
                />
                {/* Absolute clickable icon over the input */}
                {selectedAreas.length > 0 || locationQuery.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationQuery("");
                      if (selectedAreas.length === 0) {
                        handleEmptyarea();
                      }
                      locationInputRef.current?.focus();
                    }}
                    style={{
                      position: "absolute",
                      top:
                        selectedAreas.length > 0 ? "calc(50% + 18px)" : "50%",
                      insetInlineEnd: "8px",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                      zIndex: 120,
                      color: "#999",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    tabIndex={0}
                    aria-label="Clear location filter"
                  >
                    {locationQuery.length > 0 ? (
                      <i className="fa-light fa-xmark"></i>
                    ) : (
                      <i className="fa-light fa-location-dot"></i>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => locationInputRef.current?.focus()}
                    style={{
                      position: "absolute",
                      top: "50%",
                      insetInlineEnd: "8px",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: 0,
                      cursor: "pointer",
                      zIndex: 120,
                      color: "#999",
                      fontSize: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    tabIndex={0}
                    aria-label="Focus to search location"
                  >
                    <i className="fa-light fa-location-dot"></i>
                  </button>
                )}

                {isAreasLoading && (
                  <div className="loading-indicator">{t("loading")}</div>
                )}

                {showAreaSuggestions && (
                  <div
                    ref={areaSuggestionsRef}
                    className="location-suggestions hide-scrollbar"
                  >
                    {isAreasLoading && (
                      <div
                        className="suggestion-item"
                        style={{ cursor: "default" }}
                      >
                        {t("loading") || "Loading..."}
                      </div>
                    )}
                    {!isAreasLoading && areas.length === 0 && (
                      <div
                        className="suggestion-item"
                        style={{ cursor: "default" }}
                      >
                        {t("no_results_found") || "No areas found"}
                      </div>
                    )}
                    {!isAreasLoading &&
                      areas
                        .filter((area: any) => {
                          const areaId =
                            area?.id ?? area?.value ?? area?.slug ?? null;
                          return !selectedAreas.some(
                            (a) => String(a.id) === String(areaId)
                          );
                        })
                        .map((area: any) => (
                          <div
                            key={
                              area?.id ??
                              area?.value ??
                              getAreaDisplayName(area)
                            }
                            className="suggestion-item"
                            onClick={() => handleAreaSuggestionSelect(area)}
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
                              const mainText =
                                e.currentTarget.querySelector(".main-text");
                              if (mainText)
                                (mainText as HTMLElement).style.color = "#333";
                              const secondaryText =
                                e.currentTarget.querySelector(
                                  ".secondary-text"
                                );
                              if (secondaryText)
                                (secondaryText as HTMLElement).style.color =
                                  "#666";
                              const icon =
                                e.currentTarget.querySelector("i") ?? null;
                              if (icon)
                                (icon as HTMLElement).style.color = "#666";
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
                                {getAreaDisplayName(area)}
                              </div>
                              {getAreaDeveloperName(area) && (
                                <div
                                  className="developer-text"
                                  style={{
                                    fontSize: "11px",
                                    color: "#888",
                                  }}
                                >
                                  {getAreaDeveloperName(area)}
                                </div>
                              )}
                              {area?.parent_name && (
                                <div
                                  className="secondary-text"
                                  style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    marginTop: "2px",
                                  }}
                                >
                                  {area.parent_name}
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
                            fontSize: "10px",
                            width: "fit-content",
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
                              {range.toString()}
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
                            fontSize: "10px",
                            width: "fit-content",
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
                              {range.toString()}
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

          {!isCommercial ? (
            <>
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
                          event.target.value === "all"
                            ? null
                            : event.target.value,
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
                          event.target.value === "all"
                            ? null
                            : event.target.value,
                      })
                    }
                    name=""
                    placeholder=""
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="col-xl-2 col-sm-4 col-6">
              <div
                className="input-box-one border-left"
                style={{ position: "relative" }}
              >
                <div className="label">{t("space_range")}</div>
                <div
                  className="space-range-trigger"
                  onClick={() => setShowSpaceDropdown(!showSpaceDropdown)}
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
                    {filters.space_min && filters.space_max
                      ? `${filters.space_min} - ${filters.space_max} ${t(
                          "sqm"
                        )}`
                      : filters.space_min
                      ? `${t("min_area")}: ${filters.space_min} ${t("sqm")}`
                      : filters.space_max
                      ? `${t("max_area")}: ${filters.space_max} ${t("sqm")}`
                      : t("select_space_range")}
                  </span>
                  <i
                    className={`fa-solid fa-chevron-down ${
                      showSpaceDropdown ? "rotated" : ""
                    }`}
                    style={{
                      transition: "transform 0.2s",
                      transform: showSpaceDropdown
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  ></i>
                </div>

                {showSpaceDropdown && (
                  <div
                    ref={spaceDropdownRef}
                    className="space-range-dropdown"
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
                        className="space-input-field"
                        style={{ position: "relative", flex: 1 }}
                      >
                        <input
                          ref={minSpaceInputRef}
                          type="text"
                          placeholder={t("min_area")}
                          className="type-input"
                          value={filters.space_min || ""}
                          onChange={handleMinSpaceChange}
                          onFocus={handleMinSpaceFocus}
                          onBlur={handleMinSpaceBlur}
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
                        {showMinSpaceSuggestions && (
                          <div
                            ref={minSpaceSuggestionsRef}
                            className="space-suggestions"
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
                              fontSize: "10px",
                              width: "fit-content",
                            }}
                          >
                            {minSpaceSuggestions.map(
                              (range: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="suggestion-item"
                                  onClick={() =>
                                    handleMinSpaceSuggestionSelect(range)
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
                                  {range.toString()} {t("sqm")}
                                </div>
                              )
                            )}
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
                        className="space-input-field"
                        style={{ position: "relative", flex: 1 }}
                      >
                        <input
                          ref={maxSpaceInputRef}
                          type="text"
                          placeholder={t("max_area")}
                          className="type-input"
                          value={filters.space_max || ""}
                          onChange={handleMaxSpaceChange}
                          onFocus={handleMaxSpaceFocus}
                          onBlur={handleMaxSpaceBlur}
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
                        {showMaxSpaceSuggestions && (
                          <div
                            ref={maxSpaceSuggestionsRef}
                            className="space-suggestions"
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
                              fontSize: "10px",
                              width: "fit-content",
                            }}
                          >
                            {maxSpaceSuggestions.map(
                              (range: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="suggestion-item"
                                  onClick={() =>
                                    handleMaxSpaceSuggestionSelect(range)
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
                                  {range.toString()} {t("sqm")}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {(filters.space_min || filters.space_max) && (
                      <div
                        className="d-flex justify-content-between gap-2 mt-3"
                        style={{ marginTop: "12px" }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setFilters({
                              ...filters,
                              space_min: null,
                              space_max: null,
                            });

                            localStorage.setItem(
                              "filters",
                              JSON.stringify({
                                ...filters,
                                space_min: null,
                                space_max: null,
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
                          {t("clear")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSpaceDropdown(false);
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
                          {t("done")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

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
