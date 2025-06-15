import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import NiceSelect from "@/ui/NiceSelect";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const DropdownTwo = ({
  filters,
  handleDown_priceChange,
  handleSearchChange,
  handlePriceChange,
  handleResetFilter,
  handleAgentChange,
  handleLocationChange,
  handleTypesChange,
  popup = true,
}: any) => {
  const t = useTranslations("properties");
  const locale = useLocale();
  const [areas, setAreas] = useState([]);
  const [types, setTypes] = useState([]);

  // fetch areas form api
  useEffect(() => {
    const fetchAreas = async () => {
      const response = await getData("areas", {}, { lang: locale });
      setAreas(response.data.data);
    };
    fetchAreas();
  }, []);

  // fetch types form api
  useEffect(() => {
    const fetchAgents = async () => {
      const response = await getData("types", {}, { lang: locale });
      setTypes(response.data.data);
    };
    fetchAgents();
  }, []);

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row gx-0 align-items-center">
          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left">
              <div className="label">{t("im_looking_to")}</div>
              <NiceSelect
                className="nice-select"
                options={[
                  {
                    text: "all",
                    value: "all",
                  },
                  ...types?.map((type: any) => ({
                    value: type.id,
                    text: type.title,
                  })),
                ]}
                defaultCurrent={filters.type_id ? filters.type_id : "all"}
                onChange={handleTypesChange}
                name=""
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left">
              <div className="label">{t("area")}</div>
              <NiceSelect
                className="nice-select location"
                options={[
                  {
                    text: "all",
                    value: "all",
                  },
                  ...areas?.map((area: any) => ({
                    value: area.id,
                    text: area.name,
                  })),
                ]}
                defaultCurrent={filters.area_id || "all"}
                onChange={handleLocationChange}
                name=""
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left border-lg-0">
              <div className="label">{t("property_title")}</div>
              <input
                onChange={(e) => handleSearchChange(e)}
                type="text"
                placeholder={t("title_placeholder")}
                className="type-input"
                value={filters.title || ""}
              />
            </div>
          </div>
          <div className="col-xl-3">
            <div className="input-box-one lg-mt-20">
              <div className="d-flex align-items-center">
                {popup && (
                  <Link
                    href="#"
                    data-bs-toggle="modal"
                    data-bs-target="#advanceFilterModal"
                    className="search-modal-btn sm tran3s text-uppercase fw-500 d-inline-flex align-items-center me-3"
                  >
                    <i className="fa-light fa-sliders-up"></i>
                  </Link>
                )}
                <button className="fw-500 text-uppercase tran3s search-btn">
                  <Link href={!popup ? "/properties" : "#"}>{t("search")}</Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ListingDropdownModal
        handlePriceChange={handlePriceChange}
        handleDown_priceChange={handleDown_priceChange}
        handleResetFilter={handleResetFilter}
        handleAgentChange={handleAgentChange}
        filters={filters}
      />
    </>
  );
};

export default DropdownTwo;
