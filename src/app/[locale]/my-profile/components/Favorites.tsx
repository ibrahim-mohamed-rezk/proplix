"use client";
import React, { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getData } from "@/libs/server/backendServer";
import { PropertyTypes } from "@/libs/types/types";
import PropertiesCard from "@/components/cards/PropertiesCard";

const Favorites = ({ token }: { token: string }) => {
  const [activeTab, setActiveTab] = useState<"rent" | "sell">("rent");
  const [favourites, setFavourites] = useState<PropertyTypes[]>([]);
  const t = useTranslations("Favorites");
  const locale = useLocale();

  useEffect(() => {
    const feachData = async () => {
      try {
        const response = await getData(
          `favourites?status=${activeTab}`,
          {},
          {
            lang: locale,
            Authorization: `Bearer ${token}`,
          }
        );
        setFavourites(response.data.data);
      } catch (error) {
        throw error;
      }
    };

    feachData();
  }, [token, locale, activeTab]);

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-[960px] mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex justify-between items-center sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              {t("title")}
            </h1>
          </div>
          <div className="rounded-[78px]  outline-1 outline-offset-[-1px] outline-[#FF6625] flex justify-start items-center">
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-[clamp(16px,2.5vw,48px)] py-2 rounded-[57px] flex justify-center items-center gap-2.5 transition-colors ${
                activeTab === "rent" ? "bg-[#FF6625] text-white" : "text-black"
              }`}
            >
              <span className="text-base md:text-lg font-medium">
                {t("forRent")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sell")}
              className={`px-[clamp(16px,2.5vw,48px)] py-2 rounded-[57px] flex justify-center items-center gap-2.5 transition-colors ${
                activeTab === "sell" ? "bg-[#FF6625] text-white" : "text-black"
              }`}
            >
              <span className="text-base md:text-lg font-medium">
                {t("forSell")}
              </span>
            </button>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="row gx-xxl-5">
          {favourites?.map((item: PropertyTypes) => (
            <PropertiesCard  key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
