import FooterOne from "@/layouts/footers/FooterOne";
import HeaderOne from "@/layouts/headers/HeaderOne";
import Banner from "./Banner";
import Feedback from "./Feedback";
import BLockFeatureOne from "./BLockFeatureOne";
import BLockFeatureTwo from "./BLockFeatureTwo";
import BLockFeatureThree from "./BLockFeatureThree";
import FancyBannerOne from "./FancyBannerOne";
import AgentArea from "./AgentArea";
import BLockFeatureFour from "./BLockFeatureFour";
import BLockFeatureFive from "./BLockFeatureFive";
import FancyBannerThree from "./FancyBannerThree";
import FancyBanner from "@/components/common/FancyBanner";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";
import Property from "./Property";

const HomeOne = async ({ locale }: { locale: string }) => {
  const token = (await cookies()).get("token")?.value;
  const user = JSON.parse((await cookies()).get("user")?.value || "{}");
  const feachData = async () => {
    try {
      const response = await getData(
        "home",
        {},
        {
          lang: locale,
        }
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  };
  const homeData = await feachData();

  return (
    <>
      <HeaderOne user={user} token={token} style={false} />
      <Banner />
      <BLockFeatureOne />
      <BLockFeatureTwo />
      {/* location */}
      <BLockFeatureThree />
      <Property
        token={token}
        listings={homeData?.data?.property_listings}
        loading={false}
      />
      <FancyBannerOne style={false} />
      <AgentArea style={false} agents={homeData.data.agents} loading={false} />
      <BLockFeatureFour />
      <BLockFeatureFive style={false} />
      <FancyBanner style={false} />
      <FancyBannerThree />
      <Feedback />

      <FooterOne style={false} />
    </>
  );
};

export default HomeOne;
