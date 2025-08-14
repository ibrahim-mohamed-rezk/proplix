import { getData } from "@/libs/server/backendServer";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const ListingDropdownModal = ({
  handleAmenitiesChange,
  handlePaymentMethodChange,
  handleFurnishingChange,
  handleSizeChange,
  handleResetFilter,
  filters,
}: any) => {
  const t = useTranslations("properties");
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    filters?.amenities || []
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    filters?.payment_method || ""
  );
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>(
    filters?.furnishing || ""
  );
  const [size, setSize] = useState<string>(filters?.size || "");
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

  // Update selected amenities when filters change
  useEffect(() => {
    setSelectedAmenities(filters?.amenities || []);
  }, [filters?.amenities]);

  // Update selected payment method when filters change
  useEffect(() => {
    setSelectedPaymentMethod(filters?.payment_method || "");
  }, [filters?.payment_method]);

  // Update selected furnishing when filters change
  useEffect(() => {
    setSelectedFurnishing(filters?.furnishing || "");
  }, [filters?.furnishing]);

  // Update size when filters change
  useEffect(() => {
    setSize(filters?.size || "");
  }, [filters?.size]);

  const handleAmenityToggle = (amenityId: number) => {
    const updatedAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter((id) => id !== amenityId)
      : [...selectedAmenities, amenityId];

    setSelectedAmenities(updatedAmenities);
    handleAmenitiesChange(updatedAmenities);
  };

  const handlePaymentSelect = (paymentId: string) => {
    // Single select - if clicking the same, deselect it
    const newSelection = selectedPaymentMethod === paymentId ? "" : paymentId;
    setSelectedPaymentMethod(newSelection);
    handlePaymentMethodChange(newSelection);
  };

  const handleFurnishingSelect = (furnishingId: string) => {
    // Single select - if clicking the same, deselect it
    const newSelection =
      selectedFurnishing === furnishingId ? "" : furnishingId;
    setSelectedFurnishing(newSelection);
    handleFurnishingChange(newSelection);
  };

  const handleSizeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSize(value);
    handleSizeChange(value);
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
                            <div className="d-flex align-items-center" style={{ maxWidth: 320 }}>
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
                                placeholder={t("size_placeholder") || "Enter size"}
                                value={size}
                                onChange={handleSizeInput}
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
                                sqft
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
                                      background: selectedAmenities.includes(
                                        amenity.id
                                      )
                                        ? "#FF6B35"
                                        : "white",
                                      color: selectedAmenities.includes(
                                        amenity.id
                                      )
                                        ? "white"
                                        : "#333",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      fontSize: "14px",
                                      fontWeight: selectedAmenities.includes(
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
                                        !selectedAmenities.includes(amenity.id)
                                      ) {
                                        e.currentTarget.style.borderColor =
                                          "#FF6B35";
                                        e.currentTarget.style.color = "#FF6B35";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (
                                        !selectedAmenities.includes(amenity.id)
                                      ) {
                                        e.currentTarget.style.borderColor =
                                          "#ddd";
                                        e.currentTarget.style.color = "#333";
                                      }
                                    }}
                                  >
                                    {amenity.title}
                                    {selectedAmenities.includes(amenity.id) && (
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
                                        selectedPaymentMethod === method.id
                                          ? "#FF6B35"
                                          : "white",
                                      color:
                                        selectedPaymentMethod === method.id
                                          ? "white"
                                          : "#333",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      fontSize: "14px",
                                      fontWeight:
                                        selectedPaymentMethod === method.id
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
                                      if (selectedPaymentMethod !== method.id) {
                                        e.currentTarget.style.borderColor =
                                          "#FF6B35";
                                        e.currentTarget.style.color = "#FF6B35";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (selectedPaymentMethod !== method.id) {
                                        e.currentTarget.style.borderColor =
                                          "#ddd";
                                        e.currentTarget.style.color = "#333";
                                      }
                                    }}
                                  >
                                    {method.title}
                                    {selectedPaymentMethod === method.id && (
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
                                        selectedFurnishing === option.id
                                          ? "#FF6B35"
                                          : "white",
                                      color:
                                        selectedFurnishing === option.id
                                          ? "white"
                                          : "#333",
                                      cursor: "pointer",
                                      transition: "all 0.3s ease",
                                      fontSize: "14px",
                                      fontWeight:
                                        selectedFurnishing === option.id
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
                                      if (selectedFurnishing !== option.id) {
                                        e.currentTarget.style.borderColor =
                                          "#FF6B35";
                                        e.currentTarget.style.color = "#FF6B35";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (selectedFurnishing !== option.id) {
                                        e.currentTarget.style.borderColor =
                                          "#ddd";
                                        e.currentTarget.style.color = "#333";
                                      }
                                    }}
                                  >
                                    {option.title}
                                    {selectedFurnishing === option.id && (
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
