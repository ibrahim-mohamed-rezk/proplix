import HeaderOne from "@/layouts/headers/HeaderOne";
import ListingDetailsOneArea from "./ListingDetailsOneArea";
import FancyBanner from "@/components/common/FancyBanner";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";
import Script from "next/script";
import FooterOne from "@/layouts/footers/FooterOne";

const ListingDetailsOne = async ({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) => {
  const token = (await cookies()).get("token")?.value;

  const feachData = async () => {
    try {
      const response = await getData(
        `properties/${slug}`,
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

  const propertyData = await feachData();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: propertyData?.property?.title,
    description: propertyData?.property?.description,
    image: propertyData?.property?.images?.map((img: any) => img.url) || [],
    brand: {
      "@type": "Organization",
      name: "ARX Real Estate Development",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: propertyData?.property?.price,
      itemCondition: "https://schema.org/NewCondition",
      availability: "https://schema.org/InStock",
      url: `https://example.com/properties/${slug}`,
    },
  };

  return (
    <>
      <Script
        id="property-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HeaderOne token={token} style={true} />
      <ListingDetailsOneArea token={token as string}
        property={propertyData?.property}
        similar={propertyData?.similar}
      />
      <FancyBanner />
      <FooterOne />
    </>
  );
};

export default ListingDetailsOne;