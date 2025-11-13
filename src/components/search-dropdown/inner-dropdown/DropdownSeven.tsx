import NiceSelect from "@/ui/NiceSelect";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import { useState, useEffect, useRef, useCallback } from "react";
import { LocationData } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";
import { priceRanges } from "@/data/price-rnages";

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
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [minPriceSuggestions, setMinPriceSuggestions] = useState<any[]>([]);
  const [maxPriceSuggestions, setMaxPriceSuggestions] = useState<any[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const areaSuggestionsRef = useRef<HTMLDivElement>(null);
  const priceDropdownRef = useRef<HTMLDivElement>(null);
  const minPriceInputRef = useRef<HTMLInputElement>(null);
  const maxPriceInputRef = useRef<HTMLInputElement>(null);
  const minPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const maxPriceSuggestionsRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [types, setTypes] = useState<any[]>([]);

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

  useEffect(() => {
    if (
      typeof filters?.location === "string" &&
      filters.location !== locationQuery
    ) {
      setLocationQuery(filters.location);
    }
  }, [filters?.location, locationQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAreas(locationQuery || "");
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [locationQuery, fetchAreas]);

  const persistFiltersLocation = useCallback(
    (value: string, areaId?: string | number | null) => {
      if (typeof window === "undefined") return;
      try {
        const storedFilters = JSON.parse(
          localStorage.getItem("filters") || "{}"
        );
        storedFilters.location = value;
        if (areaId !== undefined) {
          storedFilters.area_id = areaId;
        }
        localStorage.setItem("filters", JSON.stringify(storedFilters));
      } catch {
        // ignore
      }
    },
    []
  );

  const handleAreaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationQuery(value);
    setShowAreaSuggestions(true);

    if (typeof setFilters === "function" && filters) {
      setFilters({
        ...filters,
        location: value,
        area_id: null,
      });
    }

    persistFiltersLocation(value, null);
  };

  const handleAreaSuggestionSelect = (area: any) => {
    const displayName = getAreaDisplayName(area);
    const areaId = area?.id ?? area?.value ?? area?.slug ?? null;

    setLocationQuery(displayName);
    setShowAreaSuggestions(false);

    if (typeof setFilters === "function" && filters) {
      setFilters({
        ...filters,
        location: displayName,
        area_id: areaId,
      });
    }

    persistFiltersLocation(displayName, areaId);

    const locationData: LocationData = {
      description: displayName,
      placeId: String(areaId ?? displayName),
    };

    if (typeof handleLocationChange === "function") {
      handleLocationChange(locationData);
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
      if (!acc.find((item) => item.toString() === range.toString())) {
        acc.push(range);
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
      if (!acc.find((item) => item.toString() === range.toString())) {
        acc.push(range);
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
                <input
                  ref={locationInputRef}
                  type="text"
                  className="location-input nice-select fw-normal "
                  style={{ paddingRight: 32 }}
                  placeholder={
                    t("search_location_placeholder") || "Enter location..."
                  }
                  value={locationQuery}
                  onChange={handleAreaInputChange}
                  onFocus={() =>
                    (areas.length > 0 || isAreasLoading) &&
                    setShowAreaSuggestions(true)
                  }
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
                      areas.map((area: any) => (
                        <div
                          key={
                            area?.id ?? area?.value ?? getAreaDisplayName(area)
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
                              e.currentTarget.querySelector(".secondary-text");
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
