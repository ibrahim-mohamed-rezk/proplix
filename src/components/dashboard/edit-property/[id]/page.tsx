"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Toast from "@/components/Toast";
import { TabType } from "../PropertyTypes";
import { useProperty } from "../useProperty";
import { PROPERTY_TABS } from "../constants/property";
import {
  TabButton,
  LoadingSpinner,
  NotFoundMessage,
} from "../components/TabButton";
import { MainTab } from "../components/tabs/MainTab";
import { AmenitiesTab } from "../components/tabs/AmenitiesTab";
import { FeaturesTab } from "../components/tabs/FeaturesTab";
import { LocationTab } from "../components/tabs/LocationsTab";
import { ImagesTab } from "../components/tabs/ImagesTab";
import { FloorPlanTab } from "../components/tabs/FloorPlanTab";
// src/app/[locale]/dashboard/edit-property/components/tabs/FloorPlanTab.tsx
export default function PropertyDetailsPage({ token }: { token: string }) {
  const t = useTranslations("properties");
  const params = useParams();
  const propertyId = params?.id as string;

  // const { property, loading, toast } = useProperty(propertyId, token);
  const { property, propertystat, loading, toast } = useProperty(propertyId, token);


  const [activeTab, setActiveTab] = useState<TabType>("main");

  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case "main":
        return propertystat ? <MainTab token={token} property={property} propertystat={propertystat} /> : null;
      case "amenities":
        return <AmenitiesTab property={property} token={token} />;
      case "features":
        return <FeaturesTab property={property} token={token} />;
      case "locations":
        return <LocationTab property={property} token={token} />;
      case "images":
        return <ImagesTab property={property} token={token} />;
      case "floorplan":
        return <FloorPlanTab property={property} token={token} />;
      default:
        return propertystat ? <MainTab token={token} property={property} propertystat={propertystat} /> : null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return <NotFoundMessage />;
  }

  return (
    <div className=" bg-red-500 text-dark p-4 dashboard-body">
      {toast.show && (
        <Toast message={toast?.message} type={toast?.type} duration={3000} />
      )}

      <div className="container bg-red-500 rounded b overflow-hidden">
        <div className="">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center m-4">
            <div>
              <h2 className="h3 font-weight-bold text-dark mb-2">
                {t("property_title")}: {property?.data?.descriptions?.en?.title}
              </h2>
              <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 text-center">
                <p className="mb-0 text-muted d-flex align-items-center gap-2">
                  {t("area")}:
                  <span className="badge bg-light text-dark rounded-pill px-3 py-2 shadow-sm">
                    {property?.data?.area?.description?.en?.name}
                  </span>
                </p>

                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted d-flex align-items-center gap-2">
                    {t("approval_status")}:
                    <span className="badge bg-primary bg-opacity-75 text-white rounded-pill px-3 py-2 shadow-sm">
                      {property?.data?.approval_status}
                    </span>
                  </span>

                  <span className="text-muted d-flex align-items-center gap-2">
                    {t("status")}:
                    <span className="badge bg-success bg-opacity-75 text-white rounded-pill px-3 py-2 shadow-sm">
                      {property?.data?.status}
                    </span>
                  </span>
                </div>
              </div>

            </div>
            {/* <div className="d-flex space-x-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`btn ${isFavorite ? 'btn-danger' : 'btn-secondary'} text-white`}
              >
                <Heart
                  size={20}
                  className={`mr-2 ${isFavorite ? 'fill-current' : ''}`}
                />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </button>
            </div> */}
          </div>

          {/* Tab Navigation */}
          <div className="d-flex flex-wrap mb-4 ">
            {PROPERTY_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                label={t(tab.label)}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-light"
                  }`}
              />
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content bg-white p-5">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
