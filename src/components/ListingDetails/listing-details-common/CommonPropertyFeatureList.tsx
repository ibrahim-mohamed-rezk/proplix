import { DataType, PropertyTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";

const CommonPropertyFeatureList = ({
  property,
  setFeaturesContent,
}: {
  property?: PropertyTypes;
  setFeaturesContent?: any;
}) => {
  const t = useTranslations("endUser");
  const locale = useLocale();

  const property_feature_list: DataType[] = [];

  const featureTypes = [
    { id: 1, type: "property_feature", title: t("property_feature") },
    { id: 2, type: "utility_detail", title: t("utility_detail") },
    { id: 3, type: "outdoor_feature", title: t("outdoor_feature") },
    { id: 4, type: "indoor_feature", title: t("indoor_feature") },
  ];

  featureTypes.forEach(({ id, type, title }) => {
    const feature_list =
      property?.features
        ?.filter((feature) => feature.type === type)
        .map((feature) => ({
          title: feature.key,
          count: feature.value,
        })) || [];

    if (feature_list.length > 0) {
      property_feature_list.push({
        id,
        title,
        feature_list,
      });
    }
  });

  // If there are no features, show a message
  if (property_feature_list.length === 0) {
    setFeaturesContent(false)
    return (
      <div className="accordion" id="accordionTwo">
        <div className="text-center py-4 text-muted">
          {t("no_features_found") || "No features found for this property."}
        </div>
      </div>
    );
  }

  return (
    <div className="accordion" id="accordionTwo">
      {property_feature_list.map((item) => (
        <div key={item.id} className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button ${
                locale === "ar"
                  ? "after:mr-auto noMl"
                  : "after:ml-auto after:mr-[0px]"
              } ${item.id === 1 ? "" : "collapsed"}`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse${item.id}`}
              aria-expanded="false"
              aria-controls={`collapse${item.id}`}
            >
              {item.title}
            </button>
          </h2>
          <div
            id={`collapse${item.id}`}
            className={`accordion-collapse collapse ${
              item.id === 1 ? "show" : ""
            }`}
            data-bs-parent="#accordionTwo"
          >
            <div className="accordion-body">
              <div className="feature-list-two">
                <ul className="flex flex-wrap justify-between">
                  {item?.feature_list?.map((list, i) => (
                    <li
                      className="w-full flex items-center justify-between "
                      key={i}
                    >
                      <span>{list.title} </span>{" "}
                      <span className="fw-500 text-[#000]">{list.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommonPropertyFeatureList;
