"use client";
import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";
import { PropertyTypes } from "@/libs/types/types";
import featureIcon_1 from "@/assets/images/icon/icon_04.svg";
import featureIcon_2 from "@/assets/images/icon/icon_05.svg";
import featureIcon_3 from "@/assets/images/icon/icon_06.svg";
import Image from "next/image";
import { Link } from "@/i18n/routing";

const Favorites = ({ token }: { token: string }) => {
  const [activeTab, setActiveTab] = useState<"rent" | "sell">("rent");
  const [favourites, setFavourites] = useState<PropertyTypes[]>([]);
  const t = useTranslations("Favorites");
  const locale = useLocale();

  useEffect(() => {
    const feachData = async () => {
      try {
        const response = await getData(
          `favourites?status=${activeTab}`,
          {},
          {
            lang: locale,
            Authorization: `Bearer ${token}`,
          }
        );
        setFavourites(response.data.data);
      } catch (error) {
        throw error;
      }
    };

    feachData();
  }, [token, locale, activeTab]);

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-[960px] mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex justify-between items-center sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              {t("title")}
            </h1>
          </div>
          <div className="rounded-[78px]  outline-1 outline-offset-[-1px] outline-[#FF6625] flex justify-start items-center">
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-[clamp(16px,2.5vw,48px)] py-2 rounded-[57px] flex justify-center items-center gap-2.5 transition-colors ${
                activeTab === "rent" ? "bg-[#FF6625] text-white" : "text-black"
              }`}
            >
              <span className="text-base md:text-lg font-medium">
                {t("forRent")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sell")}
              className={`px-[clamp(16px,2.5vw,48px)] py-2 rounded-[57px] flex justify-center items-center gap-2.5 transition-colors ${
                activeTab === "sell" ? "bg-[#FF6625] text-white" : "text-black"
              }`}
            >
              <span className="text-base md:text-lg font-medium">
                {t("forSell")}
              </span>
            </button>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="row gx-xxl-5">
          {favourites?.map((item: PropertyTypes) => (
            <div
              key={item.id}
              className="col-lg-6 d-flex mb-50 wow fadeInUp"
              data-wow-delay={item.data_delay_time}
            >
              <div className={`listing-card-one rounded-[25px] `}>
                <div className="img-gallery p-15">
                  <div className="position-relative overflow-hidden">
                    <div
                      className={`tag px-2 ${
                        item.status === "rent"
                          ? "!bg-[#FF6B2C]"
                          : item.status === "sale"
                          ? "!bg-[#00B579]"
                          : "!bg-[#f9fcfb0]"
                      } rounded-[25px] w-fit`}
                    >
                      {item.status}
                    </div>
                    <Link href="#" className="fav-btn tran3s">
                      <i className="fa-light fa-heart"></i>
                    </Link>
                    {/* <div
                      id={`carousel${item.carousel}`}
                      className="carousel slide"
                    >
                      <div className="carousel-indicators">
                        <button
                          type="button"
                          data-bs-target={`#carousel${item.carousel}`}
                          data-bs-slide-to="0"
                          className="active"
                          aria-current="true"
                          aria-label="Slide 1"
                        ></button>
                        <button
                          type="button"
                          data-bs-target={`#carousel${item.carousel}`}
                          data-bs-slide-to="1"
                          aria-label="Slide 2"
                        ></button>
                        <button
                          type="button"
                          data-bs-target={`#carousel${item.carousel}`}
                          data-bs-slide-to="2"
                          aria-label="Slide 3"
                        ></button>
                      </div>
                      <div className="carousel-inner">
                        {item.carousel_thumb?.map((item: any, i: any) => (
                           <div
                             key={i}
                             className={`carousel-item ${item.active}`}
                             data-bs-interval="1000000"
                           >
                             <Link
                               href="/listing_details_01"
                               className="d-block"
                             >
                               <img
                                 src={item.img}
                                 className="w-100"
                                 alt="..."
                               />
                             </Link>
                           </div>
                         ))}
                        
                      </div>
                    </div> */}
                    <div
                    //  className={`carousel-item ${item.active}`}
                    //  data-bs-interval="1000000"
                    >
                      <Link
                        href={`/properties/${item.slug}`}
                        className="d-block"
                      >
                        <img
                          src={item.cover}
                          className="w-100 w-full rounded-[25px] h-full"
                          alt={item.title}
                          width={500}
                          height={500}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="property-info p-25">
                  <Link
                    href="/listing_details_03"
                    className="title no-underline !text-[#FF6625] tran3s"
                  >
                    {item.title}
                  </Link>
                  <div className="address">{item?.area?.name}</div>
                  <ul className="style-none feature d-flex flex-wrap align-items-center justify-content-between">
                    <li className="d-flex align-items-center">
                      <Image
                        src={featureIcon_1}
                        alt=""
                        className="lazy-img icon mx-2"
                      />
                      <span className="fs-16">{`${item?.sqt} ${t(
                        "sqft"
                      )}`}</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <Image
                        src={featureIcon_2}
                        alt=""
                        className="lazy-img icon mx-2"
                      />
                      <span className="fs-16">{`${item?.bedroom} ${t(
                        "bed"
                      )}`}</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <Image
                        src={featureIcon_3}
                        alt=""
                        className="lazy-img icon mx-2"
                      />
                      <span className="fs-16">{`${item?.bathroom} ${t(
                        "bed"
                      )}`}</span>
                    </li>
                  </ul>
                  <div className="pl-footer top-border d-flex align-items-center justify-content-between">
                    <strong className="price fw-500 color-[#000]">
                      $
                      {item.price?.toLocaleString(undefined, {
                        minimumFractionDigits: item.price ? 0 : 2,
                        maximumFractionDigits: 2,
                      })}
                      {/* {item.price && (
                         <>
                           /<sub>m</sub>
                         </>
                       )} */}
                    </strong>
                    <Link
                      href={`properties/${item.slug}`}
                      className="btn-four rounded-circle"
                    >
                      <i className="bi bi-arrow-up-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
