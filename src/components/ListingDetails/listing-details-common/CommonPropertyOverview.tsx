import Image, { StaticImageData } from "next/image"
import icon_1 from "@/assets/images/icon/icon_47.svg"
import icon_2 from "@/assets/images/icon/icon_48.svg"
import icon_3 from "@/assets/images/icon/icon_49.svg"
import icon_4 from "@/assets/images/icon/icon_50.svg"
import icon_5 from "@/assets/images/icon/icon_51.svg"
import { PropertyTypes } from "@/libs/types/types"
import { useTranslations } from "next-intl"

interface DataType {
  id: number;
  icon: StaticImageData;
  title: string;
  value: any; // Added to track the actual value
}[]

const CommonPropertyOverview = ({ property }: { property: PropertyTypes }) => {
  const t = useTranslations("endUser");

  const property_overview_data: DataType[] = [
    {
      id: 1,
      icon: icon_1,
      title: `${t("sqft")} . ${property?.sqt}`,
      value: property?.sqt
    },
    {
      id: 2,
      icon: icon_2,
      title: `${t("bed")} . ${property?.bedroom}`,
      value: property?.bedroom
    },
    {
      id: 3,
      icon: icon_3,
      title: `${t("bath")} . ${property?.bathroom}`,
      value: property?.bathroom
    },
    {
      id: 4,
      icon: icon_4,
      title: `${t("Kitchen")} . ${property?.kitichen}`,
      value: property?.kitichen
    },
    {
      id: 5,
      icon: icon_5,
      title: `${t("type")} . ${property?.property_type?.title}`,
      value: property?.property_type?.title
    },
  ];

  // Filter out items with undefined, null, or empty values
  const filteredData = property_overview_data.filter(item => 
    item.value !== undefined && 
    item.value !== null && 
    item.value !== '' &&
    item.value !== 0 // Optional: also hide if value is 0
  );

  return (
    <ul className="style-none d-flex flex-wrap align-items-center justify-content-between">
      {filteredData.map((item) => (
        <li key={item?.id}>
          <Image src={item?.icon} alt="" className="lazy-img icon" />
          <span className="fs-20 color-dark">{item?.title}</span>
        </li>
      ))}
    </ul>
  );
};

export default CommonPropertyOverview