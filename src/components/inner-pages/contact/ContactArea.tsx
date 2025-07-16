"use client";
import Link from "next/link"
import Image from "next/image"
import { useTranslations } from "next-intl";

import circleImg from "@/assets/images/icon/icon_39.svg";
import ContactForm from "@/components/forms/ContactForm";


interface DataType {
  id: number;
  class_name?: string;
  title: string;
  address_1: string;
  address_2?: string;
}

const ContactArea = () => {
  const t = useTranslations("endUser");
  const address_data: DataType[] = [
    {
      id: 1,
      title: t("helpTitle"),
      address_1: t("helpEmail"),
    },
    {
      id: 2,
      class_name: "skew-line",
      title: t("hotlineTitle"),
      address_1: t("hotline1"),
      address_2: t("hotline2"),
    },
    {
      id: 3,
      title: t("livechatTitle"),
      address_1: t("livechatUrl"),
    },
  ];


  return (
    <div className="contact-us border-top mt-130 xl-mt-100 pt-80 lg-pt-60">
      <div className="container">
        <div className="row">
          <div className="col-xxl-9 col-xl-8 col-lg-10 m-auto">
            <div className="title-one text-center wow fadeInUp">
              <h3>{t("mainTitle")}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="address-banner wow fadeInUp mt-60 lg-mt-40">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-center justify-content-lg-between">
            {address_data.map((item) => (
              <div
                key={item.id}
                className={`block position-relative ${item.class_name} z-1 mt-25`}
              >
                <div className="d-xl-flex gap-[10px] align-items-center">
                  <div className="icon rounded-circle d-flex align-items-center justify-content-center">
                    <Image src={circleImg} alt="" className="lazy-img" />
                  </div>
                  <div className="text">
                    <p className="fs-22">{item.title}</p>
                    <Link href="#" className="tran3s">
                      {item.address_1}
                    </Link>
                    {item.address_2 && (
                      <>
                        {" "}
                        <Link href="#" className="tran3s">
                          {item.address_2}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-pink mt-150 xl-mt-120 md-mt-80">
        <div className="row">
          <div className="col-xl-7 col-lg-6">
            <div className="form-style-one wow fadeInUp">
              <ContactForm />
            </div>
          </div>
          <div className="col-xl-5 col-lg-6 d-flex order-lg-first">
            <div className="contact-map-banner w-100">
              <div className="gmap_canvas h-100 w-100">
                <iframe
                  className="gmap_iframe h-100 w-100"
                  src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=dhaka collage&amp;t=&amp;z=12&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactArea
