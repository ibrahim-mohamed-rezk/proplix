import { Link } from "@/i18n/routing";
import { getData } from "@/libs/server/backendServer";
import ListingDropdownModal from "@/modals/ListingDropdownModal";
import NiceSelect from "@/ui/NiceSelect";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, useRef } from "react";
import listing_data from "@/data/inner-data/ListingData";

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
  const t = useTranslations("endUser");
  const locale = useLocale();
  const [areas, setAreas] = useState([]);
  const [types, setTypes] = useState([]);
  const [titleQuery, setTitleQuery] = useState("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const titleSuggestionsRef = useRef<HTMLDivElement>(null);

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

  // Extract unique property titles
  const allTitles = Array.from(
    new Set(listing_data.map((item: any) => item.title))
  );

  // Handle title input change
  const handleTitleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setTitleQuery(query);
    if (query.length > 1) {
      const filtered = allTitles.filter((title) =>
        title.toLowerCase().includes(query.toLowerCase())
      );
      setTitleSuggestions(filtered);
      setShowTitleSuggestions(filtered.length > 0);
    } else {
      setTitleSuggestions([]);
      setShowTitleSuggestions(false);
    }
    // Optionally trigger search change on typing
    handleSearchChange({ target: { value: query } });
  };

  // Handle suggestion selection
  const handleTitleSuggestionSelect = (title: string) => {
    setTitleQuery(title);
    setShowTitleSuggestions(false);
    handleSearchChange({ target: { value: title } });
  };

  // Hide suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        titleSuggestionsRef.current &&
        !titleSuggestionsRef.current.contains(event.target as Node) &&
        titleInputRef.current &&
        !titleInputRef.current.contains(event.target as Node)
      ) {
        setShowTitleSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
                    text: t("all"),
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
                    text: t("all"),
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
              <div style={{ position: "relative" }}>
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder={t("title_placeholder")}
                  className="type-input"
                  value={titleQuery}
                  onChange={handleTitleInputChange}
                  onFocus={() =>
                    titleSuggestions.length > 0 && setShowTitleSuggestions(true)
                  }
                  autoComplete="off"
                />
                {showTitleSuggestions && titleSuggestions.length > 0 && (
                  <div
                    ref={titleSuggestionsRef}
                    className="title-suggestions"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #e0e0e0",
                      borderTop: "none",
                      borderRadius: "0 0 4px 4px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {titleSuggestions.map((suggestion, idx) => (
                      <div
                        key={suggestion + idx}
                        className="suggestion-item"
                        onClick={() => handleTitleSuggestionSelect(suggestion)}
                        style={{
                          padding: "12px 15px",
                          cursor: "pointer",
                          borderBottom:
                            idx < titleSuggestions.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                          fontSize: "14px",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.backgroundColor =
                            "#f8f9fa")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.backgroundColor =
                            "#fff")
                        }
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
