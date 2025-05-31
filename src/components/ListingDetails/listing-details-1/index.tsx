import HeaderOne from "@/layouts/headers/HeaderOne";
import ListingDetailsOneArea from "./ListingDetailsOneArea";
import FancyBanner from "@/components/common/FancyBanner";
import FooterFour from "@/layouts/footers/FooterFour";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";

const ListingDetailsOne = async ({slug, locale}:{slug:string, locale:string}) => {
  const token = (await cookies()).get("token")?.value;
  
  const feachData = async () => {
    try {
      const response = await getData(`properties/${slug}`, {}, {
        lang: locale,
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
  
  const propertyData = await feachData()

  return (
    <>
      <HeaderOne token={token} style={true} />
      <ListingDetailsOneArea property={propertyData} />
      <FancyBanner />
      <FooterFour />
    </>
  );
};

export default ListingDetailsOne;