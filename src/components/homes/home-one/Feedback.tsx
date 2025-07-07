"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Slider from "react-slick";
import titleShape from "@/assets/images/shape/title_shape_02.svg";
import { useTranslations } from "next-intl";



export default function Feedback({ parteners }: { parteners: any }) {
  const t = useTranslations("endUser");
  const sliderRef = useRef<Slider | null>(null);

  const settings = {
    infinite: parteners?.length > 1,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "0",
    dots: false,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    pauseOnFocus: false,

    responsive: [
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
        breakpoint: 500,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  const handlePrevClick = () => sliderRef.current?.slickPrev();
  const handleNextClick = () => sliderRef.current?.slickNext();

  return (
    <div className="block-feature-three mt-150 xl-mt-120">
      <div className="container">
        <div className="title-one text-center mb-75 xl-mb-50 md-mb-30 wow fadeInUp">
          <h3>
              {t("Our Partners")}
            <span>
              <Image src={titleShape} alt="" className="lazy-img" />
            </span>
          </h3>
        </div>

        <Slider
          {...settings}
          ref={sliderRef}
          className="property-location-slider-one "
        >
          {parteners?.map((partner: any) => (
            <div key={partner.id} className="item-first max-w-[315px]">
              <div
                className="location-card-one position-relative z-1 d-flex align-items-end"
                style={{
                  backgroundImage: `url(${partner.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          ))}
        </Slider>

        <ul className="slider-arrows slick-arrow-one d-flex justify-content-between style-none position-relative">
          <li onClick={handlePrevClick} className="prev_a slick-arrow">
            <i className="fa-sharp fa-light fa-angle-left" />
          </li>
          <li onClick={handleNextClick} className="next_a slick-arrow">
            <i className="fa-sharp fa-light fa-angle-right" />
          </li>
        </ul>
      </div>
    </div>
  );
}
