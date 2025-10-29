import DashboardAddProperty from "@/components/dashboard/add-property";
import Wrapper from "@/layouts/Wrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardHeaderOne from "@/layouts/headers/dashboard/DashboardHeaderOne";

export const metadata = {
  title: "Dashboard Add Property Problix - Real Estate React Next js Template",
};
const index = async () => {
  const cookieStore = await cookies();
  const user = JSON.parse(cookieStore.get("user")?.value || "{}");
  const token = cookieStore.get("token")?.value;
  if (user.role !== "agent") {
    redirect("/");
  }

  return (
    <Wrapper>
      <DashboardHeaderOne />
      <DashboardAddProperty token={token as string} />
    </Wrapper>
  );
};

export default index;
