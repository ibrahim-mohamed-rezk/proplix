import BreadcrumbOne from "@/components/common/breadcrumb/BreadcrumbOne"
import HeaderOne from "@/layouts/headers/HeaderOne"
import BlogThreeArea from "./BlogThreeArea"
import FancyBanner from "@/components/common/FancyBanner"
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server"
import FooterOne from "@/layouts/footers/FooterOne"

const BlogThree = async () => {
  const token = (await cookies()).get("token")?.value;
  const t = await getTranslations("endUser")
  return (
    <>
      <HeaderOne token={token} style={true} />
      <BreadcrumbOne
        title={t("Blogs")}
        link="#"
        sub_title={t("Blogs")}
        style={true}
      />
      <BlogThreeArea />
      <FancyBanner />
      <FooterOne />
    </>
  );
};

export default BlogThree;
