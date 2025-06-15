"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

const DashboardHeaderTwo = ({ title }: any) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const t = useTranslations("DashboardHeaderTwo");

  return (
    <>
      <header className="dashboard-header">
        <div className="d-flex align-items-center justify-content-start">
          <h4 className="mt-3 d-none d-lg-block text-end display-5">{t(title)}</h4>

        </div>
      </header>
    </>
  );
};

export default DashboardHeaderTwo;
