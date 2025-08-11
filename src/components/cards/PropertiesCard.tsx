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
  const t = useTranslations("endUser");
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
      key={item?.id}
      className="w-full d-flex mb-50 wow fadeInUp"
      data-wow-delay={item?.data_delay_time}
    >
      <div className={`listing-card-one rounded-[25px] w-full `}>
        <div className="img-gallery p-15">
          <div className="position-relative overflow-hidden">
            <div
              className={`tag px-2 ${
                item?.status === "rent"
                  ? "!bg-[#FF6B2C]"
                  : item?.status === "sale"
                  ? "!bg-[#00B579]"
                  : "!bg-[#f9fcfb0]"
              } rounded-[25px] w-fit`}
            >
              {item?.status}
            </div>
            <div
              className={`tag !left-[70px] px-2 "!bg-[#FF6B2C]"
                 
              } rounded-[25px] w-fit`}
            >
              {item?.property_type?.title}
            </div>
            <button
              onClick={() => {
                addToFavorites(item?.id);
              }}
              className="fav-btn tran3s"
            >
              <i className="fa-light fa-heart"></i>
            </button>
            {/* <div
                      id={`carousel${item?.carousel}`}
                      className="carousel slide"
                    >
                      <div className="carousel-indicators">
                        <button
                          type="button"
                          data-bs-target={`#carousel${item?.carousel}`}
                          data-bs-slide-to="0"
                          className="active"
                          aria-current="true"
                          aria-label="Slide 1"
                        ></button>
                        <button
                          type="button"
                          data-bs-target={`#carousel${item?.carousel}`}
                          data-bs-slide-to="1"
                          aria-label="Slide 2"
                        ></button>
                        <button
                          type="button"
                          data-bs-target={`#carousel${item?.carousel}`}
                          data-bs-slide-to="2"
                          aria-label="Slide 3"
                        ></button>
                      </div>
                      <div className="carousel-inner">
                        {item?.carousel_thumb?.map((item: any, i: any) => (
                           <div
                             key={i}
                             className={`carousel-item ${item?.active}`}
                             data-bs-interval="1000000"
                           >
                             <Link
                               href={`/properties/${item?.slug}`}
                               className="d-block"
                             >
                               <img
                                 src={item?.img}
                                 className="w-100"
                                 alt="..."
                               />
                             </Link>
                           </div>
                         ))}
                        
                      </div>
                    </div> */}
            <div
            //  className={`carousel-item ${item?.active}`}
            //  data-bs-interval="1000000"
            >
              <Link href={`/properties/${item?.slug}`} className="d-block">
                <img
                  src={item?.cover}
                  className="w-full h-[295px] rounded-[25px]"
                  alt={item?.title}
                  // style={{
                  //   height: "clamp(100px,15.365vw,2095px)",
                  // }}
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="property-info p-25">
          <Link
            href={`/properties/${item?.slug}`}
            className="title no-underline line-clamp-1 !text-[#FF6625] tran3s"
          >
            {item?.title}
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
              <span className="fs-16">{`${item?.bathroom} ${t("bath")}`}</span>
            </li>
          </ul>
          <div className="pl-footer top-border d-flex align-items-center justify-content-between">
            <strong
              className="price fw-500 color-[#000]"
              style={{ fontSize: "clamp(20px,1.458vw,28px)" }}
            >
              {Number(item?.price).toLocaleString()}
              EGP{item?.status === "rent" && "/M"}
            </strong>
            <div className="flex items-center justify-center gap-[10px]">
              <a
                href={`https://wa.me/${item?.user?.phone}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="48"
                  height="49"
                  viewBox="0 0 48 49"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect y="0.5" width="48" height="48" rx="24" fill="#00B266" />
                  <path
                    d="M9.44189 38.4627L11.4998 30.99C10.2275 28.7966 9.56008 26.3126 9.56704 23.7732C9.56704 15.8161 16.0743 9.34668 24.0625 9.34668C27.9418 9.34668 31.5848 10.8481 34.3171 13.5743C37.0562 16.3005 38.5649 19.9262 38.5579 23.7802C38.5579 31.7373 32.0506 38.2067 24.0555 38.2067H24.0486C21.6222 38.2067 19.2376 37.5978 17.1172 36.4493L9.44189 38.4627ZM17.4857 33.8407L17.9236 34.1036C19.7729 35.1969 21.8934 35.7712 24.0555 35.7781H24.0625C30.7019 35.7781 36.1107 30.4019 36.1107 23.7871C36.1107 20.5835 34.8593 17.5736 32.5859 15.3041C30.3126 13.0346 27.2814 11.7892 24.0625 11.7892C17.4231 11.7822 12.0142 17.1585 12.0142 23.7732C12.0142 26.0358 12.6469 28.2431 13.8566 30.1528L14.1416 30.6094L12.925 35.0308L17.4857 33.8407Z"
                    fill="white"
                  />
                  <path
                    d="M9.94946 37.9574L11.9378 30.7407C10.7073 28.6303 10.0607 26.2294 10.0607 23.78C10.0677 16.0996 16.3455 9.85156 24.0625 9.85156C27.8098 9.85156 31.3207 11.3046 33.9625 13.9339C36.6044 16.5632 38.0574 20.0643 38.0574 23.7869C38.0574 31.4672 31.7726 37.7153 24.0625 37.7153H24.0556C21.7127 37.7153 19.4115 37.1271 17.3675 36.02L9.94946 37.9574Z"
                    fill="#00B266"
                  />
                  <path
                    d="M9.44189 38.4627L11.4998 30.99C10.2275 28.7966 9.56008 26.3126 9.56704 23.7732C9.56704 15.8161 16.0743 9.34668 24.0625 9.34668C27.9418 9.34668 31.5848 10.8481 34.3171 13.5743C37.0562 16.3005 38.5649 19.9262 38.5579 23.7802C38.5579 31.7373 32.0506 38.2067 24.0555 38.2067H24.0486C21.6222 38.2067 19.2376 37.5978 17.1172 36.4493L9.44189 38.4627ZM17.4857 33.8407L17.9236 34.1036C19.7729 35.1969 21.8934 35.7712 24.0555 35.7781H24.0625C30.7019 35.7781 36.1107 30.4019 36.1107 23.7871C36.1107 20.5835 34.8593 17.5736 32.5859 15.3041C30.3126 13.0346 27.2814 11.7892 24.0625 11.7892C17.4231 11.7822 12.0142 17.1585 12.0142 23.7732C12.0142 26.0358 12.6469 28.2431 13.8566 30.1528L14.1416 30.6094L12.925 35.0308L17.4857 33.8407Z"
                    fill="url(#paint0_linear_1146_3343)"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M20.4403 17.7395C20.1691 17.1375 19.8841 17.1237 19.6268 17.1168C19.4183 17.1099 19.175 17.1099 18.9316 17.1099C18.6883 17.1099 18.299 17.1998 17.9653 17.5596C17.6316 17.9194 16.7 18.7912 16.7 20.5695C16.7 22.3408 18 24.0568 18.1808 24.2989C18.3615 24.5411 20.6905 28.2982 24.3683 29.7444C27.4273 30.9483 28.053 30.7061 28.7134 30.6439C29.3739 30.5816 30.8547 29.772 31.1606 28.9279C31.4596 28.0837 31.4596 27.3641 31.3692 27.2119C31.2788 27.0597 31.0355 26.9697 30.674 26.7898C30.3125 26.61 28.5327 25.7381 28.199 25.6136C27.8653 25.496 27.6219 25.4337 27.3856 25.7935C27.1422 26.1533 26.447 26.9628 26.2384 27.205C26.0299 27.4472 25.8144 27.4749 25.4528 27.295C25.0913 27.1151 23.9233 26.7345 22.5398 25.5029C21.4622 24.548 20.7323 23.3648 20.5237 23.005C20.3151 22.6452 20.5028 22.4515 20.6836 22.2716C20.8435 22.1125 21.0451 21.8495 21.2259 21.642C21.4066 21.4344 21.4692 21.2822 21.5874 21.04C21.7056 20.7978 21.65 20.5902 21.5596 20.4103C21.4692 20.2373 20.7601 18.4522 20.4403 17.7395Z"
                    fill="white"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_1146_3343"
                      x1="24.0028"
                      y1="38.46"
                      x2="24.0028"
                      y2="9.34668"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#F9F9F9" />
                      <stop offset="1" stopColor="white" />
                    </linearGradient>
                  </defs>
                </svg>
              </a>
              <a href={`tel:${item?.user?.phone}`}>
                <svg
                  width="48"
                  height="49"
                  viewBox="0 0 48 49"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect y="0.5" width="48" height="48" rx="24" fill="#FF6625" />
                  <path
                    d="M34.6 36.5C31.8222 36.5 29.0778 35.8947 26.3667 34.684C23.6556 33.4733 21.1889 31.7564 18.9667 29.5333C16.7444 27.3102 15.028 24.8436 13.8173 22.1333C12.6067 19.4231 12.0009 16.6787 12 13.9C12 13.5 12.1333 13.1667 12.4 12.9C12.6667 12.6333 13 12.5 13.4 12.5H18.8C19.1111 12.5 19.3889 12.6058 19.6333 12.8173C19.8778 13.0289 20.0222 13.2787 20.0667 13.5667L20.9333 18.2333C20.9778 18.5889 20.9667 18.8889 20.9 19.1333C20.8333 19.3778 20.7111 19.5889 20.5333 19.7667L17.3 23.0333C17.7444 23.8556 18.272 24.6498 18.8827 25.416C19.4933 26.1822 20.1658 26.9213 20.9 27.6333C21.5889 28.3222 22.3111 28.9613 23.0667 29.5507C23.8222 30.14 24.6222 30.6787 25.4667 31.1667L28.6 28.0333C28.8 27.8333 29.0613 27.6836 29.384 27.584C29.7067 27.4844 30.0231 27.4564 30.3333 27.5L34.9333 28.4333C35.2444 28.5222 35.5 28.6836 35.7 28.9173C35.9 29.1511 36 29.412 36 29.7V35.1C36 35.5 35.8667 35.8333 35.6 36.1C35.3333 36.3667 35 36.5 34.6 36.5Z"
                    fill="white"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesCard;
