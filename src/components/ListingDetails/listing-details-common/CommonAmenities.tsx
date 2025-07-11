import { PropertyTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";

const CommonAmenities = ({ property }: { property?: PropertyTypes }) => {
  const t = useTranslations("endUser");
  return (
    <>
      <h4 className="mb-20">{t("amenities")}</h4>
      <p className="fs-20 lh-lg pb-25">{t("property_features_description")}</p>
      <ul className="style-none d-flex flex-wrap justify-content-between list-style-two">
        {property?.amenities?.map((list) => (
          <li key={list.id}>{list.title}</li>
        ))}
      </ul>
    </>
  );
};

export default CommonAmenities;
