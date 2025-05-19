import ListingThree from "@/components/inner-listing/listing-03";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Listing Three Homy - Real Estate React Next js Template",
};
const index = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  return (
    <Wrapper>
      <ListingThree locale={locale} />
    </Wrapper>
  );
};

export default index;