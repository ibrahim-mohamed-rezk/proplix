import ListingThree from "@/components/inner-listing/listing-03";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Listing Three Problix - Real Estate React Next js Template",
};
const index = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  return (
    <Wrapper>
      <ListingThree searchParams={searchParams} />
    </Wrapper>
  );
};

export default index;
