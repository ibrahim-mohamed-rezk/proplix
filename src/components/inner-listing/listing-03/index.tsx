import FancyBanner from "@/components/common/FancyBanner";
import ListingThreeArea from "./ListingThreeArea";
import HeaderOne from "@/layouts/headers/HeaderOne";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";
import FooterOne from "@/layouts/footers/FooterOne";

const ListingSix = async ({ locale }: { locale: string }) => {
  const cookiesData = await cookies();
  const token = cookiesData.get("token")?.value;

  const feachData = async () => {
    try {
      const response = await getData(
        "properties",
        {},
        {
          lang: locale,
        }
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  };

  const propertiesData = await feachData();
  return (
    <>
      <HeaderOne token={token} style={true} />
      <ListingThreeArea style={false} properties={propertiesData} />
      <FancyBanner />
      <FooterOne style={false} />
    </>
  );
};

export default ListingSix;
