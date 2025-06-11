import DashboardMembership from "@/components/dashboard/membership";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Dashboard Membership Problix - Real Estate React Next js Template",
};
const index = () => {
   return (
      <Wrapper>
         <DashboardMembership />
      </Wrapper>
   )
}

export default index