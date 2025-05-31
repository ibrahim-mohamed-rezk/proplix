"use client";

import Image from "next/image";

import titleShape from "@/assets/images/shape/title_shape_03.svg";
import { useTranslations } from "next-intl";
import { PropertyTypes } from "@/libs/types/types";
import { Link } from "@/i18n/routing";

// Default placeholder images for property carousel
const defaultImages = [
  "/assets/images/property/property-placeholder-1.jpg",
  "/assets/images/property/property-placeholder-2.jpg",
  "/assets/images/property/property-placeholder-3.jpg",
];

const Property = ({
  listings,
  loading,
}: {
  listings: PropertyTypes[];
  loading: boolean;
}) => {
  const t = useTranslations("Feature4");

  // Function to determine tag background class based on property status
  const getTagBgClass = (status: string): string => {
    switch (status) {
      case "sale":
        return "bg-one";
      case "rent":
        return "bg-two";
      case "sold":
        return "bg-three";
      default:
        return "bg-one";
    }
  };

  // Function to format status text for display
  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="property-listing-one bg-pink-two mt-150 xl-mt-120 pt-140 xl-pt-120 lg-pt-80 pb-180 xl-pb-120 lg-pb-100">
      <div className="container">
        <div className="position-relative">
          <div className="title-one text-center text-lg-start mb-45 xl-mb-30 lg-mb-20 wow fadeInUp">
            <h3>
              {t("title")}{" "}
              <span>
                {t("title_span")}{" "}
                <Image src={titleShape} alt="" className="lazy-img" />
              </span>
            </h3>
            <p className="fs-22 mt-xs">{t("description")}</p>
          </div>

          {loading ? (
            <div className="text-center p-5">{t("loading")}</div>
          ) : (
            <div className="row gx-xxl-5">
              {listings.length > 0 ? (
                listings.map((item, index) => (
                  <div
                    key={item.id}
                    className="col-lg-4 col-md-6 d-flex mt-40 wow fadeInUp"
                    data-wow-delay={`0.${index + 1}s`}
                  >
                    <div className="listing-card-one border-25 h-100 w-100">
                      <div className="img-gallery p-15">
                        <div className="position-relative border-25 overflow-hidden">
                          <div
                            className={`tag border-25 ${getTagBgClass(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </div>
                          <div
                            id={`carousel${item.id}`}
                            className="carousel slide"
                          >
                            <div className="carousel-indicators">
                              <button
                                type="button"
                                data-bs-target={`#carousel${item.id}`}
                                data-bs-slide-to="0"
                                className="active"
                                aria-current="true"
                                aria-label="Slide 1"
                              ></button>
                              <button
                                type="button"
                                data-bs-target={`#carousel${item.id}`}
                                data-bs-slide-to="1"
                                aria-label="Slide 2"
                              ></button>
                              <button
                                type="button"
                                data-bs-target={`#carousel${item.id}`}
                                data-bs-slide-to="2"
                                aria-label="Slide 3"
                              ></button>
                            </div>
                            <div className="carousel-inner">
                              {/* If image is available from API use it, otherwise use placeholder images */}
                              {item.image &&
                              item.image !==
                                "https://darkgrey-chough-759221.hostingersite.com/" ? (
                                <div
                                  className="carousel-item active"
                                  data-bs-interval="1000000"
                                >
                                  <Link
                                    href={`/properties/${item.slug}`}
                                    className="d-block"
                                  >
                                    <Image
                                      src={item.image}
                                      width={400}
                                      height={300}
                                      className="w-100"
                                      alt={item.title}
                                      unoptimized
                                    />
                                  </Link>
                                </div>
                              ) : (
                                // Use default placeholder images if no valid image is provided
                                defaultImages.map((img, i) => (
                                  <div
                                    key={i}
                                    className={`carousel-item ${
                                      i === 0 ? "active" : ""
                                    }`}
                                    data-bs-interval="1000000"
                                  >
                                    <Link
                                      href={`/properties/${item.slug}`}
                                      className="d-block"
                                    >
                                      <Image
                                        src={img}
                                        width={400}
                                        height={300}
                                        className="w-100"
                                        alt={item.title}
                                      />
                                    </Link>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="property-info p-25">
                        <Link
                          href={`/properties/${item.slug}`}
                          className="title tran3s"
                        >
                          {item.title}
                        </Link>
                        <div className="address">{item?.area?.name}</div>
                        <ul className="style-none feature d-flex flex-wrap align-items-center justify-content-between">
                          <li className="d-flex align-items-center">
                            <Image
                              src="/assets/images/icon/bed.svg"
                              width={20}
                              height={20}
                              alt="Bed"
                              className="lazy-img icon me-2"
                            />
                            <span className="fs-16">{item.bedroom} Beds</span>
                          </li>
                          <li className="d-flex align-items-center">
                            <Image
                              src="/assets/images/icon/bath.svg"
                              width={20}
                              height={20}
                              alt="Bath"
                              className="lazy-img icon me-2"
                            />
                            <span className="fs-16">{item.bathroom} Baths</span>
                          </li>
                          <li className="d-flex align-items-center">
                            <Image
                              src="/assets/images/icon/kitchen.svg"
                              width={20}
                              height={20}
                              alt="Kitchen"
                              className="lazy-img icon me-2"
                            />
                            <span className="fs-16">
                              {item.kitichen} Kitchen
                            </span>
                          </li>
                        </ul>
                        <div className="pl-footer top-border d-flex align-items-center justify-content-between">
                          <strong className="price fw-500 color-dark">
                            $
                            {item.price.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                          <Link
                            href={`/properties/${item.slug}`}
                            className="btn-four rounded-circle"
                          >
                            <i className="bi bi-arrow-up-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center p-5">
                  {t("no_properties_available")}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Property;
