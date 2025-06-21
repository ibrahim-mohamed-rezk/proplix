"use client";

import Image from "next/image";
import Link from "next/link";
import Slider from "react-slick";

import titleShape from "@/assets/images/shape/title_shape_05.svg";
import { AgentTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";

// Default agent placeholder image
const defaultAgentImage = "/assets/images/agent/agent-placeholder.jpg";

const AgentArea = ({
  style,
  agents,
  loading,
}: {
  style: Boolean;
  agents: AgentTypes[];
  loading: Boolean;
}) => {
  const t = useTranslations("endUser");

  const settings = {
    infinite: agents?.length > 4,
    dots: true,
    arrows: false,
    centerPadding: "0px",
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    navigator: false,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
  };

  // Function to get a valid image URL or default to placeholder
  const getAgentImage = (avatarUrl: string): string => {
    // Check if URL is valid and not the default placeholder from your backend
    if (
      avatarUrl &&
      avatarUrl !== "https://darkgrey-chough-759221.hostingersite.com/"
    ) {
      return avatarUrl;
    }
    return defaultAgentImage;
  };

  if (!agents) return null;

  return (
    <div
      className={`agent-section-one position-relative z-1 xl-mt-120 ${
        style ? "mt-170" : "mt-150"
      }`}
    >
      <div className={`container ${style ? "container-large" : ""}`}>
        <div className="position-relative">
          <div className="title-one mb-85 lg-mb-50 wow fadeInLeft">
            <h3>
              {t("Our")}
              <span>
                {t("Agents")}
                {style ? (
                  ""
                ) : (
                  <Image
                    src={titleShape}
                    alt=""
                    className="lazy-img"
                    width={60}
                    height={20}
                  />
                )}
              </span>
            </h3>
            <p className="fs-22 mt-xs">
              {t("Meet our professional real estate agents ready to help you")}
            </p>
          </div>

          <div className="wrapper position-relative z-1">
            {loading ? (
              <div className="text-center p-5">{t("Loading agents")}</div>
            ) : agents?.length === 0 ? (
              <div className="text-center p-5">{t("No agents found")}</div>
            ) : (
              <Slider {...settings} className="agent-slider-one flex">
                {agents &&
                  agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="item mb-[30px] rounded-[20px] "
                    >
                      <div className="agent-card-one position-relative">
                        <div className="img  rounded-[20px] overflow-hidden">
                          <img
                            src={getAgentImage(agent.avatar)}
                            alt={agent.name}
                            className="w-[100%] !h-[400px] tran5s rounded-[20px] hover:rounded-[20px]"
                          />
                        </div>
                        <div className="text-center">
                          <h6>{agent.name}</h6>
                          <Link
                            href={`/agent_details/${agent.id}`}
                            className="stretched-link no-underline"
                          >
                            {agent.role}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </Slider>
            )}
          </div>

          <div className="section-btn text-center md-mt-60">
            <Link
              href="/agent"
              className={`${style ? "btn-eight" : "btn-one fw-normal"}`}
            >
              {t("Meet Entire Team")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentArea;
