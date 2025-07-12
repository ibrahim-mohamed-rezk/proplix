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
    property?.property_listing_images && property.property_listing_images.length > 0
      ? property.property_listing_images.map((img: any) => img.image)
      : [DEFAULT_IMAGE];

  const gallery_data: DataType = {
    big_carousel: images,
    small_carousel: images,
  };

  const { big_carousel, small_carousel } = gallery_data;

  return (
    <div className="media-gallery mt-[50px]">
      <div id="media_slider" className="carousel slide row">
        <div className="col-lg-10">
          <div className={` bg-white  md-mb-20 ${style ? "" : "shadow4 p-30"}`}>
            <div className="position-relative z-1 overflow-hidden ">
              <div className={`img-fancy-btn ms-[50px] rounded-[10px] fw-500 fs-16 color-dark`}>
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
                  {(property?.property_listing_images && property.property_listing_images.length > 0
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

              <div className="carousel-inner">
                {big_carousel?.map((carousel, index) => (
                  <div
                    key={index}
                    className="carousel-item items-stretch active"
                  >
                    <img src={carousel} alt="" className="w-[100%] h-[100%] " />
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
          >
            {small_carousel?.map((carousel, i) => (
              <button
                key={i}
                type="button"
                data-bs-target="#media_slider"
                data-bs-slide-to={`${i}`}
                className="active"
                aria-current="true"
                aria-label={`Slide ${i + 1}`}
              >
                <img src={carousel} alt="" className="w-[100%] h-[100%] " />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGallery;
