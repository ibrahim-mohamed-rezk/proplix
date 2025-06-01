"use client";
import React, { useState } from "react";
import { PropertyTypes } from "@/libs/types/types";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface FavoritesProps {
  properties: PropertyTypes[];
}

const Favorites: React.FC<FavoritesProps> = ({ properties }) => {
  const [activeTab, setActiveTab] = useState<"rent" | "sell">("rent");
  const t = useTranslations("Favorites");

  const filteredProperties = properties.filter(
    (property) => property.status.toLowerCase() === activeTab
  );

  return (
    <div className="w-full px-4 md:px-6 lg:px-8">
      <div className="max-w-[960px] mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              {t("title")}
            </h1>
          </div>
          <div className="rounded-[78px]  outline-1 outline-offset-[-1px] outline-orange-500 flex justify-start items-center">
            <button
              onClick={() => setActiveTab("rent")}
              className={`px-6 md:px-12 py-2 rounded-[57px] flex justify-center items-center gap-2.5 transition-colors ${
                activeTab === "rent" ? "bg-orange-500 text-white" : "text-black"
              }`}
            >
              <span className="text-base md:text-lg font-medium">
                {t("forRent")}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("sell")}
              className={`px-6 md:px-12 py-2 rounded-[57px] flex justify-center items-center gap-2.5 transition-colors ${
                activeTab === "sell" ? "bg-orange-500 text-white" : "text-black"
              }`}
            >
              <span className="text-base md:text-lg font-medium">
                {t("forSell")}
              </span>
            </button>
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="w-full p-5 bg-white rounded-3xl flex flex-col gap-4"
            >
              <div className="relative h-72 w-full">
                <Image
                  src={
                    property.image ||
                    "/assets/images/property/property-placeholder-1.jpg"
                  }
                  alt={property.title}
                  fill
                  className="rounded-[20px] object-cover"
                />
                <div className="absolute top-4 left-4 flex justify-between items-end w-[calc(100%-32px)]">
                  <div className="px-3 py-1.5 bg-orange-500 rounded-3xl">
                    <span className="text-white text-xs font-medium">
                      {property.status.toUpperCase()}
                    </span>
                  </div>
                  <button className="w-6 h-6 bg-orange-500 rounded-full" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-black/40 text-base font-medium">
                    {property.type.title}
                  </span>
                  <h3 className="text-orange-500 text-2xl font-medium">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 relative">
                      <div className="w-2 h-2 left-[8.25px] top-[6px] absolute bg-neutral-500" />
                      <div className="w-4 h-5 left-[3.75px] top-[1.50px] absolute bg-neutral-500" />
                    </div>
                    <span className="text-neutral-500 text-base">
                      {property.area.name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border border-black/40" />
                    <span className="text-black text-base">
                      {property.sqt} sqft
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image
                      src="/assets/images/icons/bedroom.svg"
                      alt="Bedroom"
                      width={32}
                      height={32}
                      className="rounded-3xl"
                    />
                    <span className="text-black text-base">
                      {property.bedroom} bed
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/assets/images/icons/bathroom.svg"
                      alt="Bathroom"
                      width={16}
                      height={16}
                      className="rounded-[5px]"
                    />
                    <span className="text-black text-base">
                      {property.bathroom} bath
                    </span>
                  </div>
                </div>

                <div className="h-px bg-neutral-400" />

                <div className="flex justify-between items-center">
                  <span className="text-black text-3xl font-medium">
                    {property.price.toLocaleString()}{" "}
                    {property.status === "rent" ? "EGP/month" : "EGP"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Image
                        src="/assets/images/icons/phone.svg"
                        alt="Call"
                        width={28}
                        height={28}
                        className="text-white"
                      />
                    </button>
                    <button className="p-2 bg-orange-500 rounded-[61px]">
                      <Image
                        src="/assets/images/icons/message.svg"
                        alt="Message"
                        width={32}
                        height={32}
                        className="text-white"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
