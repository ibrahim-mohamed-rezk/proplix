import PriceRange from "@/components/common/PriceRange";
import NiceSelect from "@/ui/NiceSelect";
import { useTranslations } from "next-intl";

const ListingDropdownModal = ({
  handleSearchChange,
  handlePriceChange,
  maxPrice,
  priceValue,
  handleResetFilter,
  handleStatusChange,
}: any) => {
  const t = useTranslations("properties");
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
                        <div className="col-md-6">
                          <div className="input-box-one mb-35">
                            <div className="label">I'm looking to...</div>
                            <NiceSelect
                              className="nice-select fw-normal"
                              options={[
                                { value: "apartments", text: "Buy Apartments" },
                                { value: "condos", text: "Rent Condos" },
                                { value: "houses", text: "Sell Houses" },
                                {
                                  value: "industrial",
                                  text: "Rent Industrial",
                                },
                                { value: "villas", text: "Sell Villas" },
                              ]}
                              defaultCurrent={0}
                              onChange={handleStatusChange}
                              name=""
                              placeholder=""
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-box-one mb-35">
                            <div className="label">{t("property_name")}</div>
                            <input
                              onChange={handleSearchChange}
                              type="text"
                              placeholder="buy, home, loft, apartment"
                              className="type-input"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-box-one mb-35">
                            <div className="label">Property ID</div>
                            <input
                              type="text"
                              placeholder="EM45203014"
                              className="type-input"
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h6 className="block-title fw-bold mt-45 mb-20">
                            Price range
                          </h6>
                          <div className="price-ranger">
                            <div className="price-input d-flex align-items-center justify-content-between pt-5">
                              <div className="field d-flex align-items-center">
                                <input
                                  type="number"
                                  className="input-min"
                                  value={priceValue[0]}
                                  onChange={() => handlePriceChange}
                                />
                              </div>
                              <div className="divider-line"></div>
                              <div className="field d-flex align-items-center">
                                <input
                                  type="number"
                                  className="input-max"
                                  value={priceValue[0]}
                                  onChange={() => handlePriceChange}
                                />
                              </div>
                              <div className="currency ps-1">USD</div>
                            </div>
                          </div>
                          <PriceRange
                            MAX={maxPrice}
                            MIN={0}
                            STEP={1}
                            values={priceValue}
                            handleChanges={handlePriceChange}
                          />
                          <div className="col-md-6">
                            <h6 className="block-title fw-bold mt-45 mb-20">
                              SQFT
                            </h6>
                            <div className="d-flex align-items-center sqf-ranger">
                              <input type="text" placeholder="Min" />
                              <div className="divider"></div>
                              <input type="text" placeholder="Max" />
                            </div>
                          </div>
                          <div className="col-12">
                            <button className="fw-500 text-uppercase tran3s apply-search w-100 mt-40 mb-25">
                              <i className="fa-light fa-magnifying-glass"></i>
                              <span>Search</span>
                            </button>
                          </div>
                          <div className="col-12">
                            <div className="d-flex justify-content-between form-widget">
                              <button
                                onClick={handleResetFilter}
                                style={{ cursor: "pointer" }}
                                className="tran3s"
                              >
                                <i className="fa-regular fa-arrows-rotate"></i>
                                <span>{t("reset_filter")}</span>
                              </button>
                            </div>
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
