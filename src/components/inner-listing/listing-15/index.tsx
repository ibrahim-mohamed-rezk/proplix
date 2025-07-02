import ListingFifteenArea from "./ListingFifteenArea"
import HeaderOne from "@/layouts/headers/HeaderOne"
import { cookies } from "next/headers";
import FooterOne from "@/layouts/footers/FooterOne";

const ListingEleven = async () => {
     const cookiesData = await cookies();
     const token = cookiesData.get("token")?.value;
  return (
    <>
      <HeaderOne token={token} style={true} />
      <ListingFifteenArea />
      <FooterOne />
    </>
  );
};

export default ListingEleven;
