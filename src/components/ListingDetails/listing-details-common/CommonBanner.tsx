import { Link } from "@/i18n/routing";
import { PropertyTypes, UserTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";

const CommonBanner = ({
  property,
  user,
}: {
  style_3?: boolean;
  property?: PropertyTypes;
  user?: UserTypes;
}) => {
  const t = useTranslations("endUser");

  console.log(user?.id, property?.user.id);

  return (
    <div className="row">
      <div className="col-lg-6">
        <h3 className="property-titlee">{property?.title}</h3>
        <div className="d-flex flex-wrap flex-col mt-10">
          <div className="d-flex items-center justify-start">
            <div
              className={`list-type !border-none rounded-[23px] text-uppercase me-3 ${
                property?.status.toLowerCase() === "sale"
                  ? "!bg-[#00B579]"
                  : property?.status.toLowerCase() === "rent"
                  ? "!bg-[#FF6625]"
                  : "bg-three"
              }`}
            >
              {t(property?.status as string)}
            </div>
            <div
              className={`list-type !w-fit px-[8px] !border-none rounded-[23px] text-uppercase my-3 !bg-[#FF6625]
            }`}
            >
              {property?.property_type?.title as string}
            </div>
          </div>
          {/* <div className="address mt-15">
            <i className="bi bi-geo-alt"></i> {property?.area?.name}
          </div> */}
        </div>
      </div>
      {/* <div className="col-lg-6 d-flex justify-content-start lg:justify-content-end PropertyTypes text-lg-end"> */}
      <div className="col-lg-6 d-flex justify-content-start justify-content-lg-end PropertyTypes text-lg-end">
        <div className="d-inline-flex flex-column justify-content-start  md-mt-40">
          {/* <div className="price color-dark fw-500">{property?.price}EGP</div> */}
          <div className="price color-dark fw-500">
            {property?.price?.toLocaleString()}EGP
          </div>
          {property?.status.toLowerCase() === "rent" && (
            <div className="est-price fs-20 md-mb-30">
              {t("down_price")}
              <span className="fw-500 color-dark"> {property?.down_price}</span>
            </div>
          )}

          {property?.user.id === user?.id ? (
            <div className="w-96 flex justify-start items-start gap-[12px] mt-4">
              <Link
                href={`/dashboard/edit-property/${property?.id}`}
                className="flex-1 flex items-center justify-center gap-[8px] px-[20px] py-[8px] rounded-[8px] shadow-lg bg-[#FF6625] min-h-[48px] min-w-[120px]"
                type="button"
                style={{ minWidth: 0 }}
              >
                <span className="text-white text-lg font-semibold font-['Gordita'] leading-normal tracking-wide">
                  {t("edit_property")}
                </span>
              </Link>
            </div>
          ) : (
            <div className="w-96 flex justify-start items-start gap-[12px] mt-4">
              <a
                href={`tel:${property?.user.phone}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-[8px] px-[20px] py-[8px] rounded-[8px] shadow-lg bg-[#FF6625] min-h-[48px] min-w-[120px]"
                type="button"
                style={{ minWidth: 0 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.95 21C17.8667 21 15.8083 20.546 13.775 19.638C11.7417 18.73 9.89167 17.4423 8.225 15.775C6.55833 14.1077 5.271 12.2577 4.363 10.225C3.455 8.19233 3.00067 6.134 3 4.05C3 3.75 3.1 3.5 3.3 3.3C3.5 3.1 3.75 3 4.05 3H8.1C8.33333 3 8.54167 3.07933 8.725 3.238C8.90833 3.39667 9.01667 3.584 9.05 3.8L9.7 7.3C9.73333 7.56667 9.725 7.79167 9.675 7.975C9.625 8.15833 9.53333 8.31667 9.4 8.45L6.975 10.9C7.30833 11.5167 7.704 12.1123 8.162 12.687C8.62 13.2617 9.12433 13.816 9.675 14.35C10.1917 14.8667 10.7333 15.346 11.3 15.788C11.8667 16.23 12.4667 16.634 13.1 17L15.45 14.65C15.6 14.5 15.796 14.3877 16.038 14.313C16.28 14.2383 16.5173 14.2173 16.75 14.25L20.2 14.95C20.4333 15.0167 20.625 15.1377 20.775 15.313C20.925 15.4883 21 15.684 21 15.9V19.95C21 20.25 20.9 20.5 20.7 20.7C20.5 20.9 20.25 21 19.95 21Z"
                    fill="white"
                  />
                </svg>
                <span className="text-white text-lg font-semibold font-['Gordita'] leading-normal tracking-wide">
                  Call
                </span>
              </a>
              <a
                href={`https://wa.me/${property?.user.phone}`}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-[8px] px-[20px] py-[8px] rounded-[8px] shadow-lg bg-[#00B266] min-h-[48px] min-w-[120px]"
                type="button"
                style={{ minWidth: 0 }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_301_4597)">
                    <path
                      d="M0 24L1.69627 17.8403C0.647564 16.0323 0.0974211 13.9848 0.103152 11.8916C0.103152 5.3327 5.46704 0 12.0516 0C15.2493 0 18.2521 1.23764 20.5043 3.48479C22.7622 5.73194 24.0057 8.72053 24 11.8973C24 18.4563 18.6361 23.789 12.0458 23.789H12.0401C10.0401 23.789 8.07449 23.2871 6.32664 22.3403L0 24ZM6.63037 20.1901L6.9914 20.4068C8.51575 21.308 10.2636 21.7814 12.0458 21.7871H12.0516C17.5243 21.7871 21.9828 17.3555 21.9828 11.903C21.9828 9.26236 20.9513 6.78137 19.0773 4.91065C17.2034 3.03992 14.7049 2.01331 12.0516 2.01331C6.57879 2.00761 2.12034 6.43917 2.12034 11.8916C2.12034 13.7567 2.64183 15.5761 3.63897 17.1502L3.87392 17.5266L2.87106 21.1711L6.63037 20.1901Z"
                      fill="white"
                    />
                    <path
                      d="M0.418335 23.5833L2.0573 17.6347C1.04298 15.8951 0.510025 13.916 0.510025 11.897C0.515756 5.56621 5.69054 0.416016 12.0516 0.416016C15.1404 0.416016 18.0344 1.61373 20.212 3.78104C22.3897 5.94834 23.5874 8.83427 23.5874 11.9027C23.5874 18.2335 18.4069 23.3837 12.0516 23.3837H12.0458C10.1146 23.3837 8.21776 22.8989 6.53294 21.9864L0.418335 23.5833Z"
                      fill="#00B266"
                    />
                    <path
                      d="M0 24L1.69627 17.8403C0.647564 16.0323 0.0974211 13.9848 0.103152 11.8916C0.103152 5.3327 5.46704 0 12.0516 0C15.2493 0 18.2521 1.23764 20.5043 3.48479C22.7622 5.73194 24.0057 8.72053 24 11.8973C24 18.4563 18.6361 23.789 12.0458 23.789H12.0401C10.0401 23.789 8.07449 23.2871 6.32664 22.3403L0 24ZM6.63037 20.1901L6.9914 20.4068C8.51575 21.308 10.2636 21.7814 12.0458 21.7871H12.0516C17.5243 21.7871 21.9828 17.3555 21.9828 11.903C21.9828 9.26236 20.9513 6.78137 19.0773 4.91065C17.2034 3.03992 14.7049 2.01331 12.0516 2.01331C6.57879 2.00761 2.12034 6.43917 2.12034 11.8916C2.12034 13.7567 2.64183 15.5761 3.63897 17.1502L3.87392 17.5266L2.87106 21.1711L6.63037 20.1901Z"
                      fill="white"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.06576 6.91745C8.84226 6.42125 8.60731 6.40984 8.39527 6.40414C8.22335 6.39844 8.02278 6.39844 7.82221 6.39844C7.62163 6.39844 7.30072 6.47258 7.02564 6.76916C6.75057 7.06574 5.98267 7.78437 5.98267 9.25015C5.98267 10.7102 7.0543 12.1247 7.2033 12.3243C7.35229 12.5239 9.27206 15.6209 12.3036 16.8129C14.8251 17.8053 15.3408 17.6057 15.8852 17.5543C16.4296 17.503 17.6503 16.8357 17.9024 16.1399C18.1488 15.4441 18.1488 14.8509 18.0743 14.7254C17.9998 14.6 17.7993 14.5258 17.5013 14.3775C17.2033 14.2292 15.7362 13.5106 15.4612 13.4079C15.1861 13.311 14.9855 13.2597 14.7907 13.5562C14.5901 13.8528 14.017 14.5201 13.8451 14.7197C13.6732 14.9194 13.4956 14.9422 13.1976 14.7939C12.8996 14.6456 11.9368 14.3319 10.7964 13.3167C9.90816 12.5296 9.30645 11.5543 9.13453 11.2578C8.96261 10.9612 9.11733 10.8015 9.26633 10.6532C9.39814 10.522 9.56432 10.3053 9.71332 10.1342C9.86232 9.96308 9.91389 9.8376 10.0113 9.63798C10.1087 9.43836 10.0629 9.26726 9.98839 9.11897C9.91389 8.97638 9.32937 7.5049 9.06576 6.91745Z"
                      fill="white"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_301_4597">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-white text-lg font-semibold leading-normal tracking-wide">
                  WhatsApp
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonBanner;
