import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne"
import AddPropertyBody from "./AddPropertyBody"

const DashboardAddProperty = ({ token }: { token: string }) => {
   return (
      <>
         <DashboardHeaderOne />
         <AddPropertyBody token={token} />  
      </>
   )
}

export default DashboardAddProperty
