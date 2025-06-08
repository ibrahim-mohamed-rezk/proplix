import { getData } from "@/libs/server/backendServer";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import NiceSelect from "@/ui/NiceSelect";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

const DropdownTwo = ({
  handleBathroomChange,
  handleBedroomChange,
  handleSearchChange,
  handlePriceChange,
  maxPrice,
  priceValue,
  handleResetFilter,
  selectedAmenities,
  handleAmenityChange,
  handleLocationChange,
  handleStatusChange,
  handlePriceDropChange,
}: any) => {
  const t = useTranslations("properties");
  const locale = useLocale();
  const [areas, setAreas] = useState([]);

  // fetch areas form api
  useEffect(() => {
    const fetchAreas = async () => {
      const response = await getData("areas", {}, { lang: locale });
      setAreas(response.data.data);
    };
    fetchAreas();
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
                  { value: "all", text: "All" },
                  { value: "rent", text: "Rent" },
                  { value: "sale", text: "Sale" },
                ]}
                defaultCurrent={0}
                onChange={handleStatusChange}
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
                defaultCurrent={0}
                onChange={handleLocationChange}
                name=""
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-3 col-lg-4">
            <div className="input-box-one border-left border-lg-0">
              <div className="label">Price Range</div>
              <NiceSelect
                className="nice-select"
                options={[
                  { value: "1", text: "$10,000 - $200,000" },
                  { value: "2", text: "$20,000 - $300,000" },
                  { value: "3", text: "$30,000 - $400,000" },
                ]}
                defaultCurrent={0}
                onChange={(event) => handlePriceDropChange(event.target.value)}
                name=""
                placeholder=""
              />
            </div>
          </div>
          <div className="col-xl-3">
            <div className="input-box-one lg-mt-20">
              <div className="d-flex align-items-center">
                <Link
                  href="#"
                  data-bs-toggle="modal"
                  data-bs-target="#advanceFilterModal"
                  className="search-modal-btn sm tran3s text-uppercase fw-500 d-inline-flex align-items-center me-3"
                >
                  <i className="fa-light fa-sliders-up"></i>
                </Link>
                <button className="fw-500 text-uppercase tran3s search-btn">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ListingDropdownModal
        handleSearchChange={handleSearchChange}
        handlePriceChange={handlePriceChange}
        maxPrice={maxPrice}
        priceValue={priceValue}
        handleResetFilter={handleResetFilter}
        handleStatusChange={handleStatusChange}
      />
    </>
  );
};

export default DropdownTwo;
