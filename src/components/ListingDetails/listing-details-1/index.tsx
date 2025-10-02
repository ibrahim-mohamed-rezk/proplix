import HeaderOne from "@/layouts/headers/HeaderOne";
import ListingDetailsOneArea from "./ListingDetailsOneArea";
import FancyBanner from "@/components/common/FancyBanner";
import { cookies } from "next/headers";
import { getData } from "@/libs/server/backendServer";
import Script from "next/script";
import FooterOne from "@/layouts/footers/FooterOne";
import { UserTypes } from "@/libs/types/types";

const ListingDetailsOne = async ({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}) => {
  const token = (await cookies()).get("token")?.value;
  const user = JSON.parse((await cookies()).get("user")?.value || "{}");

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
    } catch (error: any) {
      console.error("Error fetching property data:", error);
      // If property not found (400 status), return null to handle gracefully
      if (error?.response?.status === 400 || error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  const propertyData = await feachData();

  // If property not found, return 404 page
  if (!propertyData) {
    return (
      <>
        <HeaderOne token={token} style={true} />
        <div className="container py-[250px]">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <h1 className="display-1 text-muted">404</h1>
              <h2 className="mb-3">Property Not Found</h2>
              <p className="lead mb-4">
                The property you&apos;re looking for doesn&apos;t exist or has been
                removed.
              </p>
              <a href="/properties" className="btn btn-primary">
                Browse Properties
              </a>
            </div>
          </div>
        </div>
        <FooterOne />
      </>
    );
  }

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
      <ListingDetailsOneArea
        user={user as UserTypes}
        token={token as string}
        property={propertyData?.property}
        similar={propertyData?.similar}
      />
      <FancyBanner />
      <FooterOne />
    </>
  );
};

export default ListingDetailsOne;
