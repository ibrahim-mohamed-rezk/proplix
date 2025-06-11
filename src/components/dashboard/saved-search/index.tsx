import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import SavedSearchBody from "./SavedSearchBody";

const DashboardSavedSearch = ({ token }: { token: string }) => {
   return (
      <>
         <DashboardHeaderOne />
         <SavedSearchBody token={token} />
      </>
   )
}

export default DashboardSavedSearch;
