"use client";
import { Link } from "@/i18n/routing";
import { PropertyTypes } from "@/libs/types/types";
import featureIcon_1 from "@/assets/images/icon/icon_04.svg";
import featureIcon_2 from "@/assets/images/icon/icon_05.svg";
import featureIcon_3 from "@/assets/images/icon/icon_06.svg";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { postData } from "@/libs/server/backendServer";
import axios from "axios";
import { toast } from "react-toastify";

const PropertiesCard = ({
  item,
  token,
}: {
  item: PropertyTypes;
  token: string;
}) => {
  const t = useTranslations("Favorites");
  const addToFavorites = async (id: string | number) => {
    try {
      const response = await postData(
        "favourite/toggle",
        { property_id: id },
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.msg || "An error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
      throw error;
    }
  };
  return (
    <div
      key={item.id}
      className="col-lg-3 d-flex mb-50 wow fadeInUp"
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
            <button
              onClick={() => {
                addToFavorites(item.id);
              }}
              className="fav-btn tran3s"
            >
              <i className="fa-light fa-heart"></i>
            </button>
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
                               href={`/properties/${item.slug}`}
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
              <Link href={`/properties/${item.slug}`} className="d-block">
                <img
                  src={item.cover}
                  className="w-[100%] rounded-[25px] h-full"
                  alt={item.title}
                  
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="property-info p-25">
          <Link
            href={`/properties/${item.slug}`}
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
              <span className="fs-16">{`${item?.sqt} ${t("sqft")}`}</span>
            </li>
            <li className="d-flex align-items-center">
              <Image
                src={featureIcon_2}
                alt=""
                className="lazy-img icon mx-2"
              />
              <span className="fs-16">{`${item?.bedroom} ${t("bed")}`}</span>
            </li>
            <li className="d-flex align-items-center">
              <Image
                src={featureIcon_3}
                alt=""
                className="lazy-img icon mx-2"
              />
              <span className="fs-16">{`${item?.bathroom} ${t("bed")}`}</span>
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
              href={`/properties/${item.slug}`}
              className="btn-four rounded-circle"
            >
              <i className="bi bi-arrow-up-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesCard;
