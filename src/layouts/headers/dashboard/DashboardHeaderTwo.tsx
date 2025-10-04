"use client";
import Image from "next/image";
import Link from "next/link";
import Profile from "./Profile";
import { useState, useRef } from "react";
import DashboardHeaderOne from "./DashboardHeaderOne";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams, usePathname } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Check, ChevronDown } from "lucide-react";

import dashboardIcon_1 from "@/assets/images/dashboard/icon/icon_43.svg";
import dashboardAvatar from "@/assets/images/dashboard/avatar_01.jpg";

const DashboardHeaderTwo = ({ title }: any) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("DashboardHeaderTwo");

  const flagMap: Record<string, string> = {
    en: "gb",
    ar: "sa",
  };

  // Assuming you have the same routing configuration as HeaderOne
  const locales = ["en", "ar"]; // Add your available locales here

  const changeLanguage = (l: string) => {
    const paramsString = searchParams.toString();

    // Remove the current locale from the pathname to avoid duplication
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    const url = paramsString
      ? `${pathWithoutLocale}?${paramsString}`
      : pathWithoutLocale;

    router.replace(url, { locale: l });
    setLangOpen(false);
  };

  return (
    <>
      <header className="dashboard-header">
        <div className="d-flex align-items-center justify-between flex-nowrap">
          <h4 className="m0 d-none d-lg-block flex-shrink-0">{t(title)}</h4>
          <div className="d-flex align-items-center flex-nowrap">
            <button
              onClick={() => setIsActive(true)}
              className="dash-mobile-nav-toggler d-block d-md-none me-auto flex-shrink-0"
            >
              <span></span>
            </button>
            {/* Language Switcher */}
            <div className="relative me-3 flex-shrink-0">
              <button
                onClick={() => {
                  const currentIndex = locales.indexOf(locale);
                  const nextIndex = (currentIndex + 1) % locales.length;
                  const nextLocale = locales[nextIndex];
                  changeLanguage(nextLocale);
                }}
                className="flex items-center   hover:shadow-lg rounded-[clamp(12px,1vw,24px)] font-['Libre_Baskerville'] text-[clamp(15px,1.1vw,22px)] font-semibold py-[clamp(5px,0.6vw,8px)] px-[clamp(5px,1vw,8px)] justify-center gap-[8px] text-black transition-all duration-200 focus:outline-none"
              >
                <span className={`fi fi-${flagMap[locale]} mr-1`} />
                <Image
                  src={`/images/${locale}.svg`}
                  alt="Flag"
                  width={30}
                  height={20}
                  className="rounded shadow-sm "
                />
                <span className="uppercase text-[#222] font-bold font-['Libre_Baskerville'] text-[18px] tracking-wider">
                  {locale}
                </span>
                {/* Optional: You can keep the chevron or replace with a cycle icon */}
                {/* <ChevronDown className="w-4 h-4 text-[18px] text-[#222]" /> */}
              </button>
            </div>

            <div className="d-none d-md-block me-3 flex-shrink-0">
              <Link
                href={`/${locale}/dashboard/add-property`}
                className="btn-two"
              >
                <span className="px-2">{t("Add Listing")}</span>{" "}
                <i className="fa-thin fa-arrow-up-right"></i>
              </Link>
            </div>
            <div className="user-data position-relative flex-shrink-0  mx-3">
              <button
                className="user-avatar online position-relative rounded-circle dropdown-toggle"
                type="button"
                id="profile-dropdown"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                <Image src={dashboardAvatar} alt="" className="lazy-img " />
              </button>
              <Profile locale={locale} />
            </div>
          </div>
        </div>
      </header>
      <DashboardHeaderOne isActive={isActive} setIsActive={setIsActive} />
    </>
  );
};

export default DashboardHeaderTwo;
