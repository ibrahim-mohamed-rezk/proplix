import DashboardBody from "./DashboardBody"
import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne"


const DashboardIndex = ({ token }: { token: string }) => {
  return (
    <>
      <DashboardHeaderOne />
      <DashboardBody token={token} />
    </>
  )
}

export default DashboardIndex
