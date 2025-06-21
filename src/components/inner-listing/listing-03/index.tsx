import FancyBanner from "@/components/common/FancyBanner";
import ListingThreeArea from "./ListingThreeArea";
import HeaderOne from "@/layouts/headers/HeaderOne";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";
import FooterOne from "@/layouts/footers/FooterOne";

const ListingSix = async ({
 
  searchParams, 
}: {
 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const cookiesData = await cookies();
  const token = cookiesData.get("token")?.value;
  const filters = await searchParams;

 

  
  return (
    <>
      <HeaderOne token={token} style={true} />
      <ListingThreeArea style={false}  />
      <FancyBanner />
      <FooterOne style={false} />
    </>
  );
};

export default ListingSix;
