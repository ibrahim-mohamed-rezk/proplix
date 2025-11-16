import { getData } from "@/libs/server/backendServer";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";

const ListingDropdownModal = ({
  handleResetFilter,
  filters,
  setFilters,
}: any) => {
  const t = useTranslations("properties");
  const [amenities, setAmenities] = useState([]);
  const locale = useLocale();
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 576);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const paymentMethodOptions = [
    { id: "cash", title: t("cash") || "Cash" },
    { id: "installment", title: t("installment") || "Installment" },
  ];

  const furnishingOptions = [
    { id: "all", title: t("all") || "All" },
    { id: "furnished", title: t("furnished") || "Furnished" },
    { id: "unfurnished", title: t("unfurnished") || "Unfurnished" },
    {
      id: "partly-furnished",
      title: t("partly_furnished") || "Partly Furnished",
    },
  ];

  // fetch amenities from api
  useEffect(() => {
    const fetchAmenities = async () => {
      const response = await getData("amenities", {}, { lang: locale });
      setAmenities(response.data.data);
    };
    fetchAmenities();
  }, [locale]);

  const handleAmenityToggle = (amenityId: number) => {
    const currentAmenities = Array.isArray(filters?.amenities)
      ? (filters.amenities as number[])
      : [];

    const updatedAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter((id: number) => id !== amenityId)
      : [...currentAmenities, amenityId];

    setFilters({
      ...filters,
      amenities: updatedAmenities,
    });
  };

  const handlePaymentSelect = (paymentId: string) => {
    // Single select - if clicking the same, deselect it
    const newSelection = filters?.payment_method === paymentId ? "" : paymentId;
    setFilters({ ...filters, payment_method: newSelection || null });
  };

  const handleFurnishingSelect = (furnishingId: string) => {
    // Single select - if clicking the same, deselect it
    const newSelection =
      filters?.furnishing === furnishingId ? "" : furnishingId;
    setFilters({ ...filters, furnishing: newSelection || null });
  };

  return (
    <div
      className="modal fade"
      id="advanceFilterModal"
      tabIndex={-1}
      aria-hidden="true"
      style={{ zIndex: 1051 }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        style={{
          zIndex: 1052,
          maxWidth: "90%",
          margin: "1rem auto",
        }}
      >
        <div className="container-fluid px-2 px-md-3 px-lg-4">
          <div className="row">
            <div className="col-12 col-lg-10 col-xl-8 m-auto">
              <div
                className="modal-content"
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  maxHeight: "90vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <button
                  type="button"
                  className="btn-close ms-auto mt-3 mt-md-4 mt-lg-5 me-3 me-md-4"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  style={{
                    fontSize: "1.25rem",
                    padding: "0.5rem",
                    flexShrink: 0,
                  }}
                >
                  <i className="fa-regular fa-xmark"></i>
                </button>
                <div
                  className="advance-search-panel px-3 px-md-4 px-lg-5 pb-4 pb-md-5"
                  style={{
                    overflowY: "auto",
                    overflowX: "hidden",
                    maxHeight: "calc(90vh - 80px)",
                  }}
                >
                  <div className="main-bg border-0">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <div className="row gx-lg-5">
                        {/* size */}
                        <div className="col-12">
                          <div className="w-full mt-45">
                            <h6 className="block-title fw-bold mb-20">
                              {t("size")}
                            </h6>
                            <div
                              className="d-flex align-items-center"
                              style={{
                                maxWidth: 420,
                                position: "relative",
                              }}
                            >
                              <div style={{ position: "relative", flex: 1 }}>
                                <input
                                  type="number"
                                  className="form-control size-input"
                                  style={{
                                    borderRadius: "25px 0 0 25px",
                                    border: "2px solid #e8e8e8",
                                    padding: "12px 20px",
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    outline: "none",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                                    width: "100%",
                                    minWidth: 0,
                                    height: "50px",
                                    transition: "all 0.3s ease",
                                    backgroundColor: "#fff",
                                  }}
                                  placeholder={t("min_size") || "Min size"}
                                  value={filters?.min_size || ""}
                                  onChange={(e) =>
                                    setFilters({
                                      ...filters,
                                      min_size: e.target.value,
                                    })
                                  }
                                  min={0}
                                />
                              </div>

                              <div style={{ position: "relative", flex: 1 }}>
                                <input
                                  type="number"
                                  className="form-control size-input"
                                  style={{
                                    borderRadius: "0",
                                    border: "2px solid #e8e8e8",
                                    borderLeft: "none",
                                    padding: "12px 20px",
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    outline: "none",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                                    width: "100%",
                                    minWidth: 0,
                                    height: "50px",
                                    transition: "all 0.3s ease",
                                    backgroundColor: "#fff",
                                  }}
                                  placeholder={t("max_size") || "Max size"}
                                  value={filters?.max_size || ""}
                                  onChange={(e) =>
                                    setFilters({
                                      ...filters,
                                      max_size: e.target.value,
                                    })
                                  }
                                  min={0}
                                />
                              </div>
                              <span
                                className="d-flex align-items-center justify-content-center size-unit"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #FF6B35 0%, #FF8C61 100%)",
                                  border: "2px solid #FF6B35",
                                  borderLeft: "none",
                                  borderRadius: "0 25px 25px 0",
                                  fontSize: "14px",
                                  color: "#fff",
                                  fontWeight: 600,
                                  height: "50px",
                                  minWidth: "75px",
                                  padding: "0 20px",
                                  boxShadow:
                                    "0 2px 8px rgba(255, 107, 53, 0.2)",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                  position: "relative",
                                  zIndex: 1,
                                }}
                              >
                                {t("sqft")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* amenities */}
                        <div className="col-12">
                          <div className="w-full mt-3 mt-md-4 mt-lg-5">
                            <h6
                              className="block-title fw-bold mb-3 mb-md-4"
                              style={{
                                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                              }}
                            >
                              {t("amenities")}
                            </h6>
                            <div className="amenities-list">
                              <div
                                className="d-flex flex-wrap gap-2"
                                style={{ gap: "clamp(0.5rem, 1.5vw, 0.75rem)" }}
                              >
                                {amenities?.map((amenity: any) => (
                                  <button
                                    key={amenity.id}
                                    type="button"
                                    onClick={() =>
                                      handleAmenityToggle(amenity.id)
                                    }
                                    className="amenity-tag"
                                    style={{
                                      padding:
                                        "clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)",
                                      border: "1px solid #ddd",
                                      borderRadius: "25px",
                                      background: filters?.amenities?.includes(
                                        amenity.id
                                      )
                                        ? "#FF6B35"
                                        : "white",
                                      color: filters?.amenities?.includes(
                                        amenity.id
                                      )
                                        ? "white"
                                        : "#333",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      fontSize: "clamp(12px, 2vw, 14px)",
                                      fontWeight: filters?.amenities?.includes(
                                        amenity.id
                                      )
                                        ? "500"
                                        : "normal",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "clamp(4px, 1vw, 6px)",
                                      userSelect: "none",
                                      outline: "none",
                                      position: "relative",
                                      minHeight: "36px",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (
                                        !filters?.amenities?.includes(
                                          amenity.id
                                        )
                                      ) {
                                        e.currentTarget.style.borderColor =
                                          "#FF6B35";
                                        e.currentTarget.style.color = "#FF6B35";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (
                                        !filters?.amenities?.includes(
                                          amenity.id
                                        )
                                      ) {
                                        e.currentTarget.style.borderColor =
                                          "#ddd";
                                        e.currentTarget.style.color = "#333";
                                      }
                                    }}
                                  >
                                    {amenity.title}
                                    {filters?.amenities?.includes(
                                      amenity.id
                                    ) && (
                                      <i
                                        className="fa-solid fa-check"
                                        style={{
                                          fontSize: "clamp(10px, 1.5vw, 12px)",
                                        }}
                                      ></i>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* payment methods - single select */}
                        <div className="col-12">
                          <div className="w-full mt-3 mt-md-4 mt-lg-5">
                            <h6
                              className="block-title fw-bold mb-3 mb-md-4"
                              style={{
                                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                              }}
                            >
                              {t("payment_method")}
                            </h6>
                            <div className="payment-methods-list">
                              <div
                                className="d-flex flex-wrap gap-2"
                                style={{ gap: "clamp(0.5rem, 1.5vw, 0.75rem)" }}
                              >
                                {paymentMethodOptions.map((method: any) => (
                                  <button
                                    key={method.id}
                                    type="button"
                                    onClick={() =>
                                      handlePaymentSelect(method.id)
                                    }
                                    className="payment-method-tag"
                                    style={{
                                      padding:
                                        "clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)",
                                      border: "1px solid #ddd",
                                      borderRadius: "25px",
                                      background:
                                        filters?.payment_method === method.id
                                          ? "#FF6B35"
                                          : "white",
                                      color:
                                        filters?.payment_method === method.id
                                          ? "white"
                                          : "#333",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      fontSize: "clamp(12px, 2vw, 14px)",
                                      fontWeight:
                                        filters?.payment_method === method.id
                                          ? "500"
                                          : "normal",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "clamp(4px, 1vw, 6px)",
                                      userSelect: "none",
                                      outline: "none",
                                      position: "relative",
                                      minHeight: "36px",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (
                                        filters?.payment_method !== method.id
                                      ) {
                                        e.currentTarget.style.borderColor =
                                          "#FF6B35";
                                        e.currentTarget.style.color = "#FF6B35";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (
                                        filters?.payment_method !== method.id
                                      ) {
                                        e.currentTarget.style.borderColor =
                                          "#ddd";
                                        e.currentTarget.style.color = "#333";
                                      }
                                    }}
                                  >
                                    {method.title}
                                    {filters?.payment_method === method.id && (
                                      <i
                                        className="fa-solid fa-check"
                                        style={{
                                          fontSize: "clamp(10px, 1.5vw, 12px)",
                                        }}
                                      ></i>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* furnishing - single select */}
                        <div className="col-12">
                          <div className="w-full mt-3 mt-md-4 mt-lg-5">
                            <h6
                              className="block-title fw-bold mb-3 mb-md-4"
                              style={{
                                fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
                              }}
                            >
                              {t("furnishing")}
                            </h6>
                            <div className="furnishing-list">
                              <div
                                className="d-flex flex-wrap gap-2"
                                style={{ gap: "clamp(0.5rem, 1.5vw, 0.75rem)" }}
                              >
                                {furnishingOptions.map((option: any) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                      handleFurnishingSelect(option.id)
                                    }
                                    className="furnishing-tag"
                                    style={{
                                      padding:
                                        "clamp(6px, 1.5vw, 8px) clamp(12px, 2.5vw, 16px)",
                                      border: "1px solid #ddd",
                                      borderRadius: "25px",
                                      background:
                                        filters?.furnishing === option.id
                                          ? "#FF6B35"
                                          : "white",
                                      color:
                                        filters?.furnishing === option.id
                                          ? "white"
                                          : "#333",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      fontSize: "clamp(12px, 2vw, 14px)",
                                      fontWeight:
                                        filters?.furnishing === option.id
                                          ? "500"
                                          : "normal",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "clamp(4px, 1vw, 6px)",
                                      userSelect: "none",
                                      outline: "none",
                                      position: "relative",
                                      minHeight: "36px",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => {
                                      if (filters?.furnishing !== option.id) {
                                        e.currentTarget.style.borderColor =
                                          "#FF6B35";
                                        e.currentTarget.style.color = "#FF6B35";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (filters?.furnishing !== option.id) {
                                        e.currentTarget.style.borderColor =
                                          "#ddd";
                                        e.currentTarget.style.color = "#333";
                                      }
                                    }}
                                  >
                                    {option.title}
                                    {filters?.furnishing === option.id && (
                                      <i
                                        className="fa-solid fa-check"
                                        style={{
                                          fontSize: "clamp(10px, 1.5vw, 12px)",
                                        }}
                                      ></i>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* search */}
                        <div className="col-12">
                          <button
                            className="fw-500 text-uppercase tran3s apply-search w-100 mt-4 mt-md-5 mb-3 mb-md-4"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            style={{
                              padding:
                                "clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)",
                              fontSize: "clamp(14px, 2vw, 16px)",
                              minHeight: "clamp(44px, 8vw, 50px)",
                              borderRadius: "25px",
                            }}
                          >
                            <i className="fa-light fa-magnifying-glass"></i>
                            <span>{t("search")}</span>
                          </button>
                        </div>

                        {/* reset filter */}
                        <div className="col-12">
                          <div className="d-flex justify-content-between form-widget">
                            <button
                              onClick={handleResetFilter}
                              style={{
                                cursor: "pointer",
                                padding:
                                  "clamp(8px, 1.5vw, 12px) clamp(16px, 3vw, 24px)",
                                fontSize: "clamp(13px, 1.8vw, 15px)",
                                minHeight: "clamp(40px, 7vw, 44px)",
                              }}
                              className="tran3s"
                              type="button"
                            >
                              <i className="fa-regular fa-arrows-rotate"></i>
                              <span>{t("reset_filter")}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDropdownModal;
