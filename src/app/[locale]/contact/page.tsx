import Contact from "@/components/inner-pages/contact";
import Wrapper from "@/layouts/Wrapper";
import { cookies } from "next/headers";

export const metadata = {
  title: "Contact Problix - Real Estate React Next js Template",
};
const index = async () => {
  const cookiesData = await cookies();
  const token = cookiesData.get("token")?.value;
  return (
    <Wrapper>
      <Contact token={token} />
    </Wrapper>
  );
};

export default index;
