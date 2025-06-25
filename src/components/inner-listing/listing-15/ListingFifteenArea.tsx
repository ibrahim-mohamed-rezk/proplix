"use client";
import DropdownSeven from "@/components/search-dropdown/inner-dropdown/DropdownSeven";
import NiceSelect from "@/ui/NiceSelect";
import { useEffect, useState, useRef } from "react";
import ReactPaginate from "react-paginate";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import featureIcon_1 from "@/assets/images/icon/icon_04.svg";
import featureIcon_2 from "@/assets/images/icon/icon_05.svg";
import featureIcon_3 from "@/assets/images/icon/icon_06.svg";

import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { LocationData } from "@/libs/types/types";
import Image from "next/image";

const ListingFifteenArea = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("endUser");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [filters, setFilters] = useState<{
    [key: string]: string | number | null;
  }>({
    type_id: null,
  });
  const locale = useLocale();
  const [types, setTypes] = useState([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await getData("properties", filters, { lang: locale });
        setProperties(response.data.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [locale, filters]);

  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 3;
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    setPageCount(Math.ceil(properties.length / itemsPerPage));
  }, [properties]);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = properties.slice(itemOffset, endOffset);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % properties.length;
    setItemOffset(newOffset);
  };

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
  }, []);

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

  return (
    <div className="property-listing-eight pt-150  xl-pt-120">
      {/* dropdown filters */}
      <div className="search-wrapper-three layout-two position-relative">
        <div className="bg-wrapper rounded-0 border-0">
          <DropdownSeven
            handleBathroomChange={(value) => {
              setFilters({ ...filters, bathrooms: value });
            }}
            handleBedroomChange={(value) => {
              setFilters({ ...filters, bedrooms: value });
            }}
            handleSearchChange={() => {}}
            handlePriceChange={() => {}}
            maxPrice={0}
            priceValue={0}
            handleResetFilter={handleResetFilter}
            selectedAmenities={[]}
            handleAmenityChange={() => {}}
            handleLocationChange={(location) => {
              setFilters({ ...filters, location: location.description });
              setLocationData(location);
            }}
            handleStatusChange={() => {}}
            handlePriceDropChange={(value) => {
              if (value === "all") {
                setFilters({ ...filters, price: null, down_price: null });
              }
              setFilters({
                ...filters,
                price: value.split("-")[0],
                down_price: value.split("-")[1],
              });
            }}
          />
        </div>
      </div>

      {/* property type filter */}
      <div className="listing-type-filter border-0">
        <div className="wrapper">
          <ul className="style-none d-flex flex-wrap align-items-center justify-content-start ">
            <li>{t(`Select Type`)}</li>
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

      {/* map */}
      <div
        className="row gx-0 max-w-[1920px] mx-auto"
        style={{ height: "100%" }}
      >
        <div className="col-xxl-6 col-lg-5">
          <div
            id="google-map-area"
            className="h-[100%] w-full prop-map-container"
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

        <div className="col-xxl-6 col-lg-7">
          <div className="bg-light pl-40 pr-40 pt-35 pb-60">
            <div className="listing-header-filter d-sm-flex justify-content-between align-items-center mb-40 lg-mb-30">
              <div>
                {t("Showing")}{" "}
                <span className="color-dark fw-500">
                  {itemOffset + 1}–{itemOffset + currentItems.length}
                </span>{" "}
                {t("of")}{" "}
                <span className="color-dark fw-500">{properties.length}</span>{" "}
                {t("results")}
              </div>
              <div className="d-flex align-items-center xs-mt-20">
                <div className="short-filter d-flex align-items-center">
                  <div className="fs-16 me-2">{t("Sort by:")}</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "newest", text: t("Newest") },
                      { value: "best_seller", text: t("Best Seller") },
                      { value: "best_match", text: t("Best Match") },
                      { value: "price_low", text: t("Price Low") },
                      { value: "price_high", text: t("Price High") },
                    ]}
                    defaultCurrent={0}
                    onChange={() => {}}
                    name=""
                    placeholder=""
                  />
                </div>
                <Link
                  href="/listing_15"
                  className="tran3s layout-change rounded-circle ms-auto ms-sm-3"
                  data-bs-toggle="tooltip"
                  title={t("Switch To List View")}
                >
                  <i className="fa-regular fa-bars"></i>
                </Link>
              </div>
            </div>

            {/* Render properties from API response */}
            {currentItems.map((property: any) => (
              <div
                key={property.id}
                className="listing-card-seven !rounded-[20px] p-20 mb-35 wow fadeInUp"
              >
                <div className="d-flex flex-wrap items-stretch justify-stretch layout-one h-full">
                  <div
                    className="img-gallery position-relative z-1 rounded-[20px] flex-shrink-0 overflow-hidden"
                    style={{
                      backgroundImage: "none",
                      width: "294px",
                      height: "269px",
                    }}
                  >
                    <button onClick={() => {}} className="fav-btn z-50 tran3s">
                      <i className="fa-light fa-heart"></i>
                    </button>
                    <Link
                      className="flex w-full h-full items-center justify-center"
                      href={`properties/${property.slug}`}
                    >
                      <img
                        className="w-full h-full object-cover"
                        src={property.cover}
                        alt={property.title}
                      />
                    </Link>
                  </div>

                  <div className="property-info flex-1">
                    <div className={`tag rounded-[25px] fw-500`}>
                      {property.status}
                    </div>
                    <Link
                      href={`properties/${property.slug}`}
                      className={`text-[#FF6625] line-clamp-1 mt-[10px] text-[32px] fw-500`}
                    >
                      {property.title}
                    </Link>
                    <div className="address fs-16">
                      <i className="bi bi-geo-alt"></i>
                      {property.area?.name}
                    </div>
                    <div className="feature2 fs-16 color-dark mt-[5px] pb-5">
                      <ul className="style-none border-t border-b pb-[10px] !my-0 !py-0 d-flex flex-wrap align-items-center justify-content-between">
                        <li className="d-flex align-items-center mt-15">
                          <Image
                            src={featureIcon_1}
                            alt=""
                            className="lazy-img icon w-[24px] mx-2"
                          />
                          <div>
                            <span className="fs-16 text-center">
                              {property.sqt} <br /> {t(`sqft`)}
                            </span>
                          </div>
                        </li>
                        <li>
                          <svg
                            width="11"
                            height="38"
                            viewBox="0 0 11 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.84644 0.5L0.653403 37.3712"
                              stroke="black"
                            />
                          </svg>
                        </li>
                        <li className="d-flex align-items-center mt-15">
                          <Image
                            src={featureIcon_2}
                            alt=""
                            className="lazy-img icon w-[30px] mx-2"
                          />
                          <div>
                            <span className="fs-16 text-center">
                              {property.bedroom} <br /> {t(`bed`)}
                            </span>
                          </div>
                        </li>
                        <li>
                          <svg
                            width="11"
                            height="38"
                            viewBox="0 0 11 38"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9.84644 0.5L0.653403 37.3712"
                              stroke="black"
                            />
                          </svg>
                        </li>
                        <li className="d-flex align-items-center mt-15">
                          <Image
                            src={featureIcon_3}
                            alt=""
                            className="lazy-img icon w-[24px] mx-2"
                          />
                          <div>
                            <span className="fs-16 text-center">
                              {property.bathroom} <br /> {t(`bath`)}
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="pl-footer d-flex align-items-center justify-content-between">
                      <strong className="price fw-500 color-dark sm w-auto m0">
                        ${property.price}
                      </strong>
                      <div className="flex items-center justify-center gap-[10px]">
                        <a
                          href={`https://wa.me/${property.user.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            width="48"
                            height="49"
                            viewBox="0 0 48 49"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              y="0.5"
                              width="48"
                              height="48"
                              rx="24"
                              fill="#00B266"
                            />
                            <path
                              d="M9.44189 38.4627L11.4998 30.99C10.2275 28.7966 9.56008 26.3126 9.56704 23.7732C9.56704 15.8161 16.0743 9.34668 24.0625 9.34668C27.9418 9.34668 31.5848 10.8481 34.3171 13.5743C37.0562 16.3005 38.5649 19.9262 38.5579 23.7802C38.5579 31.7373 32.0506 38.2067 24.0555 38.2067H24.0486C21.6222 38.2067 19.2376 37.5978 17.1172 36.4493L9.44189 38.4627ZM17.4857 33.8407L17.9236 34.1036C19.7729 35.1969 21.8934 35.7712 24.0555 35.7781H24.0625C30.7019 35.7781 36.1107 30.4019 36.1107 23.7871C36.1107 20.5835 34.8593 17.5736 32.5859 15.3041C30.3126 13.0346 27.2814 11.7892 24.0625 11.7892C17.4231 11.7822 12.0142 17.1585 12.0142 23.7732C12.0142 26.0358 12.6469 28.2431 13.8566 30.1528L14.1416 30.6094L12.925 35.0308L17.4857 33.8407Z"
                              fill="white"
                            />
                            <path
                              d="M9.94946 37.9574L11.9378 30.7407C10.7073 28.6303 10.0607 26.2294 10.0607 23.78C10.0677 16.0996 16.3455 9.85156 24.0625 9.85156C27.8098 9.85156 31.3207 11.3046 33.9625 13.9339C36.6044 16.5632 38.0574 20.0643 38.0574 23.7869C38.0574 31.4672 31.7726 37.7153 24.0625 37.7153H24.0556C21.7127 37.7153 19.4115 37.1271 17.3675 36.02L9.94946 37.9574Z"
                              fill="#00B266"
                            />
                            <path
                              d="M9.44189 38.4627L11.4998 30.99C10.2275 28.7966 9.56008 26.3126 9.56704 23.7732C9.56704 15.8161 16.0743 9.34668 24.0625 9.34668C27.9418 9.34668 31.5848 10.8481 34.3171 13.5743C37.0562 16.3005 38.5649 19.9262 38.5579 23.7802C38.5579 31.7373 32.0506 38.2067 24.0555 38.2067H24.0486C21.6222 38.2067 19.2376 37.5978 17.1172 36.4493L9.44189 38.4627ZM17.4857 33.8407L17.9236 34.1036C19.7729 35.1969 21.8934 35.7712 24.0555 35.7781H24.0625C30.7019 35.7781 36.1107 30.4019 36.1107 23.7871C36.1107 20.5835 34.8593 17.5736 32.5859 15.3041C30.3126 13.0346 27.2814 11.7892 24.0625 11.7892C17.4231 11.7822 12.0142 17.1585 12.0142 23.7732C12.0142 26.0358 12.6469 28.2431 13.8566 30.1528L14.1416 30.6094L12.925 35.0308L17.4857 33.8407Z"
                              fill="url(#paint0_linear_1146_3343)"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M20.4403 17.7395C20.1691 17.1375 19.8841 17.1237 19.6268 17.1168C19.4183 17.1099 19.175 17.1099 18.9316 17.1099C18.6883 17.1099 18.299 17.1998 17.9653 17.5596C17.6316 17.9194 16.7 18.7912 16.7 20.5695C16.7 22.3408 18 24.0568 18.1808 24.2989C18.3615 24.5411 20.6905 28.2982 24.3683 29.7444C27.4273 30.9483 28.053 30.7061 28.7134 30.6439C29.3739 30.5816 30.8547 29.772 31.1606 28.9279C31.4596 28.0837 31.4596 27.3641 31.3692 27.2119C31.2788 27.0597 31.0355 26.9697 30.674 26.7898C30.3125 26.61 28.5327 25.7381 28.199 25.6136C27.8653 25.496 27.6219 25.4337 27.3856 25.7935C27.1422 26.1533 26.447 26.9628 26.2384 27.205C26.0299 27.4472 25.8144 27.4749 25.4528 27.295C25.0913 27.1151 23.9233 26.7345 22.5398 25.5029C21.4622 24.548 20.7323 23.3648 20.5237 23.005C20.3151 22.6452 20.5028 22.4515 20.6836 22.2716C20.8435 22.1125 21.0451 21.8495 21.2259 21.642C21.4066 21.4344 21.4692 21.2822 21.5874 21.04C21.7056 20.7978 21.65 20.5902 21.5596 20.4103C21.4692 20.2373 20.7601 18.4522 20.4403 17.7395Z"
                              fill="white"
                            />
                            <defs>
                              <linearGradient
                                id="paint0_linear_1146_3343"
                                x1="24.0028"
                                y1="38.46"
                                x2="24.0028"
                                y2="9.34668"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop stopColor="#F9F9F9" />
                                <stop offset="1" stopColor="white" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </a>
                        <a href={`tel:${property.user.phone}`}>
                          <svg
                            width="48"
                            height="49"
                            viewBox="0 0 48 49"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              y="0.5"
                              width="48"
                              height="48"
                              rx="24"
                              fill="#FF6625"
                            />
                            <path
                              d="M34.6 36.5C31.8222 36.5 29.0778 35.8947 26.3667 34.684C23.6556 33.4733 21.1889 31.7564 18.9667 29.5333C16.7444 27.3102 15.028 24.8436 13.8173 22.1333C12.6067 19.4231 12.0009 16.6787 12 13.9C12 13.5 12.1333 13.1667 12.4 12.9C12.6667 12.6333 13 12.5 13.4 12.5H18.8C19.1111 12.5 19.3889 12.6058 19.6333 12.8173C19.8778 13.0289 20.0222 13.2787 20.0667 13.5667L20.9333 18.2333C20.9778 18.5889 20.9667 18.8889 20.9 19.1333C20.8333 19.3778 20.7111 19.5889 20.5333 19.7667L17.3 23.0333C17.7444 23.8556 18.272 24.6498 18.8827 25.416C19.4933 26.1822 20.1658 26.9213 20.9 27.6333C21.5889 28.3222 22.3111 28.9613 23.0667 29.5507C23.8222 30.14 24.6222 30.6787 25.4667 31.1667L28.6 28.0333C28.8 27.8333 29.0613 27.6836 29.384 27.584C29.7067 27.4844 30.0231 27.4564 30.3333 27.5L34.9333 28.4333C35.2444 28.5222 35.5 28.6836 35.7 28.9173C35.9 29.1511 36 29.412 36 29.7V35.1C36 35.5 35.8667 35.8333 35.6 36.1C35.3333 36.3667 35 36.5 34.6 36.5Z"
                              fill="white"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="pt-5">
              <ReactPaginate
                breakLabel="..."
                nextLabel={<i className="fa-regular fa-chevron-right"></i>}
                onPageChange={handlePageClick}
                pageRangeDisplayed={3}
                pageCount={pageCount}
                previousLabel={<i className="fa-regular fa-chevron-left"></i>}
                renderOnZeroPageCount={null}
                className="pagination-two d-inline-flex align-items-center justify-content-center style-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingFifteenArea;
