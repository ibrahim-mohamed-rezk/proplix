import React from 'react';
import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo"


const Statistics = () => {
  return (
    <>
      <DashboardHeaderOne />

        <DashboardHeaderTwo title="Account Settings" />
      <div>

        <h1>Statistics Page</h1>
        {/* Example content */}
        <div className="stat-item">
          <h2>Total Sales</h2>
          <p>1500</p>
        </div>
        <div className="stat-item">
          <h2>Total Listings</h2>
          <p>200</p>
        </div>
        <div className="stat-item">
          <h2>Active Clients</h2>
          <p>500</p>
        </div>
      </div>
    </>
  );
};

export default Statistics;
