// "use client"
// import Image from "next/image"
// import Link from "next/link";
// import feature_data from "@/data/home-data/FeatureData";
// import Slider from "react-slick";
// import React, { useRef } from "react";

// import titleShape from "@/assets/images/shape/title_shape_02.svg";

// const setting = {
//   infinite: true,
//   speed: 300,
//   slidesToShow: 4,
//   slidesToScroll: 1,
//   centerMode: true,
//   centerPadding: '0',
//   dots: false,
//   arrows: false,
//   autoplay: true,
//   autoplaySpeed: 3000,
//   responsive: [
//     {
//       breakpoint: 1200,
//       settings: {
//         slidesToShow: 3
//       }
//     },
//     {
//       breakpoint: 992,
//       settings: {
//         slidesToShow: 2
//       }
//     },
//     {
//       breakpoint: 500,
//       settings: {
//         slidesToShow: 1
//       }
//     }
//   ]
// }

// const BLockFeatureThree = () => {

//   const sliderRef = useRef<Slider | null>(null);

//   const handlePrevClick = () => {
//     if (sliderRef.current) {
//       sliderRef.current.slickPrev();
//     }
//   };

//   const handleNextClick = () => {
//     if (sliderRef.current) {
//       sliderRef.current.slickNext();
//     }
//   };

//   return (
//     <div className="block-feature-three mt-150 xl-mt-120">
//       <div className="container">
//         <div className="title-one text-center mb-75 xl-mb-50 md-mb-30 wow fadeInUp">
//           <h3>Explore Popular <span>Location <Image src={titleShape} alt="" className="lazy-img" /></span></h3>
//           <p className="fs-22">Explore the latest listings & projects in diverse areas</p>
//         </div>

//         <Slider {...setting} ref={sliderRef} className="property-location-slider-one">
//           {feature_data.filter((items) => items.page === "home_1_feature_2").map((item) => (
//             <div key={item.id} className="item-first">
//               <div className={`location-card-one position-relative z-1 d-flex align-items-end ${item.item_bg}`}>
//                 <div className="content text-center w-100 tran3s">
//                   <h5 className="text-white fw-normal">{item.title}</h5>
//                   <p className="text-white fw-light">{item.desc}</p>
//                 </div>
//                 <Link href="/listing_01" className="stretched-link"></Link>
//               </div>
//             </div>
//           ))}
//         </Slider>

//         <ul className="slider-arrows slick-arrow-one d-flex justify-content-between style-none position-relative">
//           <li onClick={handlePrevClick} className="prev_a slick-arrow"><i className="fa-sharp fa-light fa-angle-left"></i></li>
//           <li onClick={handleNextClick} className="next_a slick-arrow"><i className="fa-sharp fa-light fa-angle-right"></i></li>
//         </ul>
//       </div>
//     </div>
//   )
// }

// export default BLockFeatureThree

"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";

import titleShape from "@/assets/images/shape/title_shape_02.svg";
// adjust the path to wherever you put your axios file:
import { getData } from "@/libs/server/backendServer";
import { useTranslations } from "next-intl";

interface Area {
  id: number;
  image: string;
  count_of_properties: number;
  name: string;
}

export default function BLockFeatureThree() {
  const t = useTranslations("endUser");
  const [areas, setAreas] = useState<Area[]>([]);
  const sliderRef = useRef<Slider | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // GET /home → { data: { areas: [...] } }
        const response = await getData("home");
        setAreas(response.data.data.areas);
      } catch (err) {
        console.error("Failed to load areas:", err);
      }
    })();
  }, []);

  const settings = {
    infinite: areas.length > 1,
    speed: 300,
    slidesToShow: 4 ,
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
            {t("Explore Popular Location")}{" "}
            <span>
              <Image src={titleShape} alt="" className="lazy-img" />
            </span>
          </h3>
          <p className="fs-22">
            {t("Explore the latest listings & projects in diverse areas")}
          </p>
        </div>

        <Slider
          {...settings}
          ref={sliderRef}
          className="property-location-slider-one "
        >
          {areas.map((area) => (
            <div key={area.id} className="item-first max-w-[315px]">
              <div
                className="location-card-one position-relative z-1 d-flex align-items-end"
                style={{
                  backgroundImage: `url(${area.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="content text-center w-100 tran3s">
                  <h5 className="text-white fw-normal">{area.name}</h5>
                  <p className="text-white fw-light">
                    {`${area.count_of_properties} ${t("properties")}`}
                  </p>
                </div>
                <Link
                  href="#"
                  className="stretched-link"
                />
              </div>
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
