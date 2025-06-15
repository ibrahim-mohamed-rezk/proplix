import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne"
import PasswordChangeBody from "./PasswordChangeBody"

const PasswordChange = ({token}:{token:string}) => {
   return (
      <>
         <DashboardHeaderOne />
         <PasswordChangeBody token={token} />
      </>
   )
}

export default PasswordChange
