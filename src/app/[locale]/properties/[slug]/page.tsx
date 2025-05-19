import ListingDetailsOne from "@/components/ListingDetails/listing-details-1";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
   title: "Listing Details One Homy - Real Estate React Next js Template",
};
const index = async ({ params }: { params: Promise<{ slug: string, locale: string }> }) => {
   const { slug, locale } = await params;
   return (
      <Wrapper>
         <ListingDetailsOne locale={locale} slug={slug} />
      </Wrapper>
   )
}

export default index