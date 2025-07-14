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
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo";
// src/app/[locale]/dashboard/edit-property/components/tabs/FloorPlanTab.tsx
export default function PropertyDetailsPage({ token }: { token: string }) {
  const t = useTranslations("properties");
  const params = useParams();
  const propertyId = params?.id as string;

  // const { property, loading, toast } = useProperty(propertyId, token);
  const { property, propertystat, loading, toast, refetch } = useProperty(
    propertyId,
    token
  );

  const [activeTab, setActiveTab] = useState<TabType>("main");

  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case "main":
        return propertystat ? (
          <MainTab
            token={token}
            property={property}
            propertystat={propertystat}
          />
        ) : null;
      case "amenities":
        return (
          <AmenitiesTab refetch={refetch} property={property} token={token} />
        );
      case "features":
        return (
          <FeaturesTab refetch={refetch} property={property} token={token} />
        );
      case "locations":
        return (
          <LocationTab
            refetch={refetch}
            property={property}
            token={token as string}
          />
        );
      case "images":
        return (
          <ImagesTab refetch={refetch} property={property} token={token} />
        );
      case "floorplan":
        return (
          <FloorPlanTab refetch={refetch} property={property} token={token} />
        );
      default:
        return propertystat ? (
          <MainTab
            token={token}
            property={property}
            propertystat={propertystat}
          />
        ) : null;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return <NotFoundMessage />;
  }

  return (
   <div className="dashboard-body " style={{ marginTop: -80 }}>
            <DashboardHeaderTwo title="Edit Property" />

    <div className=" bg-red-500 text-dark p-4 ">
      {toast.show && (
        <Toast message={toast?.message} type={toast?.type} duration={3000} />
      )}

      <div className="container bg-red-500 rounded b overflow-hidden">
        <div className=" m-0 my-2 p-0">
          <div className="d-flex flex-wrap mb-4 ">
            {PROPERTY_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                label={t(tab.label)}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${
                  activeTab === tab.id ? "btn-primary" : "btn-light"
                }`}
              />
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content bg-white p-5 ">{renderTabContent()}</div>
        </div>
      </div>
    </div>
    </div>
  );
}
