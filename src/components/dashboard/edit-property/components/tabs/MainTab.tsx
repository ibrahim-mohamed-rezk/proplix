import React from 'react';
import Image from 'next/image';
import { PropertyData } from '../../PropertyTypes';
import { ReadOnlyField } from '../TabButton';
import { useTranslations } from 'next-intl';

interface MainTabProps {
  token: string;
  property: PropertyData;
  propertystat: { data: { count_call: number; count_whatsapp: number } };
}

export const MainTab: React.FC<MainTabProps> = ({ property, token, propertystat }) => {

  const t = useTranslations("properties");

  return (
    <div className="mb-4">
      {/* Property Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="h3 font-weight-bold text-dark mb-2">
              {t("property_title")}: {property?.data?.descriptions?.en?.title}
            </h2>
          </div>
          <div className="text-right">
            <div className="h3 font-weight-bold text-primary">
              EGP {property?.data?.price?.toLocaleString()}
            </div>
            {property?.data?.down_price && (
              <div className="text-muted">
                {t("down_price")}: EGP {property?.data?.down_price?.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Details Grid */}
      <div className="row mb-4">
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField label={t("bedroom")} value={property?.data?.bedroom} />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField label={t("bathroom")} value={property?.data?.bathroom} />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField label={t("kitichen")} value={property?.data?.kitichen} />
        </div>
        <div className="col-12 col-md-6 col-lg-3 mb-3">
          <ReadOnlyField label={t("sqt")} value={`${property?.data?.sqt} sq ft`} />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="form-label font-weight-medium text-dark mb-2">{t("description")}</label>
        <div 
          className="w-100 p-4 border rounded bg-light border-muted text-dark min-h-100 shadow-sm"
          dangerouslySetInnerHTML={{ __html: property?.data?.descriptions?.en?.description }}
        />
      </div>

      {/* Property Statistics */}
      <div className="mb-4">
        <h3 className="h5 font-weight-semibold text-dark mb-3">{t("property_statistics")}</h3>
        <div className="d-flex justify-content-between">
          <div className="text-muted">
            <strong>{t("count_call")}: </strong>{propertystat?.data?.count_call}
          </div>
          <div className="text-muted">
            <strong>{t("count_whatsapp")}: </strong>{propertystat?.data?.count_whatsapp}
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="mb-4">
        <h3 className="h5 font-weight-semibold text-dark mb-3">{t("owner_information")}</h3>
        <div className="card shadow-sm border-muted rounded">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              {property?.data?.user?.avatar && (
                <Image
                  src={property?.data?.user?.avatar}
                  alt={property?.data?.user?.name}
                  width={60}
                  height={60}
                  className="rounded-circle"
                />
              )}
              <div>
                <div className="font-weight-medium text-dark">
                  {property?.data?.user?.name}
                </div>
                <div className="text-muted">
                  {property?.data?.user?.email}
                </div>
                {property?.data?.user?.phone ? (
                  <div className="text-muted py-2">
                    {property?.data?.user?.phone}
                  </div>
                ) : (
                  <div className="text-muted font-weight-bold">
                    {t("phone_not_found")}
                  </div>
                )}
                <label className="text-muted font-weight-bold">{t("module")}</label>
                <div className="text-muted row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 py-2">
                  {property?.data?.user?.modules.map((module, index) => (
                    <div className="col mb-2" key={index}>
                      <div className="border rounded p-2">{module as unknown as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
