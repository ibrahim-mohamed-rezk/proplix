"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";

export interface AreaSelectionResult {
  description: string;
  areaId?: string | number | null;
  coordinates?: {
    lat: number;
    lng: number;
  };
  area?: any;
}

interface AreaLocationInputProps {
  onSelect: (selection: AreaSelectionResult) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const extractCoordinate = (value: any) => {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const AreaLocationInput: React.FC<AreaLocationInputProps> = ({
  onSelect,
  defaultValue = "",
  placeholder,
  disabled = false,
  className = "",
}) => {
  const t = useTranslations("properties");
  const locale = useLocale();

  const [query, setQuery] = useState<string>(defaultValue);
  const [areas, setAreas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const fetchController = useRef<number>();

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
    async (term: string) => {
      try {
        setIsLoading(true);
        const trimmed = term.trim();
        const params = trimmed ? { search: trimmed } : {};
        const response = await getData("area-search", params, { lang: locale });
        const list = response?.data?.data;
        setAreas(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching areas:", error);
        setAreas([]);
      } finally {
        setIsLoading(false);
      }
    },
    [locale]
  );

  // Initial fetch
  useEffect(() => {
    fetchAreas(defaultValue || "");
  }, [defaultValue, fetchAreas]);

  // Debounced fetch on query change
  useEffect(() => {
    if (fetchController.current) {
      clearTimeout(fetchController.current);
    }

    fetchController.current = window.setTimeout(() => {
      fetchAreas(query);
    }, 300);

    return () => {
      if (fetchController.current) {
        clearTimeout(fetchController.current);
      }
    };
  }, [query, fetchAreas]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectArea = (area: any) => {
    const displayName = getAreaDisplayName(area);
    const areaId = area?.id ?? area?.value ?? area?.slug ?? null;
    const lat =
      extractCoordinate(area?.lat) ??
      extractCoordinate(area?.latitude) ??
      extractCoordinate(area?.location_lat) ??
      extractCoordinate(area?.geo_lat);
    const lng =
      extractCoordinate(area?.lng) ??
      extractCoordinate(area?.longitude) ??
      extractCoordinate(area?.location_lng) ??
      extractCoordinate(area?.geo_lng);

    setQuery(displayName);
    setShowSuggestions(false);

    onSelect({
      description: displayName,
      areaId,
      coordinates:
        lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
      area,
    });
  };

  const developerLabel = (area: any) => getAreaDeveloperName(area);

  return (
    <div
      className={`position-relative ${className}`}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={
          placeholder || t("search_for_a_location") || "Search for an area..."
        }
        disabled={disabled}
        className="form-control location-input fw-normal"
        style={{
          width: "100%",
          padding: "12px 15px",
          border: "1px solid #e0e0e0",
          borderRadius: "4px",
          fontSize: "14px",
          backgroundColor: disabled ? "#f8f9fa" : "#fff",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />

      {isLoading && (
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
          {t("loading") || "Loading..."}
        </div>
      )}

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="location-suggestions hide-scrollbar"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            maxHeight: "240px",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 13px 35px -12px rgba(35, 35, 35, 0.1)",
          }}
        >
          {isLoading && (
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

          {!isLoading && areas.length === 0 && (
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

          {!isLoading &&
            areas.map((area: any) => (
              <div
                key={area?.id ?? area?.value ?? getAreaDisplayName(area)}
                className="suggestion-item"
                onClick={() => handleSelectArea(area)}
                style={{
                  padding: "12px 15px",
                  cursor: "pointer",
                  fontSize: "14px",
                  transition: "background-color 0.2s, color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#ff672508";
                  Array.from(
                    e.currentTarget.querySelectorAll("div, i")
                  ).forEach((el) => {
                    (el as HTMLElement).style.color = "#FF6725";
                  });
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    "#fff";
                  const mainText =
                    e.currentTarget.querySelector(".main-text");
                  if (mainText)
                    (mainText as HTMLElement).style.color = "#333";
                  const developer =
                    e.currentTarget.querySelector(".developer-text");
                  if (developer)
                    (developer as HTMLElement).style.color = "#888";
                  const secondary =
                    e.currentTarget.querySelector(".secondary-text");
                  if (secondary)
                    (secondary as HTMLElement).style.color = "#666";
                  const icon = e.currentTarget.querySelector("i");
                  if (icon) (icon as HTMLElement).style.color = "#666";
                }}
              >
                <i
                  className="fa-light fa-location-dot"
                  style={{ color: "#666", flexShrink: 0 }}
                ></i>
                <div>
                  <div
                    className="main-text"
                    style={{ fontWeight: "500", color: "#333" }}
                  >
                    {getAreaDisplayName(area)}
                  </div>
                  {developerLabel(area) && (
                    <div
                      className="developer-text"
                      style={{
                        fontSize: "11px",
                        color: "#888",
                      }}
                    >
                      {developerLabel(area)}
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
  );
};

export default AreaLocationInput;

