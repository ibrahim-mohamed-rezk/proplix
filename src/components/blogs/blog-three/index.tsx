import BreadcrumbOne from "@/components/common/breadcrumb/BreadcrumbOne"
import FooterFour from "@/layouts/footers/FooterFour"
import HeaderOne from "@/layouts/headers/HeaderOne"
import BlogThreeArea from "./BlogThreeArea"
import FancyBanner from "@/components/common/FancyBanner"
import { cookies } from "next/headers";

const BlogThree = () => {
  const token = cookies().get("token")?.value;
  return (
    <>
      <HeaderOne token={token} style={true} />
      <BreadcrumbOne title="Blog Full Width" link="#" sub_title="Blog" style={true} />
      <BlogThreeArea />
      <FancyBanner />
         <FooterFour />
      </>
   )
}

export default BlogThree
