"use client";
import Image from "next/image";
import DropdownOne from "@/components/search-dropdown/home-dropdown/DropdownOne";

import titleShape from "@/assets/images/shape/shape_01.svg";
import bannerThumb from "@/assets/images/assets/ils_01.svg";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const Banner = () => {
  const t = useTranslations("installments");
  return (
    <div className="hero-banner-one bg-pink z-1 pt-225 xl-pt-200 pb-250 xl-pb-150 lg-pb-100 position-relative">
      <div className="container position-relative">
        <div className="row">
          <div className="col-xxl-10 col-xl-9 col-lg-10 col-md-10 m-auto">
            <h1 className="hero-heading text-center wow fadeInUp">
              {t("Installment Plans")}
              <br />
              <Image
                src={titleShape}
                alt=""
                className="lazy-img w-[40%] mx-auto"
              />
            </h1>
            <p
              className="fs-24 color-dark text-center pt-35 pb-35 wow fadeInUp"
              data-wow-delay="0.1s"
            >
              <Link href="/" className="text-decoration-none text-[#31313180]">
                {t("home")}
              </Link>{" "}
              /{" "}
              <Link
                href="/properties"
                className="text-decoration-none text-[#31313180]"
              >
                {t("properity")}
              </Link>{" "}
              /{" "}
              <Link href="/installments" className="text-decoration-none">
                {t("installment_plans")}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Image
        src={bannerThumb}
        alt=""
        className="lazy-img shapes w-100 illustration"
      />
    </div>
  );
};

export default Banner;
