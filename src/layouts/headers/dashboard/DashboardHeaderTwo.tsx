"use client"
import Image from "next/image"
import Link from "next/link"
import Notification from "./Notification";
import Profile from "./Profile";
import { useState } from "react";
import DashboardHeaderOne from "./DashboardHeaderOne";
import { useTranslations } from "next-intl";

import dashboardIcon_1 from "@/assets/images/dashboard/icon/icon_43.svg";
import dashboardIcon_2 from "@/assets/images/dashboard/icon/icon_11.svg";
import dashboardAvatar from "@/assets/images/dashboard/avatar_01.jpg";

const DashboardHeaderTwo = ({ title }: any) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const t = useTranslations('DashboardHeaderTwo');
  return (
    <>
      <header className="dashboard-header">
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="m0 d-none d-lg-block">{t(title)}</h4>
            <div className="d-flex align-items-center">
              <div className="d-none d-md-block me-3">
                <Link href="/add-property" className="btn-two"><span>{t("Add Listing")}</span> <i className="fa-thin fa-arrow-up-right"></i></Link>
              </div>
              <div className="user-data position-relative">
                <button className="user-avatar online position-relative rounded-circle dropdown-toggle" type="button" id="profile-dropdown" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                  <Image src={dashboardAvatar} alt="" className="lazy-img" />
                </button>
                <Profile />
              </div>
            </div>
          </div>
        </header>
        <DashboardHeaderOne isActive={isActive} setIsActive={setIsActive} />
      </>
  )
}

export default DashboardHeaderTwo