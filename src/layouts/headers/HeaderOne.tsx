"use client";
import { Link, routing, usePathname, useRouter } from "@/i18n/routing";
import NavMenu from "./Menu/NavMenu";
import UseSticky from "@/hooks/UseSticky";
import LoginModal from "@/modals/LoginModal";
import axios from "axios";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { UserTypes } from "@/libs/types/types";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";

const HeaderOne = ({
  style,
  token,
}: {
  style?: boolean;
  token?: string | null;
}) => {
  const { sticky } = UseSticky();
  const t = useTranslations("header");
  const [showDropdown, setShowDropdown] = useState(false);
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const [user, setUser] = useState<UserTypes | null>(null);

  const logout = async () => {
    await axios.post("/api/auth/logout", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    window.location.href = "/";
  };

  const flagMap: Record<string, string> = {
    en: "gb",
    ar: "sa",
  };

  const feachUser = async () => {
    const res = await axios.get("/api/auth/getToken", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setUser(JSON.parse(res.data.user));
  };

  useEffect(() => {
    feachUser();
  }, []);

  const changeLanguage = (l: string) => {
    const paramsString = searchParams.toString();
    const url = paramsString ? `${pathname}?${paramsString}` : pathname;

    router.replace(url, { locale: l });
    setLangOpen(false);
  };

  return (
    <>
      <header
        className={`theme-main-menu mw-100 menu-overlay menu-style-one sticky-menu ${
          sticky ? "fixed" : ""
        }`}
      >
        {/* {!style && (
          <div className="alert-wrapper text-center">
            <p className="fs-16 m0 text-white">
              <Link href="/listing_01" className="fw-500">
                {t("flash sale")}
              </Link>{" "}
              {t("go on The offer will end in")}{" "}
              <span> {t("This Sunday")}</span>
            </p>
          </div>
        )} */}
        <div className="inner-content gap-one">
          <div className="top-header position-relative">
            <div className="d-flex align-items-center justify-content-between">
              <div className="logo order-lg-0">
                <Link href="/" className="d-flex align-items-center">
                  <svg
                    style={{
                      width: "clamp(150px,10.78125vw,207px)",
                      height: "clamp(45px,3.125vw,60px)",
                    }}
                    viewBox="0 0 207 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23.8976 0.846404L23.7678 0.75L23.6381 0.860179L0 20.9811V47.816L19.3229 58.8543C21.303 59.9905 23.761 58.5444 23.761 56.2444V51.1075V43.285V43.3263C23.7679 43.1197 23.761 42.9131 23.761 42.7134C23.6586 38.809 22.6071 36.3645 22.1701 35.5106C22.1018 35.3867 22.0541 35.2972 22.0199 35.2352C22.0063 35.2145 21.9926 35.1939 21.9789 35.1663V35.1595C21.856 34.9391 21.7263 34.7256 21.5966 34.519C19.1932 30.656 15.5266 27.6812 11.1772 26.1801C17.179 24.1074 21.897 19.2183 23.7678 13.076C25.6387 19.2183 30.3499 24.1005 36.3585 26.1801C32.0091 27.6812 28.3425 30.656 25.9391 34.519H48V17.9444L23.9044 0.853286L23.8976 0.846404Z"
                      fill="#F26A3F"
                    />
                    <path
                      d="M85.2817 11.6515C83.6499 10.8852 81.7804 10.502 79.6598 10.502H68V41.6367H73.7275V30.142H79.6598C81.7738 30.142 83.6433 29.7589 85.2618 28.9926C86.8803 28.2263 88.1487 27.1098 89.0868 25.6499C90.0183 24.1899 90.4873 22.4261 90.4873 20.365C90.4873 18.3039 90.0249 16.4542 89.1066 14.9942C88.1884 13.5343 86.9134 12.4178 85.2817 11.6515ZM84.152 22.8291C83.7226 23.5557 83.1281 24.1173 82.375 24.5202C81.6219 24.9232 80.7432 25.128 79.7391 25.128H73.7209V15.5161H79.7391C80.7432 15.5161 81.6219 15.7209 82.375 16.1238C83.1281 16.5268 83.716 17.0883 84.152 17.7952C84.5814 18.5087 84.7994 19.3476 84.7994 20.3253C84.7994 21.303 84.5814 22.109 84.152 22.8357V22.8291Z"
                      fill="#231F20"
                    />
                    <path
                      d="M101.867 19.6516C101.001 20.1669 100.314 20.986 99.7991 22.1091V18.8985H94.6133V41.6368H100.129V28.9728C100.129 27.2486 100.605 25.9076 101.55 24.9629C102.494 24.0182 103.75 23.5426 105.309 23.5426H107.271V18.6541H105.936C104.351 18.6541 102.99 18.991 101.86 19.6582L101.867 19.6516Z"
                      fill="#231F20"
                    />
                    <path
                      d="M127.469 19.9488C125.659 18.9182 123.624 18.4029 121.365 18.4029C119.105 18.4029 117.117 18.9182 115.307 19.9488C113.497 20.9793 112.043 22.3864 110.96 24.1701C109.876 25.9537 109.328 27.9884 109.328 30.2741C109.328 32.5598 109.87 34.5945 110.96 36.3782C112.043 38.1618 113.503 39.5689 115.327 40.5995C117.15 41.6301 119.165 42.1453 121.365 42.1453C123.564 42.1453 125.612 41.6301 127.422 40.5995C129.232 39.5689 130.686 38.1618 131.769 36.3782C132.853 34.5945 133.401 32.5598 133.401 30.2741C133.401 27.9884 132.866 25.9207 131.789 24.1502C130.719 22.3798 129.272 20.9793 127.462 19.9488H127.469ZM126.867 33.8018C126.326 34.8456 125.586 35.6647 124.654 36.2461C123.723 36.834 122.626 37.1247 121.371 37.1247C120.116 37.1247 119.059 36.834 118.108 36.2461C117.163 35.6581 116.417 34.8456 115.875 33.8018C115.333 32.758 115.062 31.5821 115.062 30.2675C115.062 28.9529 115.333 27.7902 115.875 26.7597C116.417 25.7291 117.163 24.9232 118.108 24.3352C119.052 23.7473 120.142 23.4566 121.371 23.4566C122.6 23.4566 123.716 23.7473 124.654 24.3352C125.586 24.9232 126.326 25.7291 126.867 26.7597C127.409 27.7902 127.68 28.9595 127.68 30.2675C127.68 31.5755 127.409 32.7514 126.867 33.8018Z"
                      fill="#231F20"
                    />
                    <path
                      d="M155.807 19.9884C154.076 18.9314 152.14 18.4029 150 18.4029C148.243 18.4029 146.697 18.7464 145.362 19.4269C144.292 19.9752 143.4 20.6952 142.687 21.5937V18.905H137.501V50H143.017V39.4566C143.691 40.1701 144.49 40.7448 145.422 41.1808C146.802 41.8216 148.315 42.1453 149.954 42.1453C152.153 42.1453 154.115 41.6235 155.846 40.5797C157.57 39.5359 158.938 38.109 159.942 36.2989C160.946 34.4888 161.448 32.4806 161.448 30.2807C161.448 28.0809 160.94 26.0462 159.922 24.2626C158.905 22.4789 157.531 21.0586 155.807 20.0016V19.9884ZM154.928 33.8216C154.373 34.8522 153.613 35.6581 152.649 36.2461C151.684 36.834 150.581 37.1247 149.326 37.1247C148.071 37.1247 147.047 36.834 146.089 36.2461C145.131 35.6581 144.378 34.8522 143.83 33.8216C143.288 32.7911 143.017 31.6086 143.017 30.2675C143.017 28.9265 143.288 27.7902 143.83 26.7597C144.371 25.7291 145.124 24.9232 146.089 24.3352C147.053 23.7473 148.13 23.4566 149.326 23.4566C150.522 23.4566 151.684 23.7473 152.649 24.3352C153.613 24.9232 154.366 25.7291 154.928 26.7597C155.483 27.7902 155.767 28.9595 155.767 30.2675C155.767 31.5755 155.489 32.7911 154.928 33.8216Z"
                      fill="#231F20"
                    />
                    <path
                      d="M171.101 10H165.585V41.6367H171.101V10Z"
                      fill="#231F20"
                    />
                    <path
                      d="M181.634 18.9051H176.118V41.6433H181.634V18.9051Z"
                      fill="#231F20"
                    />
                    <path
                      d="M181.634 10.502H176.118V16.3551H181.634V10.502Z"
                      fill="#231F20"
                    />
                    <path
                      d="M207 18.9051H200.605L195.822 25.967L191.04 18.9051H184.599L192.585 30.2279L184.645 41.6367H191.079L195.822 34.5682L200.566 41.6367H206.96L199.059 30.2279L207 18.9051Z"
                      fill="#231F20"
                    />
                  </svg>
                </Link>
              </div>

              <div className="right-widget flex gap-2 items-center justify-center ms-auto ms-lg-0 me-3 me-lg-0 order-lg-3">
                {/* language switcher */}
                <div className="relative">
                  <button
                    onClick={() => setLangOpen((o) => !o)}
                    className="flex btn-one lang items-center shadow border border-primary-200 rounded-[clamp(12px,.5vw,24px)] font-['Gordita']  justify-center gap-[8px] transition-all duration-200 focus:outline-none"
                  >
                    <span
                      className={`fi fi-${flagMap[locale]} !fill-[#FF6725] mr-1`}
                    />
                    <Image
                      src={`/images/${locale}.svg`}
                      alt="Flag"
                      width={30}
                      height={20}
                      className="rounded shadow-sm border border-gray-200"
                    />
                    <span className="font-['Gordita'] capitalize  text-[#FF6725] font-bold text-[18px] tracking-wider">
                      {locale}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[18px] text-[#FF6725]" />
                  </button>
                  <div ref={langRef}>
                    <div
                      className={`absolute rounded-[8px] z-30 mt-2 border border-gray-200 bg-white bg-opacity-95 backdrop-blur-md rounded-2xl shadow-2xl transform origin-top-left transition-all duration-200 ${
                        langOpen
                          ? "opacity-100 scale-100 pointer-events-auto"
                          : "opacity-0 scale-95 pointer-events-none"
                      }`}
                    >
                      <ul className="divide-y !m-[0px] !p-[0px] divide-gray-100">
                        {routing.locales.map((l) => (
                          <li key={l}>
                            <button
                              onClick={() => changeLanguage(l)}
                              className="w-full flex items-center gap-[5px] justify-center px-3 py-2 hover:bg-primary-50 hover:text-primary-700 transition-colors rounded-2xl"
                            >
                              <Image
                                src={`/images/${l}.svg`}
                                alt="Flag"
                                width={30}
                                height={20}
                                className="rounded shadow border border-gray-200"
                              />
                              <span className={`fi fi-${flagMap[l]} mr-2 `} />
                              <span className="capitalize font-semibold font-['Libre_Baskerville'] text-[clamp(13px,1vw,20px)] w-fit flex-1">
                                {l}
                              </span>
                              {l === locale && (
                                <Check className="w-[18px] h-[18px] text-primary-500" />
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* auth buttons or user icon */}
                {token ? (
                  <div className="d-flex align-items-center auth-btns-container gap-2">
                    <div className="position-relative me-[10px]">
                      {/* user icon  */}
                      <div
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="user-icon border-2 border-primary-200 hover:border-primary-400 bg-white/80 shadow-md rounded-full justify-content-center p-2 d-flex align-items-center cursor-pointer transition-all duration-150"
                        style={{ minWidth: 40, minHeight: 40 }}
                      >
                        <i className="fa-regular fa-user text-primary-600 text-lg"></i>
                      </div>
                      {showDropdown && (
                        <div
                          className={`dropdown-menu !min-w-fit !w-fit show position-absolute end-1/2 transform ${
                            locale === "ar"
                              ? "-translate-x-1/2"
                              : "translate-x-1/2"
                          } mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn`}
                        >
                          <Link
                            href={
                              user?.role === "customer"
                                ? "/my-profile?page=personal-information"
                                : "/dashboard/profile"
                            }
                            className="dropdown-item justify-center !w-fit !flex items-center gap-[8px] px-4 py-3 hover:bg-primary-50 transition-colors"
                          >
                            <i className="fa-regular fa-user text-primary-500"></i>
                            <span className="font-medium">{t("Profile")}</span>
                          </Link>
                          <button
                            onClick={logout}
                            className="dropdown-item !flex items-center justify-center gap-2 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors w-full"
                          >
                            <i className="fa-regular fa-right-from-bracket"></i>
                            <span className="font-medium">{t("Logout")}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {/* add listing btn */}
                    {user?.role !== "customer" && (
                      <li className="d-none d-md-inline-block ms-3">
                        <Link
                          href="/dashboard/add-property"
                          className="btn-two add-listing bg-gradient-to-r from-[#FF6725] to-[#F26A3F] text-white font-bold px-5 py-2 rounded-xl shadow hover:scale-105 transition-transform"
                          target="_blank"
                        >
                          <span>{t("Add Listing")}</span>{" "}
                          <i className="fa-thin reverse fa-arrow-up-right"></i>
                        </Link>
                      </li>
                    )}
                  </div>
                ) : (
                  <ul className="d-flex gap-2 align-items-center style-none">
                    <li className="hidden lggin-btn-descktop">
                      <Link
                        href="#"
                        data-bs-toggle="modal"
                        data-bs-target="#loginModal"
                        className="btn-one login-btn hover:text-[#FF6725] !min-w-[100px] flex items-center justify-center gap-1 px-1 py-1 rounded-xl bg-white text-primary-700 border border-primary-200 shadow  transition-all"
                      >
                        <i className="fa-regular fa-lock"></i>
                        <span className="font-semibold hover:!text-[#FF6725] !hover:text-black">
                          {t("login")}
                        </span>
                      </Link>
                    </li>
                    <li className="hidden lggin-btn-descktop">
                      <Link
                        href="/signup-agent"
                        className="btn-one bg-gradient-to-r from-[#FF6725] to-[#F26A3F] !text-[#fff] flex items-center justify-center gap-1 px-1 py-1 rounded-xl shadow font-semibold hover:scale-105 transition-transform"
                      >
                        <i className="fa-regular fa-lock"></i>
                        <span className="text-[16px]">{t("signup as agent")}</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </div>

              <nav className="navbar navbar-expand-lg p0 order-lg-2">
                <button
                  className="navbar-toggler d-block d-lg-none"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  aria-controls="navbarNav"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
                >
                  <span></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                  <NavMenu />
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <LoginModal />
    </>
  );
};

export default HeaderOne;
