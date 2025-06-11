"use client"
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo"
import NiceSelect from "@/ui/NiceSelect";
import PropertyTableBody from "./PropertyTableBody";
import Link from "next/link";
import Image from "next/image";
import { deleteData, getData, postData } from "@/libs/server/backendServer";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const PropertyListBody = ({ token }: { token: string }) => {
  const [properties, setProperties] = useState([]);
  const t = useTranslations("table");
  const tProps = useTranslations("properties");

  useEffect(() => {
    const fetchProperties = async () => {
      const response = await getData(
        "agent/property_listings",
        {},
         { Authorization: `Bearer ${token}` });
      setProperties(response.data.data);
    };
    fetchProperties();
  }, [token]);

  const selectHandler = (e: any) => { };

  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title={t("my_properties")} />
        <h2 className="main-title d-block d-lg-none">{t("my_properties")}</h2>
        <div className="bg-white card-box p0">
          <div className="table-responsive pt-25 pb-25 pe-4 ps-4">
            <table className="table property-list-table">
              <thead>
                <tr>
                  <th scope="col">{t("title")}</th>
                  <th scope="col">{t("date")}</th>
                  <th scope="col">{t("view")}</th>
                  <th scope="col">{tProps("Status")}</th>
                  <th scope="col">{t("action")}</th>
                </tr>
              </thead>
              <PropertyTableBody properties={properties} token={token} />
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyListBody