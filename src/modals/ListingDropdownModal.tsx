import { getData } from "@/libs/server/backendServer";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const ListingDropdownModal = ({
  handlePriceChange,
  handleAmenitiesChange,
  handleDown_priceChange,
  handleResetFilter,
  filters,
}: any) => {
  const t = useTranslations("properties");
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    filters?.amenities || []
  );
  const locale = useLocale();

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

  const handleAmenityToggle = (amenityId: number) => {
    const updatedAmenities = selectedAmenities.includes(amenityId)
      ? selectedAmenities.filter((id) => id !== amenityId)
      : [...selectedAmenities, amenityId];

    setSelectedAmenities(updatedAmenities);
    handleAmenitiesChange(updatedAmenities);
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
                        <div className="col-6">
                          {/* price */}
                          <div className="w-full">
                            <h6 className="block-title fw-bold mt-45 mb-20">
                              {t("price")}
                            </h6>
                            <div className="price-ranger w-full">
                              <div className="price-input d-flex align-items-center justify-content-between pt-5 w-full">
                                <div className="field d-flex align-items-center flex-grow-1">
                                  <input
                                    type="number"
                                    className="input-min !max-w-full"
                                    value={filters?.price}
                                    onChange={(e) => handlePriceChange(e)}
                                  />
                                </div>
                                <div className="currency ps-1">Egp</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-6">
                          {/* down price */}
                          <div className="w-full">
                            <h6 className="block-title fw-bold mt-45 mb-20">
                              {t("down_price")}
                            </h6>
                            <div className="price-ranger w-full">
                              <div className="price-input d-flex align-items-center justify-content-between pt-5 w-full">
                                <div className="field d-flex w-full align-items-center flex-grow-1">
                                  <input
                                    type="number"
                                    className="input-min !max-w-full"
                                    value={filters?.down_price}
                                    onChange={(e) => handleDown_priceChange(e)}
                                  />
                                </div>
                                <div className="currency ps-1">Egp</div>
                              </div>
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
