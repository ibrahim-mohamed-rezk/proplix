import { PropertyTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";

const CommonLocation = ({ property }: { property?: PropertyTypes }) => {
  const t = useTranslations("endUser");

  // Extract the google_maps link safely
  const mapsUrl = property?.area?.google_maps || "";
  let embedUrl = "";

  if (mapsUrl.includes("google.com/maps/search/")) {
    // Convert search URL to embeddable format
    const query = new URL(mapsUrl).searchParams.get("query");
    embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;
  } else {
    // fallback (if it's already an embed URL or coordinates)
    embedUrl = mapsUrl;
  }

  return (
    <>
      <h4 className="mb-40">{t("Location")}</h4>
      <div className="bg-white shadow4 p-30">
        <div className="map-banner overflow-hidden">
          <iframe
            src={embedUrl}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default CommonLocation;
