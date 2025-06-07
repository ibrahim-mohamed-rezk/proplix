import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne"
import PropertyListBody from "./PropertyListBody"

const PropertyList = ({ token }: { token: string }) => {
   return (
      <>
         <DashboardHeaderOne />
         <PropertyListBody token={token} />
      </>
   )
}

export default PropertyList
