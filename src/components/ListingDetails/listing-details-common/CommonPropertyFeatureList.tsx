import { DataType, PropertyTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";

const CommonPropertyFeatureList = ({
  property,
}: {
  property?: PropertyTypes;
}) => {
  const t = useTranslations("endUser");
  const locale = useLocale();

  const property_feature_list: DataType[] = [
    {
      id: 1,
      title: t("property_feature"),
      feature_list: property?.features
        .map((feature) => {
          if (feature.type === "property_feature") {
            return {
              title: feature.key,
              count: feature.value,
            };
          }
          return null;
        })
        .filter(
          (item): item is { title: string; count: string } => item !== null
        ),
    },
    {
      id: 2,
      title: t("utility_detail"),
      feature_list: property?.features?.map((feature) => {
          if (feature.type === "utility_detail") {
            return {
              title: feature.key,
              count: feature.value,
            };
          }
          return null;
        })
        .filter(
          (item): item is { title: string; count: string } => item !== null
        ),
    },
    {
      id: 3,
      title: t("outdoor_feature"),
      feature_list: property?.features
        .map((feature) => {
          if (feature.type === "outdoor_feature") {
            return {
              title: feature.key,
              count: feature.value,
            };
          }
          return null;
        })
        .filter(
          (item): item is { title: string; count: string } => item !== null
        ),
    },
    {
      id: 3,
      title: t("indoor_feature"),
      feature_list: property?.features
        .map((feature) => {
          if (feature.type === "indoor_feature") {
            return {
              title: feature.key,
              count: feature.value,
            };
          }
          return null;
        })
        .filter(
          (item): item is { title: string; count: string } => item !== null
        ),
    },
  ];
//  console.log(property_feature_list);

 
  return (
    <div className="accordion" id="accordionTwo">
      {property_feature_list.map((item) => (
        <div key={item.id} className="accordion-item">
          <h2 className="accordion-header">
            <button
              className={`accordion-button ${
                locale === "ar" ? "after:mr-auto noMl" : "after:ml-auto after:mr-[0px]"
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
