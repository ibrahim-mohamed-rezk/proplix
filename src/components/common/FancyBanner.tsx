"use client";
import Image from "next/image";
import Link from "next/link";
import titleShape from "@/assets/images/shape/title_shape_06.svg";
import { useTranslations } from "next-intl";
import { postData } from "@/libs/server/backendServer";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const FancyBanner = ({ style }: any) => {
  const t = useTranslations("endUser");
  const [email, setEmail] = useState("");
  const subscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    try {
      await postData(
        "mail",
        { email },
        {
          Authorization: `Bearer token`,
          "Content-Type": "multipart/form-data",
        }
      );

      toast.success(t("Subscribed successfully"));
      setEmail("");
      form.reset(); // Reset the form after request
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
    <div className="fancy-banner-two position-relative z-1 pt-90 lg-pt-50 pb-90 lg-pb-50">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="title-one text-center text-lg-start md-mb-40 pe-xl-5">
              <h3 className="text-white m0">
                {t("banner_start")}{" "}
                <span>
                  {t("banner_journey")}
                  {style ? (
                    ""
                  ) : (
                    <Image src={titleShape} alt="" className="lazy-img" />
                  )}
                </span>{" "}
                {t("banner_as_retailer")}
              </h3>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="form-wrapper me-auto ms-auto me-lg-0">
              <form onSubmit={(e) => subscribe(e)}>
                <input
                  type="email"
                  placeholder={t("banner_email_placeholder")}
                  className={style ? "rounded-0" : ""}
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <button className={style ? "rounded-0" : ""}>
                  {t("banner_get_started")}
                </button>
              </form>
              <div className="fs-16 mt-10 text-white">
                {t("banner_already_agent")}{" "}
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                >
                  {t("banner_sign_in")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FancyBanner;
