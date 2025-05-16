import FooterFour from "@/layouts/footers/FooterFour"
import BlogDetailsArea from "./BlogDetailsArea"
import FancyBanner from "@/components/common/FancyBanner"
import HeaderOne from "@/layouts/headers/HeaderOne"

const BlogDetails = ({ token }: { token: string | null }) => {

   return (
      <>
         <HeaderOne token={token} />
         <BlogDetailsArea />
         <FancyBanner />
         <FooterFour />
      </>
   )
}

export default BlogDetails
