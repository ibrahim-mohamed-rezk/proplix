"use client";
// import NiceSelect from "@/ui/NiceSelect";
import MediaGallery from "./MediaGallery";
// import Review from "@/components/inner-pages/agency/agency-details/Review";
import Sidebar from "./Sidebar";
// import CommonBanner from "../listing-details-common/CommonBanner";
import CommonPropertyOverview from "../listing-details-common/CommonPropertyOverview";
import CommonPropertyFeatureList from "../listing-details-common/CommonPropertyFeatureList";
import CommonAmenities from "../listing-details-common/CommonAmenities";
import CommonPropertyVideoTour from "../listing-details-common/CommonPropertyVideoTour";
import CommonPropertyFloorPlan from "../listing-details-common/CommonPropertyFloorPlan";
// import CommonNearbyList from "../listing-details-common/CommonNearbyList";
import CommonSimilarProperty from "../listing-details-common/CommonSimilarProperty";
// import CommonProPertyScore from "../listing-details-common/CommonProPertyScore";
import CommonLocation from "../listing-details-common/CommonLocation";
// import CommonReviewForm from "../listing-details-common/CommonReviewForm";
import { PropertyTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";
import CommonBanner from "../listing-details-common/CommonBanner";
import { useState } from "react";

const ListingDetailsOneArea = ({
  property,
  similar,
  token,
}: {
  property: PropertyTypes;
  similar: PropertyTypes[];
  token: string;
}) => {
  const t = useTranslations("endUser");
  const [featuresContent, setFeaturesContent] = useState(true);

  return (
    <div className="listing-details-one theme-details-one bg-pink pt-180 lg-pt-150 pb-150 xl-pb-120">
      <div className="container">
        <CommonBanner property={property} />
        <MediaGallery property={property} />
        <div className="property-feature-list bg-white shadow4 p-40 mt-50 mb-60">
          <h4 className="sub-title-one mb-40 lg-mb-20">
            {t("Property Overview")}
          </h4>
          <CommonPropertyOverview property={property} />
        </div>
        <div className="row">
          <div className="col-xl-8">
            <div className="property-overview mb-50 bg-white shadow4 p-40">
              <h4 className="mb-20">{t("overview")}</h4>
              <p
                className="fs-20 lh-lg"
                dangerouslySetInnerHTML={{ __html: property?.description }}
              />
            </div>
            {featuresContent && <div className="property-feature-accordion bg-white shadow4 p-40 mb-50">
              <h4 className="mb-20">{t("Property Features")}</h4>
              <p className="fs-20 lh-lg">
                {t("property_features_description")}
              </p>
              {<div className="accordion-style-two mt-45">
                <CommonPropertyFeatureList setFeaturesContent={setFeaturesContent} property={property} />
              </div>}
            </div>}
            {property?.amenities?.length > 0 && (
              <div className="property-amenities bg-white shadow4 p-40 mb-50">
                <CommonAmenities property={property} />
              </div>
            )}
            {/* <div className="property-video-tour mb-50">
              <CommonPropertyVideoTour />
            </div> */}
            {property?.property_floor_plans?.length > 0 && (
              <CommonPropertyFloorPlan property={property} style={false} />
            )}
            {/* <div className="property-nearby bg-white shadow4 p-40 mb-50">
              <CommonNearbyList />
            </div> */}
            {/* <div className="property-score bg-white shadow4 p-40 mb-50">
              <CommonProPertyScore />
            </div> */}
            <div className="property-location mb-50">
              <CommonLocation property={property} />
            </div>
            {similar?.length > 0 && <CommonSimilarProperty token={token} similar={similar} />}

            {/* <div className="review-panel-one bg-white shadow4 p-40 mb-50">
              <div className="position-relative z-1">
                <div className="d-sm-flex justify-content-between align-items-center mb-10">
                  <h4 className="m0 xs-pb-30">{t("reviews")}</h4>
                  <NiceSelect
                    className="nice-select"
                    options={[
                      { value: "01", text: "Newest" },
                      { value: "02", text: "Best Seller" },
                      { value: "03", text: "Best Match" },
                    ]}
                    defaultCurrent={0}
                    onChange={selectHandler}
                    name=""
                    placeholder=""
                  />
                </div>
                <Review style={true} />
              </div>
            </div> */}
            {/* <div className="review-form bg-white shadow4 p-40">
              <CommonReviewForm />
            </div> */}
          </div>
          <Sidebar property={property} />
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsOneArea;
