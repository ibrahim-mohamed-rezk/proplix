"use client";
import DropdownSeven from "@/components/search-dropdown/inner-dropdown/DropdownSeven";
import { useEffect, useState, useRef, useCallback } from "react";

import { getData } from "@/libs/server/backendServer";
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
  const observer = useRef<IntersectionObserver | null>(null);

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

      {/* Main Content */}
      <div className="row gx-0 relative max-w-[1920px] mx-auto">
        {/* Properties List Section - Full width grid */}
        <div className="col-12">
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
                  className="col-md-6 col-lg-4 col-xl-3"
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
