import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import PropertyDetailsPage from "./[id]/page";

const DashboardEditProperty = ({ token }: { token: string }) => {
  return (
    <>
      {/* <DashboardHeaderOne /> */}
      <PropertyDetailsPage token={token as string} />
    </>
  );
};

export default DashboardEditProperty;
