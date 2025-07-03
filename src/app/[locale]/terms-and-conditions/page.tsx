"use client";
import BreadcrumbOne from "@/components/common/breadcrumb/BreadcrumbOne";
import FancyBanner from "@/components/common/FancyBanner";
import { Link } from "@/i18n/routing";
import FooterOne from "@/layouts/footers/FooterOne";
import HeaderOne from "@/layouts/headers/HeaderOne";
import { useTranslations } from "next-intl";
import { useState } from "react";

const TermsConditionsPage = () => {
  const t = useTranslations("terms");
  const [activeAccordion, setActiveAccordion] = useState(3); // Default to item 3 being open


  const toggleAccordion = (id : any) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const termsData = [
    {
      id: 1,
      id_name: "GeneralTerms",
      title: t("sections.generalTerms.title"),
      md_pt: false,
      terms: [
        {
          id: 1,
          title: t("sections.generalTerms.items.definitions.title"),
          content: t("sections.generalTerms.items.definitions.content"),
        },
        {
          id: 2,
          title: t("sections.generalTerms.items.agreement.title"),
          content: t("sections.generalTerms.items.agreement.content"),
        },
        {
          id: 3,
          title: t("sections.generalTerms.items.eligibility.title"),
          content: t("sections.generalTerms.items.eligibility.content"),
        },
        {
          id: 4,
          title: t("sections.generalTerms.items.effective.title"),
          content: t("sections.generalTerms.items.effective.content"),
        },
      ],
    },
    {
      id: 2,
      id_name: "UseLicense",
      title: t("sections.useLicense.title"),
      md_pt: false,
      terms: [
        {
          id: 5,
          title: t("sections.useLicense.items.license.title"),
          content: t("sections.useLicense.items.license.content"),
        },
        {
          id: 6,
          title: t("sections.useLicense.items.restrictions.title"),
          content: t("sections.useLicense.items.restrictions.content"),
        },
        {
          id: 7,
          title: t("sections.useLicense.items.termination.title"),
          content: t("sections.useLicense.items.termination.content"),
        },
      ],
    },
    {
      id: 3,
      id_name: "UserResponsibilities",
      title: t("sections.userResponsibilities.title"),
      md_pt: false,
      terms: [
        {
          id: 8,
          title: t("sections.userResponsibilities.items.platform.title"),
          content: t("sections.userResponsibilities.items.platform.content"),
        },
        {
          id: 9,
          title: t("sections.userResponsibilities.items.verification.title"),
          content: t(
            "sections.userResponsibilities.items.verification.content"
          ),
        },
        {
          id: 10,
          title: t("sections.userResponsibilities.items.compliance.title"),
          content: t("sections.userResponsibilities.items.compliance.content"),
        },
      ],
    },
    {
      id: 4,
      id_name: "Liability",
      title: t("sections.liability.title"),
      md_pt: false,
      terms: [
        {
          id: 11,
          title: t("sections.liability.items.limitations.title"),
          content: t("sections.liability.items.limitations.content"),
        },
        {
          id: 12,
          title: t("sections.liability.items.communications.title"),
          content: t("sections.liability.items.communications.content"),
        },
        {
          id: 13,
          title: t("sections.liability.items.disclaimer.title"),
          content: t("sections.liability.items.disclaimer.content"),
        },
      ],
    },
    {
      id: 5,
      id_name: "IntellectualProperty",
      title: t("sections.intellectualProperty.title"),
      md_pt: false,
      terms: [
        {
          id: 14,
          title: t("sections.intellectualProperty.items.ownership.title"),
          content: t("sections.intellectualProperty.items.ownership.content"),
        },
        {
          id: 15,
          title: t("sections.intellectualProperty.items.usage.title"),
          content: t("sections.intellectualProperty.items.usage.content"),
        },
        {
          id: 16,
          title: t("sections.intellectualProperty.items.trademarks.title"),
          content: t("sections.intellectualProperty.items.trademarks.content"),
        },
      ],
    },
    {
      id: 6,
      id_name: "Additional",
      title: t("sections.additional.title"),
      md_pt: false,
      terms: [
        {
          id: 17,
          title: t("sections.additional.items.governing.title"),
          content: t("sections.additional.items.governing.content"),
        },
        {
          id: 18,
          title: t("sections.additional.items.privacy.title"),
          content: t("sections.additional.items.privacy.content"),
        },
        {
          id: 19,
          title: t("sections.additional.items.contact.title"),
          content: t("sections.additional.items.contact.content"),
        },
      ],
    },
  ];

  return (
    <>
      <HeaderOne style={true} />
      <BreadcrumbOne
        title={t("breadcrumb.title")}
        link="#"
        sub_title={t("breadcrumb.subTitle")}
        style={true}
      />
      <div className="faq-section-two mt-130 xl-mt-100 mb-150 xl-mb-100">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 wow fadeInLeft">
              <div className="faq-sidebar">
                <div className="bg-wrapper">
                  <ul className="style-none">
                    <li>
                      <Link href="#GeneralTerms">
                        1. <span>{t("sidebar.generalTerms")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#UseLicense">
                        2. <span>{t("sidebar.useLicense")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#UserResponsibilities">
                        3. <span>{t("sidebar.userResponsibilities")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#Liability">
                        4. <span>{t("sidebar.liability")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#IntellectualProperty">
                        5. <span>{t("sidebar.intellectualProperty")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#Additional">
                        6. <span>{t("sidebar.additional")}</span>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="bg-wrapper text-center mt-35">
                  <h4 className="mb-35">{t("sidebar.needHelp.title")}</h4>
                  <Link href="/contact" className="btn-five">
                    {t("sidebar.needHelp.button")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              {termsData.map((item) => (
                <div
                  key={item.id}
                  className="accordion-style-two no-bg p0 ms-xl-5"
                >
                  <div
                    className={`accordion-title text-uppercase fw-500 ${
                      item.md_pt ? "md-pt-90" : "pt-90"
                    }`}
                    id={item.id_name}
                  >
                    {item.title}
                  </div>
                  <div className="accordion p0" id={`accordion${item.id}`}>
                    {item.terms.map((term, index) => (
                      <div
                        key={index}
                        className={`accordion-item ${
                          activeAccordion === term.id ? "active" : ""
                        }`}
                      >
                        <h2 className="accordion-header">
                          <button
                            className={`accordion-button ${
                              activeAccordion === term.id ? "" : "collapsed"
                            }`}
                            type="button"
                            onClick={() => toggleAccordion(term.id)}
                            aria-expanded={activeAccordion === term.id}
                            aria-controls={`collapse${term.id}`}
                          >
                            {term.title}
                          </button>
                        </h2>
                        <div
                          id={`collapse${term.id}`}
                          className={`accordion-collapse collapse ${
                            activeAccordion === term.id ? "show" : ""
                          }`}
                        >
                          <div className="accordion-body">
                            <div
                              dangerouslySetInnerHTML={{ __html: term.content }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <FancyBanner style={false} />
      <FooterOne />
    </>
  );
};

export default TermsConditionsPage;
