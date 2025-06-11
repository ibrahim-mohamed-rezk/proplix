import ListingDetailsOne from "@/components/ListingDetails/listing-details-1";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Listing Details One Problix - Real Estate React Next js Template",
};
const index = () => {
   return (
      <Wrapper>
         <ListingDetailsOne locale="en" slug="listing-details-01" />
      </Wrapper>
   )
}

export default index