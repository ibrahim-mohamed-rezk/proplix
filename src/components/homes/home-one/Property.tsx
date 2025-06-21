"use client";

import Image from "next/image";

import titleShape from "@/assets/images/shape/title_shape_03.svg";
import { useTranslations } from "next-intl";
import { PropertyTypes } from "@/libs/types/types";
import { Link } from "@/i18n/routing";
import PropertiesCard from "@/components/cards/PropertiesCard";

// Default placeholder images for property carousel
const defaultImages = [
  "/assets/images/property/property-placeholder-1.jpg",
  "/assets/images/property/property-placeholder-2.jpg",
  "/assets/images/property/property-placeholder-3.jpg",
];

const Property = ({
  listings,
  loading,
  token,
}: {
  listings: PropertyTypes[];
    loading: boolean;
    token: string | undefined;
}) => {
  const t = useTranslations("endUser");

  // Function to determine tag background class based on property status
  // const getTagBgClass = (status: string): string => {
  //   switch (status) {
  //     case "sale":
  //       return "bg-one";
  //     case "rent":
  //       return "bg-two";
  //     case "sold":
  //       return "bg-three";
  //     default:
  //       return "bg-one";
  //   }
  // };

  // // Function to format status text for display
  // const formatStatus = (status: string): string => {
  //   return status.charAt(0).toUpperCase() + status.slice(1);
  // };

  return (
    <div className="property-listing-one bg-pink-two mt-150 xl-mt-120 pt-140 xl-pt-120 lg-pt-80 pb-180 xl-pb-120 lg-pb-100">
      <div className="container">
        <div className="position-relative">
          <div className="title-one text-center text-lg-start mb-45 xl-mb-30 lg-mb-20 wow fadeInUp">
            <h3>
              {t("New Listings")}{" "}
              <span>
                <Image src={titleShape} alt="" className="lazy-img" />
              </span>
            </h3>
            <p className="fs-22 mt-xs">
              {t("Explore latest & featured properties for sale")}
            </p>
          </div>

          {loading ? (
            <div className="text-center p-5">{t("loading")}</div>
          ) : (
            <div className="row gx-xxl-5">
              {listings.length > 0 ? (
                listings.map((item, index) => (
                  <PropertiesCard
                    token={token as string}
                    key={index}
                    item={item}
                  />
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
