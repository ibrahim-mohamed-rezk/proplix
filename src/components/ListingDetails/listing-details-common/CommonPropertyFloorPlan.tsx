import Image from "next/image";

import { useTranslations } from "next-intl";
import { PropertyTypes } from "@/libs/types/types";

const CommonPropertyFloorPlan = ({
  style,
  property,
}: {
  style?: boolean;
  property?: PropertyTypes;
}) => {
  const t = useTranslations("endUser");
  return (
    <div
      className={`property-floor-plan ${
        style ? "bottom-line-dark pb-40 mb-60" : "mb-50"
      }`}
    >
      <h4 className="mb-40">{t("Floor Plans")}</h4>
      <div className={` p-30 ${style ? "bg-dot" : "bg-white shadow4  "}`}>
        <div id="floor-plan" className="carousel slide">
          <div className="carousel-indicators navpos !end-[0px]">
            {property?.property_floor_plans?.map((floorPlan, index) => (
              <button
                key={floorPlan.id}
                type="button"
                data-bs-target="#floor-plan"
                data-bs-slide-to= {index}
                className="active"
                aria-current="true"
                aria-label={`Slide ${index + 1}`}
              ></button>
            ))}
          </div>
          <div className="carousel-inner">
            {property?.property_floor_plans?.map((floorPlan) => (
              <div key={floorPlan.id} className="carousel-item active">
                <img src={floorPlan.image} alt="floorPlan" className="w-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonPropertyFloorPlan;
