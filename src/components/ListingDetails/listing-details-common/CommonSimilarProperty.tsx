"use client";
import { PropertyTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";
import Slider from "react-slick";
import PropertiesCard from "@/components/cards/PropertiesCard";



const CommonSimilarProperty = ({
  similar,
  token,
}: {
  similar: PropertyTypes[];
  token: string;
}) => {
  const t = useTranslations("endUser");
  const setting = {
    dots: true,
    arrows: false,
    centerPadding: "0px",
    slidesToShow: similar?.length < 2 ? similar?.length : 2,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="similar-property">
      <h4 className="mb-40">{t("Similar Homes You May Like")}</h4>
      <Slider {...setting} className="similar-listing-slider-one">
        {similar?.map((item: PropertyTypes) => (
          <div key={item?.id} className="item">
            <PropertiesCard item={item} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CommonSimilarProperty;
