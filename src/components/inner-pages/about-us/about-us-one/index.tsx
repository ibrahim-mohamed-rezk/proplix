import BreadcrumbOne from "@/components/common/breadcrumb/BreadcrumbOne";
import HeaderOne from "@/layouts/headers/HeaderOne";
import BLockFeatureOne from "./BLockFeatureOne";
// import VideoBanner from "@/components/homes/home-seven/VideoBanner"
import BLockFeatureFive from "@/components/homes/home-one/BLockFeatureFive";
// import Feedback from "@/components/homes/home-five/Feedback"
// import AgentArea from "@/components/homes/home-one/AgentArea"
// import Brand from "./Brand"
// import FooterFour from "@/layouts/footers/FooterFour"
import FancyBanner from "@/components/common/FancyBanner";
import FooterOne from "@/layouts/footers/FooterOne";
// import HomeBLockFeatureOne from "@/components/homes/home-one/BLockFeatureOne";
import { getTranslations } from "next-intl/server";

const AboutUsOne = async () => {
  const t = await getTranslations("endUser.about");
  return (
    <>
      <HeaderOne style={true} />
      <BreadcrumbOne title={t("title")} sub_title={t("title")} style={false} />
      <BLockFeatureOne   />
      {/* <VideoBanner /> */}
      <BLockFeatureFive style={true} />
      {/* <HomeBLockFeatureOne /> */}
      {/* <Feedback style={true} /> */}
      {/* <AgentArea style={false} /> */}
      {/* <Brand /> */}
      <FancyBanner style={false} />
      <FooterOne />
    </>
  );
};

export default AboutUsOne;
