"use client";
import Count from "@/components/common/Count";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import titleShape from "@/assets/images/shape/title_shape_09.svg";
import { useLocale, useTranslations } from "next-intl";

const BLockFeatureOne = () => {
  const t = useTranslations("endUser.about");
  const locale = useLocale();
  return (
    <div className="block-feature-two mt-150 xl-mt-100">
      <div className="container">
        <div className="row gx-xl-5">
          <div className="col-lg-6 wow fadeInLeft">
            <div className="me-xxl-4">
              <div className="title-one mb-60 lg-mb-40">
                <div className="upper-title">{t("title")}</div>
                <h3
                  className={`${
                    locale === "ar" ? "flex flex-row-reverse  justify-end" : ""
                  }`}
                >
                  {t("sub_title")}
                  <span className="mx-1">
                    {t("property")}
                    <Image src={titleShape} alt="" className="lazy-img" />
                  </span>
                  {t("marketaplace")}
                </h3>
                <p className="fs-22">{t("description")}</p>
              </div>
              <Link href="/contact" className="btn-two">
                {t("contact_us")}
              </Link>
              <div className="counter-wrapper border-top pt-40 md-pt-10 mt-65 md-mt-40">
                <div className="row">
                  <div className="col-xxl-6 col-sm-5">
                    <div className="counter-block-one mt-20">
                      <div className="main-count fw-500 color-dark">
                        <span className="counter">
                          <Count number={8} />
                        </span>
                        %
                      </div>
                      <span>{t("Low interest rate")}</span>
                    </div>
                  </div>
                  <div className="col-xxl-6 col-sm-7">
                    <div className="counter-block-one mt-20">
                      <div className="main-count fw-500 color-dark">
                        $
                        <span className="counter">
                          <Count number={1.3} />
                        </span>
                        b+
                      </div>
                      <span>{t("cumulative_trading_volume")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 wow fadeInRight">
            <div className="block-two md-mt-40">
              <div className="bg-wrapper">
                <h5>{t("title_1")}</h5>
                <p className="fs-22 lh-lg mt-20">{t("desc_2")}</p>
                <h5 className="top-line">{t("title_2")} </h5>
                <p className="fs-22 lh-lg mt-20">{t("desc_3")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BLockFeatureOne;
