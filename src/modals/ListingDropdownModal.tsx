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
        className="modal-dialog modal-dialog-centered"
        style={{ zIndex: 1052 }}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-8 m-auto">
              <div className="modal-content">
                <button
                  type="button"
                  className="btn-close ms-auto mt-20 me-4"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fa-regular fa-xmark"></i>
                </button>
                <div className="advance-search-panel">
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
                              style={{ maxWidth: 420 }}
                            >
                              <input
                                type="number"
                                className="form-control"
                                style={{
                                  borderRadius: "25px 0 0 25px",
                                  border: "1px solid #ddd",
                                  padding: "10px 20px",
                                  fontSize: "16px",
                                  fontWeight: 500,
                                  outline: "none",
                                  boxShadow: "none",
                                  width: "100%",
                                  minWidth: 0,
                                  height: "44px",
                                }}
                                placeholder={t("min_size") || "Min size"}
                                value={filters?.min_size || ""}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    min_size: e.target.value,
                                  })
                                }
                              />
                              <span
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  background: "#fff",
                                  border: "none",
                                  borderLeft: "none",
                                  fontSize: "15px",
                                  color: "#888",
                                  fontWeight: 500,
                                  height: "44px",
                                  minWidth: "30px",
                                  padding: "0 8px",
                                }}
                              >
                                -
                              </span>
                              <input
                                type="number"
                                className="form-control"
                                style={{
                                  borderRadius: "0 0 0 0",
                                  border: "1px solid #ddd",
                                  borderLeft: "none",
                                  padding: "10px 20px",
                                  fontSize: "16px",
                                  fontWeight: 500,
                                  outline: "none",
                                  boxShadow: "none",
                                  width: "100%",
                                  minWidth: 0,
                                  height: "44px",
                                }}
                                placeholder={t("max_size") || "Max size"}
                                value={filters?.max_size || ""}
                                onChange={(e) =>
                                  setFilters({
                                    ...filters,
                                    max_size: e.target.value,
                                  })
                                }
                              />
                              <span
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  background: "#f7f7f7",
                                  border: "1px solid #ddd",
                                  borderLeft: "none",
                                  borderRadius: "0 25px 25px 0",
                                  fontSize: "15px",
                                  color: "#888",
                                  fontWeight: 500,
                                  height: "44px",
                                  minWidth: "70px",
                                  padding: "0 20px",
                                }}
                              >
                                {t("sqft")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* amenities */}
                        <div className="col-12">
                          <div className="w-full mt-30">
                            <h6 className="block-title fw-bold mb-20">
                              {t("amenities")}
                            </h6>
                            <div className="amenities-list">
                              <div className="d-flex flex-wrap gap-2">
                                {amenities?.map((amenity: any) => (
                                  <button
                                    key={amenity.id}
                                    type="button"
                                    onClick={() =>
                                      handleAmenityToggle(amenity.id)
                                    }
                                    className="amenity-tag"
                                    style={{
                                      padding: "8px 16px",
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
                                      fontSize: "14px",
                                      fontWeight: filters?.amenities?.includes(
                                        amenity.id
                                      )
                                        ? "500"
                                        : "normal",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      userSelect: "none",
                                      outline: "none",
                                      position: "relative",
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
                                        style={{ fontSize: "12px" }}
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
                          <div className="w-full mt-30">
                            <h6 className="block-title fw-bold mb-20">
                              {t("payment_method")}
                            </h6>
                            <div className="payment-methods-list">
                              <div className="d-flex flex-wrap gap-2">
                                {paymentMethodOptions.map((method: any) => (
                                  <button
                                    key={method.id}
                                    type="button"
                                    onClick={() =>
                                      handlePaymentSelect(method.id)
                                    }
                                    className="payment-method-tag"
                                    style={{
                                      padding: "8px 16px",
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
                                      fontSize: "14px",
                                      fontWeight:
                                        filters?.payment_method === method.id
                                          ? "500"
                                          : "normal",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      userSelect: "none",
                                      outline: "none",
                                      position: "relative",
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
                                        style={{ fontSize: "12px" }}
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
                          <div className="w-full mt-30">
                            <h6 className="block-title fw-bold mb-20">
                              {t("furnishing")}
                            </h6>
                            <div className="furnishing-list">
                              <div className="d-flex flex-wrap gap-2">
                                {furnishingOptions.map((option: any) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                      handleFurnishingSelect(option.id)
                                    }
                                    className="furnishing-tag"
                                    style={{
                                      padding: "8px 16px",
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
                                      fontSize: "14px",
                                      fontWeight:
                                        filters?.furnishing === option.id
                                          ? "500"
                                          : "normal",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      userSelect: "none",
                                      outline: "none",
                                      position: "relative",
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
                                        style={{ fontSize: "12px" }}
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
                            className="fw-500 text-uppercase tran3s apply-search w-full mt-40 mb-25"
                            data-bs-dismiss="modal"
                            aria-label="Close"
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
                              style={{ cursor: "pointer" }}
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
