import PasswordChange from "@/components/dashboard/account-settings/password-change";
import Wrapper from "@/layouts/Wrapper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export const metadata = {
  title:
    "Dashboard Account Password Change Problix - Real Estate React Next js Template",
};
const index = async() => {
    // get user from session
    const cookieStore = await cookies();
    const user = JSON.parse(cookieStore.get("user")?.value || "{}");
    const token = cookieStore.get("token")?.value;
    console.log(user);
    if (user.role !== "agent") {
       redirect("/");
    }
   return (
      <Wrapper>
         <PasswordChange token={token as string} />
      </Wrapper>
   )
}

export default index