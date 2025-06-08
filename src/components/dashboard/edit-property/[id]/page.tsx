'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Toast from '@/components/Toast';
import { TabType } from '../PropertyTypes';
import { useProperty } from '../useProperty';
import { PROPERTY_TABS } from '../constants/property';
import {
  TabButton,
  LoadingSpinner,
  NotFoundMessage
} from '../components/TabButton';
import { MainTab } from '../components/tabs/MainTab';
import { AmenitiesTab } from '../components/tabs/AmenitiesTab';
import { FeaturesTab } from '../components/tabs/FeaturesTab';
import { LocationTab } from '../components/tabs/LocationsTab'; 
import { ImagesTab } from '../components/tabs/ImagesTab';
import { FloorPlanTab } from '../components/tabs/FloorPlanTab';
// src/app/[locale]/dashboard/edit-property/components/tabs/FloorPlanTab.tsx
export default function PropertyDetailsPage({ token }: { token: string }) {
  const t = useTranslations("properties");
  const params = useParams();
  const propertyId = params?.id as string;

  const { property, loading, toast } = useProperty(propertyId,token);

  const [activeTab, setActiveTab] = useState<TabType>('main');

  const renderTabContent = () => {
    if (!property) return null;

    switch (activeTab) {
      case 'main':
        return <MainTab property={property} token={token} />;
      case 'amenities':
        return <AmenitiesTab property={property} token={token} />;
      case 'features':
        return <FeaturesTab property={property} token={token}/>;
      case 'locations':
        return <LocationTab property={property} token={token}/>;
      case 'images':
        return <ImagesTab property={property} token={token}/>;
      case 'floorplan':
        return <FloorPlanTab property={property} token={token}/>;
      default:
        return <MainTab property={property} token={token}/>;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!property) {
    return <NotFoundMessage />;
  }

  return (
    <div className=" bg-light text-dark p-4 dashboard-body">
      {toast.show && (
        <Toast message={toast?.message} type={toast?.type} duration={3000} />
      )}
      
      <div className="container bg-white rounded shadow-sm overflow-hidden">
        <div className="p-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 font-weight-bold">
                {property?.data.descriptions?.en?.title}
              </h1>
              <p className="text-muted mt-2">
                {t("property_id")}: {property?.data.id} • {property?.data.type?.descriptions?.en?.title}
              </p>
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
          <div className="d-flex flex-wrap mb-4 border-bottom">
            {PROPERTY_TABS.map((tab) => (
              <TabButton
                key={tab.id}
                label={t(tab.label)}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-light'}`}
              />
            ))}
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
