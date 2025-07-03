"use client";
import BreadcrumbOne from "@/components/common/breadcrumb/BreadcrumbOne";
import FancyBanner from "@/components/common/FancyBanner";
import { Link } from "@/i18n/routing";
import FooterOne from "@/layouts/footers/FooterOne";
import HeaderOne from "@/layouts/headers/HeaderOne";
import { useTranslations } from "next-intl";
import { useState } from "react";

const PrivacyPolicyPage = () => {
  const t = useTranslations("privacy");
  const [activeAccordion, setActiveAccordion] = useState(1); // Default to first item being open

  const toggleAccordion = (id: any) => {
    setActiveAccordion(activeAccordion === id ? null : id);
  };

  const privacyData = [
    {
      id: 1,
      id_name: "DataCollection",
      title: t("sections.dataCollection.title"),
      md_pt: false,
      items: [
        {
          id: 1,
          title: t("sections.dataCollection.items.personal.title"),
          content: t("sections.dataCollection.items.personal.content"),
        },
        {
          id: 2,
          title: t("sections.dataCollection.items.property.title"),
          content: t("sections.dataCollection.items.property.content"),
        },
        {
          id: 3,
          title: t("sections.dataCollection.items.technical.title"),
          content: t("sections.dataCollection.items.technical.content"),
        },
        {
          id: 4,
          title: t("sections.dataCollection.items.thirdParty.title"),
          content: t("sections.dataCollection.items.thirdParty.content"),
        },
      ],
    },
    {
      id: 2,
      id_name: "DataUsage",
      title: t("sections.dataUsage.title"),
      md_pt: false,
      items: [
        {
          id: 5,
          title: t("sections.dataUsage.items.services.title"),
          content: t("sections.dataUsage.items.services.content"),
        },
        {
          id: 6,
          title: t("sections.dataUsage.items.communication.title"),
          content: t("sections.dataUsage.items.communication.content"),
        },
        {
          id: 7,
          title: t("sections.dataUsage.items.improvement.title"),
          content: t("sections.dataUsage.items.improvement.content"),
        },
        {
          id: 8,
          title: t("sections.dataUsage.items.legal.title"),
          content: t("sections.dataUsage.items.legal.content"),
        },
      ],
    },
    {
      id: 3,
      id_name: "DataSharing",
      title: t("sections.dataSharing.title"),
      md_pt: false,
      items: [
        {
          id: 9,
          title: t("sections.dataSharing.items.agents.title"),
          content: t("sections.dataSharing.items.agents.content"),
        },
        {
          id: 10,
          title: t("sections.dataSharing.items.partners.title"),
          content: t("sections.dataSharing.items.partners.content"),
        },
        {
          id: 11,
          title: t("sections.dataSharing.items.legal.title"),
          content: t("sections.dataSharing.items.legal.content"),
        },
        {
          id: 12,
          title: t("sections.dataSharing.items.business.title"),
          content: t("sections.dataSharing.items.business.content"),
        },
      ],
    },
    {
      id: 4,
      id_name: "DataProtection",
      title: t("sections.dataProtection.title"),
      md_pt: false,
      items: [
        {
          id: 13,
          title: t("sections.dataProtection.items.security.title"),
          content: t("sections.dataProtection.items.security.content"),
        },
        {
          id: 14,
          title: t("sections.dataProtection.items.retention.title"),
          content: t("sections.dataProtection.items.retention.content"),
        },
        {
          id: 15,
          title: t("sections.dataProtection.items.transfers.title"),
          content: t("sections.dataProtection.items.transfers.content"),
        },
      ],
    },
    {
      id: 5,
      id_name: "UserRights",
      title: t("sections.userRights.title"),
      md_pt: false,
      items: [
        {
          id: 16,
          title: t("sections.userRights.items.access.title"),
          content: t("sections.userRights.items.access.content"),
        },
        {
          id: 17,
          title: t("sections.userRights.items.control.title"),
          content: t("sections.userRights.items.control.content"),
        },
        {
          id: 18,
          title: t("sections.userRights.items.exercise.title"),
          content: t("sections.userRights.items.exercise.content"),
        },
      ],
    },
    {
      id: 6,
      id_name: "Additional",
      title: t("sections.additional.title"),
      md_pt: false,
      items: [
        {
          id: 19,
          title: t("sections.additional.items.cookies.title"),
          content: t("sections.additional.items.cookies.content"),
        },
        {
          id: 20,
          title: t("sections.additional.items.children.title"),
          content: t("sections.additional.items.children.content"),
        },
        {
          id: 21,
          title: t("sections.additional.items.updates.title"),
          content: t("sections.additional.items.updates.content"),
        },
        {
          id: 22,
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
        link_title={t("breadcrumb.linkTitle")}
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
                      <Link href="#DataCollection">
                        1. <span>{t("sidebar.dataCollection")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#DataUsage">
                        2. <span>{t("sidebar.dataUsage")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#DataSharing">
                        3. <span>{t("sidebar.dataSharing")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#DataProtection">
                        4. <span>{t("sidebar.dataProtection")}</span>
                      </Link>
                    </li>
                    <li>
                      <Link href="#UserRights">
                        5. <span>{t("sidebar.userRights")}</span>
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
              {privacyData.map((section) => (
                <div
                  key={section.id}
                  className="accordion-style-two no-bg p0 ms-xl-5"
                >
                  <div
                    className={`accordion-title text-uppercase fw-500 ${
                      section.md_pt ? "md-pt-90" : "pt-90"
                    }`}
                    id={section.id_name}
                  >
                    {section.title}
                  </div>
                  <div className="accordion p0" id={`accordion${section.id}`}>
                    {section.items.map((item, index) => (
                      <div
                        key={index}
                        className={`accordion-item ${
                          activeAccordion === item.id ? "active" : ""
                        }`}
                      >
                        <h2 className="accordion-header">
                          <button
                            className={`accordion-button ${
                              activeAccordion === item.id ? "" : "collapsed"
                            }`}
                            type="button"
                            onClick={() => toggleAccordion(item.id)}
                            aria-expanded={activeAccordion === item.id}
                            aria-controls={`collapse${item.id}`}
                          >
                            {item.title}
                          </button>
                        </h2>
                        <div
                          id={`collapse${item.id}`}
                          className={`accordion-collapse collapse ${
                            activeAccordion === item.id ? "show" : ""
                          }`}
                        >
                          <div className="accordion-body">
                            <div
                              dangerouslySetInnerHTML={{ __html: item.content }}
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

export default PrivacyPolicyPage;
