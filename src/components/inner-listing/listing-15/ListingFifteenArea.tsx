"use client";
import DropdownSeven from "@/components/search-dropdown/inner-dropdown/DropdownSeven";
import { useEffect, useState, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { LocationData } from "@/libs/types/types";
import PropertiesCard from "@/components/cards/PropertiesCard";
import UseSticky from "@/hooks/UseSticky";

const ListingFifteenArea = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [previousProperties, setPreviousProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("endUser");
  const { sticky } = UseSticky();
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  type Filters = {
    [key: string]: string | number | number[] | null;
  };
  const [filters, setFilters] = useState<Filters>({
    status: "sale",
    price: null,
    down_price: null,
  });
  const locale = useLocale();
  const [types, setTypes] = useState([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  // Mobile view state
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Initialize filters from localStorage on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedFilters = localStorage.getItem("filters");
      if (storedFilters) {
        try {
          const parsedFilters = JSON.parse(storedFilters);
          setFilters(parsedFilters);
        } catch (error) {
          console.error("Error parsing stored filters:", error);
        }
      }
    }

    // Listen for filter updates from footer (when already on properties page)
    const handleFiltersUpdated = (event: CustomEvent) => {
      const updatedFilters = (event as CustomEvent).detail?.filters;
      if (updatedFilters) {
        setFilters(updatedFilters);
      }
    };

    window.addEventListener(
      "filtersUpdated",
      handleFiltersUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "filtersUpdated",
        handleFiltersUpdated as EventListener
      );
    };
  }, []);

  // Update localStorage when filters change
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     localStorage.setItem("filters", JSON.stringify(filters));
  //   }
  // }, [filters]);

  // Function to clear all existing markers
  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];
  };

  // Function to compare properties arrays to check if they're the same
  const arePropertiesEqual = (props1: any[], props2: any[]): boolean => {
    if (props1.length !== props2.length) return false;

    return props1.every((prop1, index) => {
      const prop2 = props2[index];
      return (
        prop1.id === prop2.id &&
        prop1.title === prop2.title &&
        prop1.price === prop2.price &&
        prop1.status === prop2.status
      );
    });
  };

  // Function to generate random coordinates around a center point (for testing/demo)
  const generateRandomCoordinates = (
    centerLat: number,
    centerLng: number,
    radiusInKm: number = 10
  ) => {
    const radiusInDegrees = radiusInKm / 111; // Approximate conversion
    const randomLat = centerLat + (Math.random() - 0.5) * radiusInDegrees * 2;
    const randomLng = centerLng + (Math.random() - 0.5) * radiusInDegrees * 2;
    return { lat: randomLat, lng: randomLng };
  };

  // Function to add property markers to the map
  const addPropertyMarkers = (
    propertiesToMap: any[],
    forceUpdate: boolean = false
  ) => {
    if (!map.current) return;

    console.log("Adding markers for properties:", propertiesToMap.length);

    // Only clear and recreate markers if forced or if this is the first time
    if (forceUpdate || markers.current.length === 0) {
      clearMarkers();
    } else {
      console.log("Skipping marker recreation - properties unchanged");
      return;
    }

    // Track valid coordinates for bounds calculation
    const validCoordinates: [number, number][] = [];

    // Default center for Egypt (Cairo area)
    const defaultCenter = { lat: 30.0444, lng: 31.2357 };

    propertiesToMap.forEach((property, index) => {
      let lat = null;
      let lng = null;

      // Try to get coordinates from property_locations
      if (
        property.property_locations &&
        property.property_locations.length > 0
      ) {
        const location = property.property_locations[0];
        if (location.latitude && location.longitude) {
          lat = parseFloat(location.latitude);
          lng = parseFloat(location.longitude);
        }
      }

      // If no valid coordinates, generate random ones for demo purposes
      // In production, you should either skip properties without coordinates
      // or get real coordinates from your backend
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        // Generate random coordinates around Cairo for demonstration
        const randomCoords = generateRandomCoordinates(
          defaultCenter.lat,
          defaultCenter.lng,
          20
        );
        lat = randomCoords.lat;
        lng = randomCoords.lng;

        console.log(
          `Generated demo coordinates for property ${property.id}: ${lat}, ${lng}`
        );
      }

      // Create popup content with property details
      const popupContent = `
        <div style="padding: 10px; max-width: 200px;">
          <img src="${property.cover}" alt="${
        property.title
      }" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" onerror="this.style.display='none'">
          <h6 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">${
            property.title
          }</h6>
          <p style="margin: 0; font-size: 12px; color: #666;">
            ${property.area?.name || t("unknown_area")}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: bold; color: #FF6625;">
            ${new Intl.NumberFormat(locale).format(property.price)} ${
        property.status === "rent" ? t("per_month") : ""
      }
          </p>
          <div style="display: flex; gap: 10px; margin-top: 8px; font-size: 11px; color: #888;">
            ${property.bedroom ? `<span>🛏️ ${property.bedroom}</span>` : ""}
            ${property.bathroom ? `<span>🚿 ${property.bathroom}</span>` : ""}
            ${property.sqt ? `<span>📐 ${property.sqt} sqt</span>` : ""}
          </div>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "250px",
      }).setHTML(popupContent);

      // Create marker with custom color based on status
      const markerColor = property.status === "sale" ? "#FF6625" : "#4A90E2";

      try {
        const marker = new mapboxgl.Marker({
          color: markerColor,
          scale: 0.8,
        })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current as mapboxgl.Map);

        markers.current.push(marker);
        validCoordinates.push([lng, lat]);

        console.log(
          `Added marker for property ${property.id} at ${lat}, ${lng}`
        );
      } catch (error) {
        console.error(
          `Error adding marker for property ${property.id}:`,
          error
        );
      }
    });

    console.log(`Successfully added ${validCoordinates.length} markers`);

    // If we have valid coordinates, fit the map to show all markers
    if (validCoordinates.length > 0) {
      if (validCoordinates.length === 1) {
        // Single marker - center on it
        map.current.flyTo({
          center: validCoordinates[0],
          zoom: 14,
        });
      } else {
        // Multiple markers - fit bounds
        const bounds = new mapboxgl.LngLatBounds();
        validCoordinates.forEach((coord) => {
          bounds.extend(coord);
        });

        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
          duration: 1000,
        });
      }
    }
  };

  // Fetch properties function
  const fetchProperties = async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await getData(
        "properties",
        { ...filters, page, per_page: 10 },
        { lang: locale }
      );

      const newProperties = response.data.data.properties;
      const pagination = response.data.data.pagination;

      if (append) {
        setProperties((prev) => {
          const updated = [...prev, ...newProperties];
          setPreviousProperties(prev);
          return updated;
        });
      } else {
        setPreviousProperties(properties);
        setProperties(newProperties);
      }

      setCurrentPage(pagination.current_page);
      setTotalPages(pagination.last_page);
      setHasMore(pagination.has_more_pages);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial fetch and filter changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchProperties(1, false);
  }, [locale, filters]);

  // Update map markers when properties change
  useEffect(() => {
    if (properties.length > 0 && map.current) {
      // Only update markers if properties have actually changed
      if (!arePropertiesEqual(properties, previousProperties)) {
        console.log("Properties changed, updating markers");
        // Wait a bit for map to be fully initialized
        setTimeout(() => {
          addPropertyMarkers(properties, true);
        }, 500);
      } else {
        console.log("Properties unchanged, skipping marker update");
      }
    }
  }, [properties, locale]);

  // Infinite scroll callback
  const lastPropertyElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchProperties(currentPage + 1, true);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoadingMore, hasMore, currentPage]
  );

  const handleResetFilter = (): void => {
    const defaultFilters = {
      status: "sale",
      price: null,
      down_price: null,
      amenities: [],
      payment_method: null,
      furnishing: null,
      size: null,
      type_id: null,
    };
    setFilters(defaultFilters);
    if (typeof window !== "undefined") {
      localStorage.setItem("filters", JSON.stringify(defaultFilters));
    }
  };

  // fetch types form api
  useEffect(() => {
    const fetchAgents = async () => {
      const response = await getData("types", {}, { lang: locale });
      setTypes(response.data.data);
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    mapboxgl.accessToken =
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      "pk.eyJ1IjoicmFzaGFkbnVzaGFkIiwiYSI6ImNseGo1c3E1dDBjeWgybHFlOWp2b3Bsb3UifQ.eG9yV25a_w9Jp-3weVnmPA";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: locationData?.coordinates
        ? [locationData.coordinates.lng, locationData.coordinates.lat]
        : [31.2357, 30.0444], // Default to Egypt coordinates based on user location
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // When map is loaded, add markers if properties exist
    map.current.on("load", () => {
      console.log("Map loaded successfully");
      if (properties.length > 0) {
        addPropertyMarkers(properties, true);
      }
    });

    // Also try to add markers after style loads (backup)
    map.current.on("style.load", () => {
      console.log("Map style loaded");
      if (properties.length > 0) {
        setTimeout(() => {
          addPropertyMarkers(properties, true);
        }, 100);
      }
    });

    return () => {
      if (map.current) {
        clearMarkers();
        map.current.remove();
        map.current = null;
      }
    };
  }, [mobileView]); // Re-initialize map when view changes

  // Handle location filter changes
  useEffect(() => {
    if (!map.current) return;
    if (locationData?.coordinates) {
      map.current.flyTo({
        center: [locationData.coordinates.lng, locationData.coordinates.lat],
        zoom: 13,
      });
    }
  }, [locationData]);

  // Add handler for status change
  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value === "all" ? null : value,
    });
  };

  return (
    <div className="property-listing-eight pt-150 xl-pt-120">
      {/* dropdown filters */}
      <div className="search-wrapper-three swth !border-none  layout-two position-relative mb-2">
        <div className="bg-wrapper rounded-3 border border-light bg-white p-2">
          <DropdownSeven
            handleResetFilter={handleResetFilter}
            filters={filters}
            setFilters={setFilters}
            handleLocationChange={(location: LocationData) => {
              setFilters({ ...filters, location: location.description });
              setLocationData(location);
            }}
          />
        </div>
      </div>

      {/* property type filter */}
      {/* {!sticky && (
        <div className="listing-type-filter border-0 mb-2">
          <div className="wrapper">
            <div className="card border-0 rounded-3 bg-gradient-light">
              <div className="card-body p-2">
                <div className="row align-items-center">
                  <div className="col-12">
                    <ul className="nav nav-pills flex-wrap justify-content-start align-items-center gap-1 mb-0">
                      <li className="nav-item me-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 fw-semibold border border-primary border-opacity-25">
                          {t(`Select Type`)}
                        </span>
                      </li>
                      <li className="nav-item">
                        <Link
                          href="#"
                          className={`nav-link px-2 py-1 rounded-pill border transition-all duration-300 fw-medium ${
                            filters.type_id === null
                              ? "active bg-primary text-white border-primary"
                              : "text-dark bg-white border-light hover:bg-light hover:border-primary hover:text-primary"
                          }`}
                          onClick={() =>
                            setFilters({ ...filters, type_id: null })
                          }
                        >
                          {t("all")}
                        </Link>
                      </li>
                      {types?.map(
                        (select: { id: string | number; title: string }) => (
                          <li key={select.id} className="nav-item">
                            <Link
                              href="#"
                              className={`nav-link px-2 py-1 rounded-pill border transition-all duration-300 fw-medium ${
                                filters.type_id === select.id
                                  ? "active bg-primary text-white border-primary transform scale-105"
                                  : "text-dark bg-white border-light hover:bg-light hover:border-primary hover:text-primary hover:transform hover:translateY-1"
                              }`}
                              onClick={() =>
                                setFilters({ ...filters, type_id: select.id })
                              }
                            >
                              {select.title}
                            </Link>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {/* Mobile View Toggle - Only visible on mobile */}
      <div className="d-block d-lg-none mb-3">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="mobile-view-toggle d-flex align-items-center justify-content-center bg-light rounded p-2">
                <button
                  className={`border text-black btn border-[#FF6625] flex-1 me-2 ${
                    mobileView === "list"
                      ? "!bg-[#FF6625] text-white"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setMobileView("list")}
                >
                  <i className="fa-regular fa-list me-2"></i>
                  {t("List View")}
                </button>
                <button
                  className={`border text-black btn border-[#FF6625] flex-1 ${
                    mobileView === "map"
                      ? "!bg-[#FF6625] text-white"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setMobileView("map")}
                >
                  <i className="fa-regular fa-map me-2"></i>
                  {t("Map View")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row gx-0 relative max-w-[1920px] mx-auto">
        {/* Map Section - Fixed to top on desktop */}
        <div
          className={`col-lg-5 pro-list-map ${
            mobileView === "list" ? "d-none d-lg-block" : "d-block d-lg-block"
          }`}
          style={{
            position: sticky && properties.length > 0 ? "fixed" : "sticky",
            top: "88px",
            zIndex: properties.length > 0 ? -1 : 0,
            alignSelf: "flex-start",
            height: "calc(100vh - 88px)",
          }}
        >
          <div
            id="google-map-area"
            className="h-[100%] w-full prop-map-container"
            style={{
              top: 0,
              height: "calc(100vh - 88px)",
              position: "relative",
            }}
          >
            <div className="google-map-home" id="contact-google-map">
              <div
                ref={mapContainer}
                className="gmap_canvas w-100"
                style={{ height: "calc(100vh - 88px)" }}
              />
            </div>
          </div>
        </div>

        {sticky && properties.length > 0 && (
          <div className="col-5 hided-in-mobile"> </div>
        )}

        {/* Properties List Section - Scrollable with infinite scroll */}
        <div
          className={` col-lg-7 ${
            mobileView === "map" ? "d-none d-lg-block" : "d-block"
          }`}
        >
          <div
            className="bg-light pl-40 pr-40 pt-35 pb-60"
            style={{
              minHeight:
                properties.length === 0 ? "calc(100vh - 88px - 200px)" : "auto",
            }}
          >
            {/* Initial loading state */}
            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t("loading")}</span>
                </div>
              </div>
            )}

            {/* Render properties from API response */}
            <div className="row">
              {properties.map((property: any, index: number) => (
                <div
                  className="col-md-6"
                  key={property.id}
                  ref={
                    index === properties.length - 1
                      ? lastPropertyElementRef
                      : null
                  }
                >
                  <PropertiesCard item={property} />
                </div>
              ))}
            </div>

            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="text-center  h-[calc(100vh-200px)] py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t("loading_more")}</span>
                </div>
                <p className="mt-2 text-muted">
                  {t("loading_more_properties")}
                </p>
              </div>
            )}

            {/* No more properties message */}
            {!hasMore && properties.length > 0 && (
              <div className="text-center py-4">
                <p className="text-muted">{t("no_more_properties")}</p>
              </div>
            )}

            {/* No properties found */}
            {!isLoading && properties.length === 0 && (
              <div className="text-center py-5 h-[calc(100vh-200px)]">
                <p className="text-muted">{t("no_properties_found")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingFifteenArea;
