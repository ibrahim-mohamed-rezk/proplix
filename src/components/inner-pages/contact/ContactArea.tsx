"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import ContactForm from "@/components/forms/ContactForm";

// Import icons from lucide-react
import {
  MapPin as MapMarkerIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
} from "lucide-react";

const CONTACT_INFO = [
  {
    id: 1,
    icon: MapMarkerIcon,
    label: "Location",
    value: "Building 238 Second Sector, Fifth Settlement, New Cairo",
    href: "https://maps.app.goo.gl/PqyFUnvvxPC571iY7",
    isExternal: true,
  },
  {
    id: 2,
    icon: PhoneIcon,
    label: "Phone",
    value: "+201005400050",
    href: "tel:+201005400050",
    isExternal: false,
  },
  {
    id: 3,
    icon: MailIcon,
    label: "Email",
    value: "info@proplix.co",
    href: "mailto:info@proplix.co",
    isExternal: false,
  },
];

const ContactArea = () => {
  const t = useTranslations("endUser");

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
            {CONTACT_INFO.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className={`block position-relative z-1 mt-25`}
                >
                  <div className="d-xl-flex gap-[10px] align-items-center">
                    <div
                      className="icon rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: 60, height: 60, background: "#f5f5f5" }}
                    >
                      <Icon
                        size={32}
                        aria-label={item.label}
                        style={{ display: "block" }}
                      />
                    </div>
                    <div className="text">
                      <p className="fs-22">{item.label}</p>
                      <Link
                        href={item.href}
                        className="tran3s"
                        target={item.isExternal ? "_blank" : undefined}
                        rel={
                          item.isExternal ? "noopener noreferrer" : undefined
                        }
                      >
                        {item.value}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <div
                className="gmap_canvas h-100 w-100"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  window.open(
                    "https://maps.app.goo.gl/PqyFUnvvxPC571iY7",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                tabIndex={0}
                role="button"
                aria-label="Open location in Google Maps"
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.open(
                      "https://maps.app.goo.gl/PqyFUnvvxPC571iY7",
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }
                }}
              >
                <iframe
                  className="gmap_iframe h-100 w-100"
                  src="https://maps.google.com/maps?width=600&amp;height=400&amp;hl=en&amp;q=Building%20238%20Second%20Sector,%20Fifth%20Settlement,%20New%20Cairo&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                  style={{ pointerEvents: "none" }}
                  title="Proplix Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactArea;
