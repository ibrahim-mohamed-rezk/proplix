import Fancybox from "@/components/common/Fancybox";
import { PropertyTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface DataType {
  big_carousel: string[];
  small_carousel: string[];
}

const DEFAULT_IMAGE = "/images/proprity.png";

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
  const MOBILE_THUMB_WIDTH = 100; // px: thumbnail width on mobile
  const [activeIndex, setActiveIndex] = useState(0);

  // Listen to Bootstrap carousel slide events to sync active state
  useEffect(() => {
    const carouselElement = document.getElementById("media_slider");
    if (!carouselElement) return;

    const updateActiveIndex = () => {
      const carouselItems = carouselElement.querySelectorAll(".carousel-item");
      carouselItems.forEach((item, index) => {
        if (item.classList.contains("active")) {
          setActiveIndex(index);
        }
      });
    };

    const handleSlide = () => {
      // Small delay to ensure Bootstrap has updated the active class
      setTimeout(updateActiveIndex, 50);
    };

    // Bootstrap 5 carousel events - 'slid' fires after the slide transition completes
    carouselElement.addEventListener("slid.bs.carousel", handleSlide);

    // Also listen for clicks on carousel controls
    const prevButton = carouselElement.querySelector(".carousel-control-prev");
    const nextButton = carouselElement.querySelector(".carousel-control-next");
    if (prevButton) {
      prevButton.addEventListener("click", handleSlide);
    }
    if (nextButton) {
      nextButton.addEventListener("click", handleSlide);
    }

    // Initial update
    updateActiveIndex();

    return () => {
      carouselElement.removeEventListener("slid.bs.carousel", handleSlide);
      if (prevButton) {
        prevButton.removeEventListener("click", handleSlide);
      }
      if (nextButton) {
        nextButton.removeEventListener("click", handleSlide);
      }
    };
  }, []);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index);
    const carouselElement = document.getElementById("media_slider");
    if (carouselElement) {
      // Use Bootstrap carousel instance if available
      const carousel = (window as any).bootstrap?.Carousel?.getInstance(
        carouselElement
      );
      if (carousel) {
        carousel.to(index);
      }
    }
  };

  return (
    <div className="media-gallery mt-[50px]">
      <div id="media_slider" className="carousel slide row">
        <div className="col-lg-10 order-lg-1 order-1">
          <div
            className={` bg-white  md-mb-20 ${
              style ? "" : "shadow4 media-gallery-container"
            }`}
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
                className="carousel-inner media-gallery-carousel-inner"
                style={{
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
                      className="d-block media-gallery-carousel-link"
                      style={{
                        width: "100%",
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

        {/* Desktop Vertical Sidebar */}
        <div className="col-lg-2 order-lg-2 order-2 d-none d-lg-block">
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
                onClick={() => handleThumbnailClick(i)}
                className={`${i === activeIndex ? "active" : ""}`}
                aria-current={i === activeIndex ? "true" : undefined}
                aria-label={`Slide ${i + 1}`}
                style={{
                  padding: 0,
                  marginBottom: 10,
                  width: "100%",
                  opacity: i === activeIndex ? 1 : 0.7,
                  transition: "opacity 0.2s ease, border-color 0.2s ease",
                  border:
                    i === activeIndex
                      ? "2px solid #FF6625"
                      : "2px solid transparent",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <img
                  src={carousel}
                  alt={`${t("photos")} ${i + 1}`}
                  className="w-[100%] h-[100%] "
                  style={{
                    width: "100%",
                    height: THUMB_HEIGHT,
                    objectFit: "cover",
                    borderRadius: 6,
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

        {/* Mobile Horizontal Scrollable Thumbnails */}
        <div className="col-12 order-lg-3 order-3 d-lg-none mt-3">
          <div
            className={`w-100 ${
              style ? "" : "bg-white shadow4"
            } rounded-[12px] p-3`}
          >
            <div
              className="d-flex gap-2 overflow-x-auto overflow-y-hidden pb-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e0 #f7fafc",
                WebkitOverflowScrolling: "touch",
                scrollBehavior: "smooth",
                paddingRight: "8px",
                paddingLeft: "8px",
                marginLeft: "-8px",
                marginRight: "-8px",
              }}
            >
              {small_carousel?.map((carousel, i) => (
                <button
                  key={i}
                  type="button"
                  data-bs-target="#media_slider"
                  data-bs-slide-to={`${i}`}
                  onClick={() => handleThumbnailClick(i)}
                  className={`flex-shrink-0 ${
                    i === activeIndex ? "active" : ""
                  }`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  aria-label={`Slide ${i + 1}`}
                  style={{
                    padding: 0,
                    width: MOBILE_THUMB_WIDTH,
                    height: MOBILE_THUMB_WIDTH,
                    minWidth: MOBILE_THUMB_WIDTH,
                    border:
                      i === activeIndex
                        ? "2px solid #FF6625"
                        : "2px solid transparent",
                    borderRadius: 8,
                    overflow: "hidden",
                    transition: "border-color 0.2s ease, opacity 0.2s ease",
                    cursor: "pointer",
                    opacity: i === activeIndex ? 1 : 0.7,
                  }}
                >
                  <img
                    src={carousel}
                    alt={`${t("photos")} ${i + 1}`}
                    className="w-[100%] h-[100%]"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 6,
                      pointerEvents: "none",
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
    </div>
  );
};

export default MediaGallery;
