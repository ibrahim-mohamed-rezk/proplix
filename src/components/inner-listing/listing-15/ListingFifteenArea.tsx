"use client"
import DropdownSeven from "@/components/search-dropdown/inner-dropdown/DropdownSeven"
import UseShortedProperty from "@/hooks/useShortedProperty";
import NiceSelect from "@/ui/NiceSelect";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

import featureIcon_1 from "@/assets/images/icon/icon_04.svg";
import featureIcon_2 from "@/assets/images/icon/icon_05.svg";
import featureIcon_3 from "@/assets/images/icon/icon_06.svg";
import Fancybox from "@/components/common/Fancybox";
import { getData } from "@/libs/server/backendServer";
import { Link } from "@/i18n/routing";

const select_type: string[] = [
  "All",
  "Apartments",
  "Villa",
  "Mortgage",
  "Loft",
  "Home",
  "Flat",
  "Building",
  "Office",
  "Factory",
  "Industry",
];

const ListingFifteenArea = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [locale, setLocale] = useState("en");

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

  const itemsPerPage = 3;
  const page = "listing_3";

  const {
    itemOffset,
    sortedProperties,
    currentItems,
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
    handleLocationChange,
    handleStatusChange,
    handleTypeChange,
    handlePriceDropChange,
  } = UseShortedProperty({ itemsPerPage, page });

  const handleResetFilter = () => {
    resetFilters();
  };

  const [selectedType, setSelectedType] = useState("All");

  const handleTypeClick = (type: string) => {
    setSelectedType(type);
  };

  return (
    <div className="property-listing-eight pt-150 xl-pt-120">
      <div className="search-wrapper-three layout-two position-relative">
        <div className="bg-wrapper rounded-0 border-0">
          <DropdownSeven
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

      <div className="listing-type-filter border-0">
        <div className="wrapper">
          <ul className="style-none d-flex flex-wrap align-items-center justify-content-center justify-content-xxl-between">
            <li>Select Type:</li>
            {select_type.map((select, i) => (
              <li key={i}>
                <Link
                  href="#"
                  className={selectedType === select ? "active" : ""}
                  onClick={() => handleTypeClick(select)}
                >
                  {select}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="row gx-0">
        <div className="col-xxl-6 col-lg-5">
          <div id="google-map-area" className="h-100">
            <div className="google-map-home" id="contact-google-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d83088.3595592641!2d-105.54557276330914!3d39.29302101722867!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x874014749b1856b7%3A0xc75483314990a7ff!2sColorado%2C%20USA!5e0!3m2!1sen!2sbd!4v1699764452737!5m2!1sen!2sbd"
                width="600"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-100 h-100"
              ></iframe>
            </div>
          </div>
        </div>
        <div className="col-xxl-6 col-lg-7">
          <div className="bg-light pl-40 pr-40 pt-35 pb-60">
            <div className="listing-header-filter d-sm-flex justify-content-between align-items-center mb-40 lg-mb-30">
              <div>
                Showing{" "}
                <span className="color-dark fw-500">
                  {itemOffset + 1}–{itemOffset + currentItems.length}
                </span>{" "}
                of{" "}
                <span className="color-dark fw-500">
                  {sortedProperties.length}
                </span>{" "}
                results
              </div>
              <div className="d-flex align-items-center xs-mt-20">
                <div className="short-filter d-flex align-items-center">
                  <div className="fs-16 me-2">Short by:</div>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "newest", text: "Newest" },
                      { value: "best_seller", text: "Best Seller" },
                      { value: "best_match", text: "Best Match" },
                      { value: "price_low", text: "Price Low" },
                      { value: "price_high", text: "Price High" },
                    ]}
                    defaultCurrent={0}
                    onChange={handleTypeChange}
                    name=""
                    placeholder=""
                  />
                </div>
                <Link
                  href="/listing_15"
                  className="tran3s layout-change rounded-circle ms-auto ms-sm-3"
                  data-bs-toggle="tooltip"
                  title="Switch To List View"
                >
                  <i className="fa-regular fa-bars"></i>
                </Link>
              </div>
            </div>

            {/* Render properties from API response */}
            {properties.map((property: any) => (
              <div
                key={property.id}
                className="listing-card-seven   p-20 mb-35 wow fadeInUp"
              >
                <div className="d-flex flex-wrap layout-one">
                  <div
                    className={
                      "img-gallery position-relative z-1   overflow-hidden"
                    }
                  >
                    <Link href="#" className="fav-btn tran3s">
                      <i className="fa-light fa-heart"></i>
                    </Link>
                    <div className="img-slider-btn">
                      {property.property_listing_images &&
                        property.property_listing_images.length > 0 && (
                          <Image
                            src={property.property_listing_images[0].image}
                            alt={property.title}
                            width={200}
                            height={150}
                            className="lazy-img"
                          />
                        )}
                    </div>
                  </div>
                  <div className="property-info">
                    <div className={`tag   fw-500`}>{property.status}</div>
                    <div className="address fs-16 mt-20">
                      <i className="bi bi-geo-alt"></i>
                      {property.area?.name}
                    </div>
                    <div className="feature2 fs-16 color-dark mt-20 mb-30 pb-5">
                      <ul className="style-none d-flex flex-wrap align-items-center justify-content-between">
                        <li className="d-flex align-items-center mt-15">
                          <span className="fs-16">{property.sqt} sqft</span>
                        </li>
                        <li className="d-flex align-items-center mt-15">
                          <span className="fs-16">{property.bedroom} bed</span>
                        </li>
                        <li className="d-flex align-items-center mt-15">
                          <span className="fs-16">
                            {property.bathroom} bath
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="pl-footer d-flex align-items-center justify-content-between">
                      <strong className="price fw-500 color-dark sm w-auto m0">
                        ${property.price}
                      </strong>
                      <Link
                        href={`/properties/${property.slug}`}
                        className="btn-four rounded-circle"
                      >
                        <i className="bi bi-arrow-up-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Old rendering using currentItems, commented out for now */}
            {/**
             {currentItems.map((item: any) => (
               <div
                 key={item.id}
                 className="listing-card-seven   p-20 mb-35 wow fadeInUp"
               >
                 ...
             ))}
             */}

            <div className="pt-5">
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
      </div>
    </div>
  );
};

export default ListingFifteenArea;
