import Fancybox from "@/components/common/Fancybox";
import { PropertyTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";

interface DataType {
  big_carousel: string[];
  small_carousel: string[];
}

const DEFAULT_IMAGE = "/images/proprity.jpg";

const MediaGallery = ({
  style,
  property,
}: {
  style?: boolean;
  property?: PropertyTypes;
}) => {
  const t = useTranslations("endUser");
  const locale = useLocale();

  // Get images or fallback to default image
  const images =
    property?.property_listing_images &&
    property.property_listing_images.length > 0
      ? property.property_listing_images.map((img: any) => img.image)
      : [DEFAULT_IMAGE];

  const gallery_data: DataType = {
    big_carousel: images,
    small_carousel: images,
  };

  const { big_carousel, small_carousel } = gallery_data;
  const MAIN_BOX_HEIGHT = 720; // px: fixed display box height
  const THUMB_HEIGHT = 120; // px: uniform thumbnail height

  return (
    <div className="media-gallery mt-[50px]">
      <div id="media_slider" className="carousel slide row">
        <div className="col-lg-10">
          <div
            className={` bg-white  md-mb-20 ${
              style ? "" : "shadow4 p-30"
            } rounded-[12px]`}
          >
            <div className="position-relative z-1 overflow-hidden ">
              <div
                className={`img-fancy-btn ms-[50px] rounded-[10px] fw-500 fs-16 color-dark`}
              >
                {`${t("see_all")} ${
                  property?.property_listing_images?.length || 1
                } ${t("photos")}`}
                <Fancybox
                  options={{
                    Carousel: {
                      infinite: true,
                    },
                  }}
                >
                  {(property?.property_listing_images &&
                  property.property_listing_images.length > 0
                    ? property.property_listing_images
                    : [{ image: DEFAULT_IMAGE }]
                  ).map((thumb: any, index: any) => (
                    <a
                      key={index}
                      className="d-block"
                      data-fancybox="img2"
                      href={thumb.image}
                    ></a>
                  ))}
                </Fancybox>
              </div>

              <div
                className="carousel-inner"
                style={{
                  height: MAIN_BOX_HEIGHT,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {big_carousel?.map((carousel, index) => (
                  <div
                    key={index}
                    className={`carousel-item items-stretch ${
                      index === 0 ? "active" : ""
                    }`}
                  >
                    <a
                      target="_blank"
                      data-fancybox="img2"
                      href={carousel}
                      className="d-block"
                      style={{
                        width: "100%",
                        height: MAIN_BOX_HEIGHT,
                        borderRadius: 12,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={carousel}
                        alt={`${t("photos")} ${index + 1}`}
                        className="w-[100%] h-[100%] "
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "100%",
                        }}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        onError={(e: any) => {
                          if (e?.currentTarget?.src !== DEFAULT_IMAGE) {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }
                        }}
                      />
                    </a>
                  </div>
                ))}
              </div>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#media_slider"
                data-bs-slide="prev"
              >
                <i className="bi bi-chevron-left"></i>
                <span className="visually-hidden">Previous</span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#media_slider"
                data-bs-slide="next"
              >
                <i className="bi bi-chevron-right"></i>
                <span className="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-2">
          <div
            className={`carousel-indicators position-relative p-15 w-100 h-100 ${
              style ? "" : "     bg-white shadow4"
            }`}
            style={{ maxHeight: MAIN_BOX_HEIGHT + 60, overflowY: "auto" }}
          >
            {small_carousel?.map((carousel, i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#media_slider"
                data-bs-slide-to={`${i}`}
                className={`${i === 0 ? "active" : ""}`}
                aria-current={i === 0 ? "true" : undefined}
                aria-label={`Slide ${i + 1}`}
                style={{ padding: 0, marginBottom: 10, width: "100%" }}
              >
                <img
                  src={carousel}
                  alt={`${t("photos")} ${i + 1}`}
                  className="w-[100%] h-[100%] "
                  style={{
                    width: "100%",
                    height: THUMB_HEIGHT,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                  loading="lazy"
                  decoding="async"
                  onError={(e: any) => {
                    if (e?.currentTarget?.src !== DEFAULT_IMAGE) {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
