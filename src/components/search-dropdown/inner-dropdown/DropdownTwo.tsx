import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef, useCallback } from "react";
import { priceRanges } from "@/data/price-rnages";

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
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMinPriceSuggestions, setShowMinPriceSuggestions] = useState(false);
  const [showMaxPriceSuggestions, setShowMaxPriceSuggestions] = useState(false);
  const [minPriceSuggestions, setMinPriceSuggestions] = useState<any[]>([]);
  const [maxPriceSuggestions, setMaxPriceSuggestions] = useState<any[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (
      typeof filters?.location === "string" &&
      filters.location !== areaQuery
    ) {
      setAreaQuery(filters.location);
    }
  }, [filters?.location]);

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
    handleSearchChange({ target: { value: query } });
  };

  const handleAreaSuggestionSelect = (area: any) => {
    const displayName = getAreaDisplayName(area);
    setAreaQuery(displayName);
    setShowAreaSuggestions(false);

    if (typeof setFilters === "function") {
      setFilters({
        ...filters,
        location: displayName,
        area_id: area?.id ?? area?.value ?? area?.slug ?? null,
      });
    }

    handleSearchChange({
      target: {
        value: displayName,
        area,
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
      const filteredRanges = priceRanges.filter(
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
      const filteredRanges = priceRanges.filter(
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
                <input
                  ref={locationInputRef}
                  type="text"
                  placeholder={
                    t("search_location_placeholder") || "Enter location..."
                  }
                  className="type-input font-[400]"
                  value={areaQuery}
                  onChange={handleAreaInputChange}
                  onFocus={() => setShowAreaSuggestions(true)}
                  autoComplete="off"
                />
                {/* Search icon at end of input */}
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "#999",
                    fontSize: "18px",
                  }}
                >
                  <i className="fa-light fa-location-dot"></i>
                </span>
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
