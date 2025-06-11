import BlogDetails from "@/components/blogs/blog-details";
import Wrapper from "@/layouts/Wrapper";
import { cookies } from "next/headers";

export const metadata = {
  title: "Blog Details Problix - Real Estate React Next js Template",
};
const index = async () => {
   const cookieStore = await cookies();
   const token = cookieStore.get("token");
   return (
      <Wrapper>
         <BlogDetails token={token?.value || null} />
      </Wrapper>
   )
}

export default index