import FooterOne from "@/layouts/footers/FooterOne";
import HeaderOne from "@/layouts/headers/HeaderOne";
import Banner from "./Banner";
import Feedback from "./Feedback";
import BLockFeatureOne from "./BLockFeatureOne";
import BLockFeatureTwo from "./BLockFeatureTwo";
import BLockFeatureThree from "./BLockFeatureThree";
import Property from "./Property";
import FancyBannerOne from "./FancyBannerOne";
import AgentArea from "./AgentArea";
import BLockFeatureFour from "./BLockFeatureFour";
import BLockFeatureFive from "./BLockFeatureFive";
import FancyBannerThree from "./FancyBannerThree";
import FancyBanner from "@/components/common/FancyBanner";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";

const HomeOne = async () => {
  const token = (await cookies()).get("token")?.value;
  const feachData = async () => {
    try {
      const response = await getData("home", {}, {});
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  const homeData = await feachData();
  
  return (
    <>
      <HeaderOne token={token} style={false} />
      <Banner />
      <Feedback />
      <BLockFeatureOne />
      <BLockFeatureTwo />
      {/* location */}
      <BLockFeatureThree />
      <Property />
      <FancyBannerOne style={false} />
      <AgentArea style={false} />
      <BLockFeatureFour />
      <BLockFeatureFive style={false} />
      <FancyBanner style={false} />
      <FancyBannerThree />
      <FooterOne style={false} />
    </>
  );
};

export default HomeOne;
