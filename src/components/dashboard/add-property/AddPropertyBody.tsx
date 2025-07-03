"use client";
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo";
import Overview from "./Overview";
import ListingDetails from "./ListingDetails";
import Link from "next/link";
import SelectAmenities from "./SelectAmenities";
import AddressAndLocation from "../profile/AddressAndLocation";

const AddPropertyBody = ({ token }: { token: string }) => {
  return (
    <div className="dashboard-body">
      <div className="position-relative">
        <DashboardHeaderTwo title="Create Property" />
        <Overview token={token} />
      </div>
    </div>
  );
};

export default AddPropertyBody;
