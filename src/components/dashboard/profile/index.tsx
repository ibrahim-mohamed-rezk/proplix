import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne"
import ProfileBody from "./ProfileBody"

      const DashboardProfile = ({ token }: { token: string }) => {
   return (
      <>
         <DashboardHeaderOne />
         <ProfileBody token={token} />
      </>
   )
}

export default DashboardProfile
