import DashboardSavedSearch from "@/components/dashboard/Statistics";
import Wrapper from "@/layouts/Wrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
   title: "Dashboard Saved Search Homy - Real Estate React Next js Template",
};
const index = async() => {
   const cookieStore = await cookies();
   const user = JSON.parse(cookieStore.get("user")?.value || "{}");
   const token = cookieStore.get("token")?.value;
   if (user.role !== "agent") {
      redirect("/");
   }
   return (
      <Wrapper>
         <DashboardSavedSearch token={token as string} />
      </Wrapper>
   )
}

export default index