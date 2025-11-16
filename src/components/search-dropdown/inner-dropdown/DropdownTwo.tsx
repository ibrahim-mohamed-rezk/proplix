import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { priceRanges, rentPriceRanges } from "@/data/price-rnages";

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
  const [types, setTypes] = useState<any[]>([]);
  const [areaQuery, setAreaQuery] = useState(filters?.location || "");
  const [areas, setAreas] = useState<any[]>([]);
  const [isAreasLoading, setIsAreasLoading] = useState(false);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<
    Array<{ id: string | number; name: string }>
  >([]);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [minPriceSuggestions, setMinPriceSuggestions] = useState<any[]>([]);
  const [maxPriceSuggestions, setMaxPriceSuggestions] = useState<any[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Determine which price ranges to use based on status
  const activePriceRanges = useMemo(() => {
    const status = filters?.status;
    if (status === "rent" || status === "commercial-rent") {
      return rentPriceRanges;
    }
    return priceRanges;
  }, [filters?.status]);
  const areaSuggestionsRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const maxPriceSuggestionsRef = useRef<HTMLDivElement>(null);

  // fetch types from api
  useEffect(() => {
    const fetchTypes = async () => {
      const response = await getData("types", {}, { lang: locale });
      setTypes(response.data.data);
    };
    fetchTypes();
  }, [locale]);

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
    fetchAreas(areaQuery || "");
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
      filters.location !== areaQuery &&
      !selectedAreas.length
    ) {
      setAreaQuery(filters.location);
    }
  }, [filters?.location, areaQuery, selectedAreas.length]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAreas(areaQuery || "");
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [areaQuery, fetchAreas]);

  const handleAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setAreaQuery(query);
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
      setAreaQuery("");
      return;
    }

    // Add to selected areas
    const newSelectedArea = { id: areaId, name: displayName };
    const updatedSelectedAreas = [...selectedAreas, newSelectedArea];
    setSelectedAreas(updatedSelectedAreas);

    // Update filters with array of area IDs
    const areaIds = updatedSelectedAreas.map((a) => a.id);
    if (typeof setFilters === "function") {
      setFilters({
        ...filters,
        location: updatedSelectedAreas.map((a) => a.name).join(", "),
        area_id: areaIds,
      });
    }

    handleSearchChange({
      target: {
        value: updatedSelectedAreas.map((a) => a.name).join(", "),
        area,
      },
    });

    setAreaQuery("");
    setShowAreaSuggestions(false);
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

    if (typeof setFilters === "function") {
      setFilters({
        ...filters,
        location:
          updatedSelectedAreas.length > 0
            ? updatedSelectedAreas.map((a) => a.name).join(", ")
            : "",
        area_id: areaIds,
      });
    }

    handleSearchChange({
      target: {
        value:
          updatedSelectedAreas.length > 0
            ? updatedSelectedAreas.map((a) => a.name).join(", ")
            : "",
      },
    });
  };

  // Handle min price input change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinPrice(value);

    // Trigger the price change handler to send request
    handlePriceChange(value.toString());

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
    setMaxPrice(value);

    // Trigger the down price change handler to send request
    handleDown_priceChange(value);

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
    setMinPrice(range.toString());
    setShowMinPriceSuggestions(false);
    // Trigger the price change handler with the selected from value
    handlePriceChange(range.toString());
  };

  // Handle max price suggestion selection
  const handleMaxPriceSuggestionSelect = (range: any) => {
    setMaxPrice(range.toString());
    setShowMaxPriceSuggestions(false);
    // Trigger the price change handler with the selected to value
    handleDown_priceChange(range.toString());
  };

  const handleEmptyarea = () => {
    setShowAreaSuggestions(false);
    setAreaQuery("");
    setSelectedAreas([]);
    if (typeof setFilters === "function") {
      setFilters({
        ...filters,
        location: "",
        area_id: null,
      });
    }
    handleSearchChange({ target: { value: "" } });
  };

  // Hide suggestions on click outside
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
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTypeDropdown(false);
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
                  placeholder={
                    selectedAreas.length > 0
                      ? t("add_more_locations") || "Add more locations..."
                      : t("search_location_placeholder") || "Enter location..."
                  }
                  className="type-input font-[400]"
                  value={areaQuery}
                  onChange={handleAreaInputChange}
                  onFocus={() => setShowAreaSuggestions(true)}
                  autoComplete="off"
                  style={{
                    paddingInlineEnd: "38px", // add space for the icon button
                  }}
                />
                {/* Absolute clickable icon over the input */}
                {selectedAreas.length > 0 || areaQuery.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAreaQuery("");
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
                    {areaQuery.length > 0 ? (
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
                {showAreaSuggestions && (
                  <div
                    ref={areaSuggestionsRef}
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
                    {isAreasLoading && (
                      <div
                        style={{
                          padding: "12px 15px",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        {t("loading") || "Loading..."}
                      </div>
                    )}
                    {!isAreasLoading && areas.length === 0 && (
                      <div
                        style={{
                          padding: "12px 15px",
                          fontSize: "14px",
                          color: "#666",
                        }}
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
                                e.currentTarget.querySelector(
                                  ".secondary-text"
                                );
                              if (secondaryText)
                                (secondaryText as HTMLElement).style.color =
                                  "#666";
                              const icon = e.currentTarget.querySelector("i");
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

          <div className="col-xl-3 col-lg-4">
            <div
              className="input-box-one border-left"
              style={{ position: "relative" }}
              ref={typeDropdownRef}
            >
              <div className="label">{t("im_looking_to")}</div>
              <div
                className="type-select-trigger"
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                style={{
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
                  {types.find((type: any) => type.id === filters.type_id)
                    ?.title || t("all")}
                </span>
                <i
                  className={`fa-solid fa-chevron-down ${
                    showTypeDropdown ? "rotated" : ""
                  }`}
                  style={{
                    transition: "transform 0.2s",
                    transform: showTypeDropdown
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                ></i>
              </div>

              {showTypeDropdown && (
                <div
                  className="type-dropdown hide-scrollbar"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#fff",
                    border: "1px solid rgba(0, 0, 0, 0.05)",
                    borderRadius: "10px",
                    maxHeight: "280px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 13px 35px -12px rgba(35, 35, 35, 0.1)",
                    marginTop: "4px",
                  }}
                >
                  <div
                    className="type-option"
                    onClick={() => {
                      handleTypesChange(null);
                      setShowTypeDropdown(false);
                    }}
                    style={{
                      padding: "12px 15px",
                      cursor: "pointer",
                      fontSize: "14px",
                      transition: "background-color 0.2s, color 0.2s",
                      borderBottom: "1px solid #f3f4f6",
                      backgroundColor:
                        filters.type_id === null ? "#ff672508" : "#fff",
                      color: filters.type_id === null ? "#FF6725" : "#333",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "#ff672508";
                      (e.currentTarget as HTMLElement).style.color = "#FF6725";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        filters.type_id === null ? "#ff672508" : "#fff";
                      (e.currentTarget as HTMLElement).style.color =
                        filters.type_id === null ? "#FF6725" : "#333";
                    }}
                  >
                    {t("all")}
                  </div>
                  {types?.map((type: any) => (
                    <div
                      key={type.id}
                      className="type-option"
                      onClick={() => {
                        handleTypesChange(type.id);
                        setShowTypeDropdown(false);
                      }}
                      style={{
                        padding: "12px 15px",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "background-color 0.2s, color 0.2s",
                        borderBottom: "1px solid #f3f4f6",
                        backgroundColor:
                          filters.type_id === type.id ? "#ff672508" : "#fff",
                        color: filters.type_id === type.id ? "#FF6725" : "#333",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          "#ff672508";
                        (e.currentTarget as HTMLElement).style.color =
                          "#FF6725";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          filters.type_id === type.id ? "#ff672508" : "#fff";
                        (e.currentTarget as HTMLElement).style.color =
                          filters.type_id === type.id ? "#FF6725" : "#333";
                      }}
                    >
                      {type.title}
                    </div>
                  ))}
                </div>
              )}
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
                <span
                  className="line-clamp-1 overflow-hidden text-ellipsis"
                  style={{ color: "#000" }}
                >
                  {minPrice && maxPrice
                    ? `${minPrice} - ${maxPrice} ${t("EGP")}`
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
                          fontSize: "10px",
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
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                        onFocus={handleMaxPriceFocus}
                        onBlur={handleMaxPriceBlur}
                        autoComplete="off"
                        style={{
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "10px",
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
