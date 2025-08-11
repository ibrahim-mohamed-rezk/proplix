import BlogDetailsArea from "./BlogDetailsArea";
import FancyBanner from "@/components/common/FancyBanner";
import HeaderOne from "@/layouts/headers/HeaderOne";
import FooterOne from "@/layouts/footers/FooterOne";

const BlogDetails = ({ token }: { token: string | null }) => {
  return (
    <>
      <HeaderOne token={token} />
      <BlogDetailsArea />
      <FancyBanner />
      <FooterOne />
    </>
  );
};

export default BlogDetails;
