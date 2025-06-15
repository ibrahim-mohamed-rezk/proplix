import { getData } from "@/libs/server/backendServer";
import NiceSelect from "@/ui/NiceSelect";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const ListingDropdownModal = ({
  handlePriceChange,
  handleAgentChange,
  handleDown_priceChange,
  handleResetFilter,
  filters,
}: any) => {
  const t = useTranslations("properties");
  const [agents, setAgents] = useState([]);
  const locale = useLocale();

  // fetch agents form api
  useEffect(() => {
    const fetchAgents = async () => {
      const response = await getData("agents", {}, { lang: locale });
      setAgents(response.data.data);
    };
    fetchAgents();
  }, []);

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

                          {/* agents  */}
                          <div className="col-12">
                            <div className="input-box-one w-full">
                              <div className="label">{t("by_agent")}</div>
                              <NiceSelect
                                className="nice-select w-full"
                                options={[
                                  {
                                    text: t("all agents"),
                                    value: "all",
                                  },
                                  ...agents?.map((agent: any) => ({
                                    value: agent.id,
                                    text: agent.name,
                                  })),
                                ]}
                                defaultCurrent={filters?.agent || "all"}
                                onChange={handleAgentChange}
                                name=""
                                placeholder=""
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-6">
                          {/* donwn price */}
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
