import FooterFour from "@/layouts/footers/FooterFour"
import ListingFifteenArea from "./ListingFifteenArea"
import HeaderOne from "@/layouts/headers/HeaderOne"
import { cookies } from "next/headers";

const ListingEleven = async ({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
   }) => {
     const cookiesData = await cookies();
     const token = cookiesData.get("token")?.value;
     const filters = await searchParams;
  return (
    <>
      <HeaderOne token={token} style={true} />
      <ListingFifteenArea />
      <FooterFour />
    </>
  );
};

export default ListingEleven;
