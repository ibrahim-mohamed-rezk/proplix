import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";
import AccountSettingBody from "./AccountSettingBody";

const DashboardAccountSetting = ({ token }: { token: string }) => {
   return (
      <>
         <DashboardHeaderOne />
         <AccountSettingBody token={token as string}/>
      </>
   )
}

export default DashboardAccountSetting;
