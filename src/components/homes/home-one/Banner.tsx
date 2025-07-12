"use client";
import Image from "next/image";

import titleShape from "@/assets/images/shape/shape_01.svg";
import bannerThumb from "@/assets/images/assets/ils_01.svg";
import { useTranslations } from "next-intl";
import DropdownTwo from "@/components/search-dropdown/inner-dropdown/DropdownTwo";
import { useEffect, useState } from "react";

const Banner = () => {
  const t = useTranslations("home");
  const [filters, setFilters] = useState<{
    [key: string]: string | number | null;
  }>({
    status: "sale",
    price: null,
    down_price: null,
  });
  const handleResetFilter = (): void => {
    setFilters({});
  };

  // save filters
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  // handle status change
  const handleSearchChange = (e: { target: { value: string } }) => {
    if (e.target.value === "") {
      setFilters({ ...filters, location: null });
    } else {
      setFilters({ ...filters, location: e.target.value });
    }
  };

  // handle price change
  const handlePriceChange = (e: { target: { value: string } }) => {
    if (e.target.value === "") {
      setFilters({ ...filters, price: null });
    } else {
      setFilters({ ...filters, price: e.target.value });
    }
  };

  // handle range change
  const handlerangeChange = (value: string) => {
    if (value === "all") {
      setFilters({ ...filters, price: null, down_price: null });
    } else {
      setFilters({
        ...filters,
        price: value.split("-")[0],
        down_price: value.split("-")[1],
      });
    }
  };

  // handle price change
  const handleDown_priceChange = (e: { target: { value: string } }) => {
    if (e.target.value === "") {
      setFilters({ ...filters, down_price: null });
    } else {
      setFilters({ ...filters, down_price: e.target.value });
    }
  };

  // handle status change
  const handleAgentChange = (e: { target: { value: string } }) => {
    if (e.target.value === "all") {
      setFilters({ ...filters, user_id: null });
    } else {
      setFilters({ ...filters, user_id: e.target.value });
    }
  };
  const handleTypesChange = (e: { target: { value: string } }) => {
    if (e.target.value === "all") {
      setFilters({ ...filters, type_id: null });
    } else {
      setFilters({ ...filters, type_id: e.target.value });
    }
  };

  const changeStatus = (status: string) => {
    setFilters({ ...filters, status });
    localStorage.setItem("status", status);
  };

  // handle location change
  const handleLocationChange = (e: { target: { value: string } }) => {
    if (e.target.value === "all") {
      setFilters({ ...filters, area_id: null });
    } else {
      setFilters({ ...filters, area_id: e.target.value });
    }
  };
  
  return (
    <div className="hero-banner-one bg-pink z-1 pt-225 xl-pt-200 pb-250 xl-pb-150 lg-pb-100 position-relative">
      <div className="container position-relative">
        <div className="row">
          <div className="col-xxl-10 col-xl-9 col-lg-10 col-md-10 m-auto">
            <h1 className="hero-heading text-center wow fadeInUp">
              {t("banner.title")}
              <span className="d-inline-block position-relative">
                <Image src={titleShape} alt="" className="lazy-img" />
              </span>
            </h1>
            <p
              className="fs-24 color-dark text-center pt-35 pb-35 wow fadeInUp"
              data-wow-delay="0.1s"
            >
              {t("banner.description")}
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-xxl-10 m-auto">
            <div className="search-wrapper-one rounded-[20px] layout-one bg relative mb-75 md-mb-50">
              {/* status filters */}
              <div className="px-[4px] pt-[4px] z-0 absolute -top-[20px] start-[70px] bg-white rounded-tl-[16px] rounded-tr-[16px] inline-flex justify-end items-start">
                <div
                  onClick={() => changeStatus("sale")}
                  className={`px-[32px] py-[8px] ${
                    filters.status && filters.status === "sale"
                      ? "bg-[#FF6625]"
                      : "bg-[#FFE2D6]"
                  } rounded-tl-[8px] flex justify-center items-center gap-2.5 cursor-pointer`}
                >
                  <div
                    className={`justify-start ${
                      filters.status && filters.status === "sale"
                        ? "text-white"
                        : "text-neutral-950"
                    } text-base font-medium font-['Gordita'] leading-normal`}
                  >
                    Sell
                  </div>
                </div>
                <div
                  onClick={() => changeStatus("rent")}
                  className={`px-[32px] py-[8px] ${
                    filters.status && filters.status === "rent"
                      ? "bg-[#FF6625]"
                      : "bg-[#FFE2D6]"
                  } rounded-tr-[8px] flex justify-center items-center gap-2.5 cursor-pointer`}
                >
                  <div
                    className={`justify-start ${
                      filters.status && filters.status === "rent"
                        ? "text-white"
                        : "text-neutral-950"
                    } text-base font-medium font-['Gordita'] leading-normal`}
                  >
                    Rent
                  </div>
                </div>
              </div>

              <div className="bg-wrapper relative border-layout">
                <DropdownTwo
                  handleAgentChange={handleAgentChange}
                  handleSearchChange={handleSearchChange}
                  handlePriceChange={handlePriceChange}
                  handleResetFilter={handleResetFilter}
                  handleLocationChange={handleLocationChange}
                  handleTypesChange={handleTypesChange}
                  handleDown_priceChange={handleDown_priceChange}
                  handlerangeChange={handlerangeChange}
                  filters={filters}
                  popup={false}
                />
              </div>
            </div>
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
