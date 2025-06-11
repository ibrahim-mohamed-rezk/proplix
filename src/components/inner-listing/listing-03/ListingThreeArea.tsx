"use client";
import DropdownTwo from "@/components/search-dropdown/inner-dropdown/DropdownTwo";
import UseShortedProperty from "@/hooks/useShortedProperty";
import NiceSelect from "@/ui/NiceSelect";
import ReactPaginate from "react-paginate";

import featureIcon_1 from "@/assets/images/icon/icon_04.svg";
import featureIcon_2 from "@/assets/images/icon/icon_05.svg";
import featureIcon_3 from "@/assets/images/icon/icon_06.svg";
import { PropertyTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import { useEffect, useState } from "react";

const ListingThreeArea = ({ style }: { style: boolean }) => {
  const t = useTranslations("properties");
  const itemsPerPage = 9;
  const page = "listing_4";
  const locale = useLocale();
  const [agents, setAgents] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const {
    itemOffset,
    // currentItems,
    pageCount,
    handlePageClick,
    handleBathroomChange,
    handleBedroomChange,
    handleSearchChange,
    handlePriceChange,
    maxPrice,
    priceValue,
    resetFilters,
    selectedAmenities,
    handleAmenityChange,
    // handleLocationChange,
    // handleStatusChange,
    handleTypeChange,
    handlePriceDropChange,
  } = UseShortedProperty({ itemsPerPage, page });

  const handleResetFilter = () => {
    resetFilters();
  };

  // fetch properties form api
  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      try {
        const response = await getData(
          "properties",
          {
            ...filters,
          },
          { lang: locale }
        );
        setProperties(response.data.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [locale, filters]);

  // fetch agents form api
  useEffect(() => {
    const fetchAgents = async () => {
      const response = await getData("agents", {}, { lang: locale });
      setAgents(response.data.data);
    };
    fetchAgents();
  }, []);

  // handle status change
  const handleStatusChange = (e: { target: { value: string } }) => {
    if (e.target.value === "all") {
      setFilters({ ...filters, status: null });
    } else {
      setFilters({ ...filters, status: e.target.value });
    }
  };

  // handle location change
  const handleLocationChange = (e: { target: { value: string } }) => {
    if (e.target.value === "all") {
      setFilters({ ...filters, area_id: null });
    } else {
      setFilters({ ...filters, area_id: e.target.value });
    }
  };

  return (
    <div
      className={`property-listing-six pb-170 xl-pb-120 ${
        style
          ? "pt-150 xl-pt-100"
          : "pt-110 md-pt-80 mt-150 xl-mt-120 bg-pink-two"
      }`}
    >
      <div className="container">
        {!style && (
          <div className="search-wrapper-one layout-one bg position-relative mb-75 md-mb-50">
            <div className="bg-wrapper border-layout">
              <DropdownTwo
                handlePriceDropChange={handlePriceDropChange}
                handleSearchChange={handleSearchChange}
                handleBedroomChange={handleBedroomChange}
                handleBathroomChange={handleBathroomChange}
                handlePriceChange={handlePriceChange}
                maxPrice={maxPrice}
                priceValue={priceValue}
                handleResetFilter={handleResetFilter}
                selectedAmenities={selectedAmenities}
                handleAmenityChange={handleAmenityChange}
                handleLocationChange={handleLocationChange}
                handleStatusChange={handleStatusChange}
              />
            </div>
          </div>
        )}

        <div className="listing-header-filter d-sm-flex justify-content-between align-items-center mb-40 lg-mb-30">
          <div>
            {t("showing")}{" "}
            <span className="color-dark fw-500">
              {itemOffset + 1}–{itemOffset + properties?.length}
            </span>{" "}
            {t("of")}{" "}
            <span className="color-dark fw-500">{properties?.length}</span>{" "}
            {t("results")}
          </div>
          <div className="d-flex align-items-center xs-mt-20">
            <div className="short-filter d-flex align-items-center">
              <div className="fs-16 mx-2">{t("sort_by")}:</div>
              <NiceSelect
                className="nice-select"
                options={[
                  { value: "newest", text: t("newest") },
                  { value: "best_seller", text: t("best_seller") },
                  { value: "best_match", text: t("best_match") },
                  { value: "price_low", text: t("price_low") },
                  { value: "price_high", text: t("price_high") },
                ]}
                defaultCurrent={0}
                onChange={handleTypeChange}
                name=""
                placeholder=""
              />
            </div>
            <Link
              href={`/${style ? "listing_12" : "listing_04"}`}
              className="tran3s layout-change rounded-[100%] ms-auto ms-sm-3"
              data-bs-toggle="tooltip"
              title={t("switch_to_list_view")}
            >
              <i className="fa-regular fa-bars"></i>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : properties?.length === 0 ? (
          <div className="text-center py-5">
            <h4 className="mb-3">{t("no_properties_found")}</h4>
            <p className="text-muted">{t("try_different_filters")}</p>
          </div>
        ) : (
          <div className="row gx-xxl-5">
            {properties?.map((item: PropertyTypes) => (
              <div
                key={item.id}
                className="col-lg-4 col-md-6 d-flex mb-50 wow fadeInUp"
                data-wow-delay={item.data_delay_time}
              >
                <div
                  className={`listing-card-one  h-100 w-100 ${
                    style ? "border-layout" : ""
                  }`}
                >
                  <div className="img-gallery p-15">
                    <div className="position-relative  overflow-hidden">
                      <div
                        className={`tag px-2 ${
                          item.status === "rent"
                            ? "!bg-[#FF6B2C]"
                            : item.status === "sale"
                            ? "!bg-[#00B579]"
                            : "!bg-[#f9fcfb0]"
                        } rounded-[25px] w-fit`}
                      >
                        {item.status}
                      </div>
                      <Link href="#" className="fav-btn tran3s">
                        <i className="fa-light fa-heart"></i>
                      </Link>
                      {/* <div
                        id={`carousel${item.carousel}`}
                        className="carousel slide"
                      >
                        <div className="carousel-indicators">
                          <button
                            type="button"
                            data-bs-target={`#carousel${item.carousel}`}
                            data-bs-slide-to="0"
                            className="active"
                            aria-current="true"
                            aria-label="Slide 1"
                          ></button>
                          <button
                            type="button"
                            data-bs-target={`#carousel${item.carousel}`}
                            data-bs-slide-to="1"
                            aria-label="Slide 2"
                          ></button>
                          <button
                            type="button"
                            data-bs-target={`#carousel${item.carousel}`}
                            data-bs-slide-to="2"
                            aria-label="Slide 3"
                          ></button>
                        </div>
                        <div className="carousel-inner">
                          {item.carousel_thumb?.map((item: any, i: any) => (
                             <div
                               key={i}
                               className={`carousel-item ${item.active}`}
                               data-bs-interval="1000000"
                             >
                               <Link
                                 href="/listing_details_01"
                                 className="d-block"
                               >
                                 <img
                                   src={item.img}
                                   className="w-100"
                                   alt="..."
                                 />
                               </Link>
                             </div>
                           ))}
                          
                        </div>
                      </div> */}
                      <div
                      //  className={`carousel-item ${item.active}`}
                      //  data-bs-interval="1000000"
                      >
                        <Link
                          href={`/properties/${item.slug}`}
                          className="d-block"
                        >
                          <img
                            src={item.cover}
                            className="w-100 w-full h-full"
                            alt={item.title}
                            width={500}
                            height={500}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="property-info p-25">
                    <Link href="/listing_details_03" className="title tran3s">
                      {item.title}
                    </Link>
                    <div className="address">{item?.area?.name}</div>
                    <ul className="style-none feature d-flex flex-wrap align-items-center justify-content-between">
                      <li className="d-flex align-items-center">
                        <img
                          src={featureIcon_1}
                          alt=""
                          className="lazy-img icon mx-2"
                        />
                        <span className="fs-16">{`${item?.sqt} ${t(
                          "sqft"
                        )}`}</span>
                      </li>
                      <li className="d-flex align-items-center">
                        <img
                          src={featureIcon_2}
                          alt=""
                          className="lazy-img icon mx-2"
                        />
                        <span className="fs-16">{`${item?.bedroom} ${t(
                          "bedrooms"
                        )}`}</span>
                      </li>
                      <li className="d-flex align-items-center">
                        <img
                          src={featureIcon_3}
                          alt=""
                          className="lazy-img icon mx-2"
                        />
                        <span className="fs-16">{`${item?.bathroom} ${t(
                          "bathrooms"
                        )}`}</span>
                      </li>
                    </ul>
                    <div className="pl-footer top-border d-flex align-items-center justify-content-between">
                      <strong className="price fw-500 color-dark">
                        $
                        {item.price?.toLocaleString(undefined, {
                          minimumFractionDigits: item.price ? 0 : 2,
                          maximumFractionDigits: 2,
                        })}
                        {/* {item.price && (
                           <>
                             /<sub>m</sub>
                           </>
                         )} */}
                      </strong>
                      <Link
                        href={`properties/${item.slug}`}
                        className="btn-four rounded-[100%]"
                      >
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-50 md-pt-20 text-center">
          <ReactPaginate
            breakLabel="..."
            nextLabel={<i className="fa-regular fa-chevron-right"></i>}
            onPageChange={handlePageClick}
            pageRangeDisplayed={pageCount}
            pageCount={pageCount}
            previousLabel={<i className="fa-regular fa-chevron-left"></i>}
            renderOnZeroPageCount={null}
            className="pagination-two d-inline-flex align-items-center justify-content-center style-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ListingThreeArea;
