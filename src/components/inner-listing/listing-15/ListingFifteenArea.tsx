"use client";
import DropdownSeven from "@/components/search-dropdown/inner-dropdown/DropdownSeven";
import NiceSelect from "@/ui/NiceSelect";
import { useEffect, useState, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import featureIcon_1 from "@/assets/images/icon/icon_04.svg";
import featureIcon_2 from "@/assets/images/icon/icon_05.svg";
import featureIcon_3 from "@/assets/images/icon/icon_06.svg";

import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { LocationData } from "@/libs/types/types";
import PropertiesCard from "@/components/cards/PropertiesCard";

const ListingFifteenArea = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const t = useTranslations("endUser");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [filters, setFilters] = useState<{
    [key: string]: string | number | null;
  }>(() => {
    const storedFilters = localStorage.getItem("filters");
    return storedFilters
      ? JSON.parse(storedFilters)
      : {
          status: "sale",
          price: null,
          down_price: null,
        };
  });
  const locale = useLocale();
  const [types, setTypes] = useState([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Mobile view state
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Update localStorage when filters change
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

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
        { ...filters, page, per_page: 10 }, // Matching API default per_page
        { lang: locale }
      );

      const newProperties = response.data.data.properties;
      const pagination = response.data.data.pagination;

      if (append) {
        setProperties((prev) => [...prev, ...newProperties]);
      } else {
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
      type_id: null,
    };
    setFilters(defaultFilters);
    localStorage.setItem("filters", JSON.stringify(defaultFilters));
  };

  // fetch types form api
  useEffect(() => {
    const fetchAgents = async () => {
      const response = await getData("types", {}, { lang: locale });
      setTypes(response.data.data);
    };
    fetchAgents();
  }, []);

  console.log(filters);

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
        : [-105.54557276330914, 39.29302101722867], // Default center
      zoom: 12,
    });
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mobileView]); // Re-initialize map when view changes

  useEffect(() => {
    if (!map.current) return;
    if (locationData?.coordinates) {
      // Remove previous marker
      if (marker.current) {
        marker.current.remove();
      }
      marker.current = new mapboxgl.Marker({ color: "red" })
        .setLngLat([locationData.coordinates.lng, locationData.coordinates.lat])
        .addTo(map.current);
      map.current.setCenter([
        locationData.coordinates.lng,
        locationData.coordinates.lat,
      ]);
      map.current.setZoom(12);
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
      <div className="search-wrapper-three layout-two position-relative">
        <div className="bg-wrapper rounded-0 border-0">
          <DropdownSeven
            handleBathroomChange={(value) => {
              setFilters({
                ...filters,
                bathrooms: value === "all" ? null : value,
              });
            }}
            handleAreaChange={(value) => {
              setFilters({
                ...filters,
                area_id: value === "all" ? null : value,
              });
            }}
            handleBedroomChange={(value) => {
              setFilters({
                ...filters,
                bedrooms: value === "all" ? null : value,
              });
            }}
            handleSearchChange={() => {}}
            handleAgentChange={(value) => {
              if (value === "all") {
                setFilters({ ...filters, user_id: null });
              } else {
                setFilters({ ...filters, user_id: value });
              }
            }}
            handlePriceChange={() => {}}
            maxPrice={0}
            priceValue={0}
            handleResetFilter={handleResetFilter}
            selectedAmenities={[]}
            handleAmenityChange={() => {}}
            filters={filters}
            handleLocationChange={(location) => {
              setFilters({ ...filters, location: location.description });
              setLocationData(location);
            }}
            handleStatusChange={handleStatusChange}
            handlePriceDropChange={(value) => {
              if (value === "all") {
                setFilters({ ...filters, price: null, down_price: null });
              } else {
                setFilters({
                  ...filters,
                  price: value.split("-")[0],
                  down_price: value.split("-")[1],
                });
              }
            }}
          />
        </div>
      </div>

      {/* property type filter */}
      <div className="listing-type-filter border-0">
        <div className="wrapper">
          <ul className="style-none  d-flex flex-wrap align-items-center justify-content-start ">
            <li className="!m-[0px]">{t(`Select Type`)}</li>
            <li>
              <Link
                href="#"
                className={filters.type_id === null ? "active" : ""}
                onClick={() => setFilters({ ...filters, type_id: null })}
              >
                {t("all")}
              </Link>
            </li>
            {types?.map((select: { id: string | number; title: string }) => (
              <li key={select.id}>
                <Link
                  href="#"
                  className={filters.type_id === select.id ? "active" : ""}
                  onClick={() => setFilters({ ...filters, type_id: select.id })}
                >
                  {select.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

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
      <div
        className="row gx-0 max-w-[1920px] mx-auto"
        style={{ height: "100%" }}
      >
        {/* Map Section - Fixed to top on desktop */}
        <div
          className={`col-xxl-6 col-lg-5 ${
            mobileView === "list" ? "d-none d-lg-block" : "d-block d-lg-block"
          }`}
        >
          <div
            id="google-map-area"
            className="h-[100%] w-full prop-map-container position-sticky"
            style={{ top: 0, height: "100vh" }}
          >
            <div
              className="google-map-home"
              id="contact-google-map"
              style={{ height: "100%" }}
            >
              <div
                ref={mapContainer}
                className="gmap_canvas h-100 w-100"
                style={{ height: "100%", minHeight: 300 }}
              />
            </div>
          </div>
        </div>

        {/* Properties List Section - Scrollable with infinite scroll */}
        <div
          className={`col-xxl-6 col-lg-7 ${
            mobileView === "map" ? "d-none d-lg-block" : "d-block"
          }`}
        >
          <div className="bg-light pl-40 pr-40 pt-35 pb-60">
            {/* Initial loading state */}
            {isLoading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
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
                  <PropertiesCard item={property} token="" />
                </div>
              ))}
            </div>

            {/* Loading more indicator */}
            {isLoadingMore && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading more...</span>
                </div>
                <p className="mt-2 text-muted">Loading more properties...</p>
              </div>
            )}

            {/* No more properties message */}
            {!hasMore && properties.length > 0 && (
              <div className="text-center py-4">
                <p className="text-muted">No more properties to load</p>
              </div>
            )}

            {/* No properties found */}
            {!isLoading && properties.length === 0 && (
              <div className="text-center py-5">
                <p className="text-muted">
                  No properties found matching your criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingFifteenArea;
