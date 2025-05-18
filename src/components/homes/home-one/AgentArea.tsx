"use client";

import Image from "next/image";
import Link from "next/link";
import agent_data from "@/data/home-data/AgentData"; // Keep as fallback
import Slider from "react-slick";

import titleShape from "@/assets/images/shape/title_shape_05.svg";
import { AgentTypes } from "@/libs/types/types";

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
  const settings = {
    infinite: agents?.length > 1,
    dots: true,
    arrows: false,
    centerPadding: "0px",
    slidesToShow: 4,
    slidesToScroll: 2,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
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
              Our{" "}
              <span>
                Agents
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
              Meet our professional real estate agents ready to help you
            </p>
          </div>

          <div className="wrapper position-relative z-1">
            {loading ? (
              <div className="text-center p-5">Loading agents...</div>
            ) : (
              <Slider {...settings} className="agent-slider-one">
                {agents &&
                  agents.map((agent) => (
                    <div key={agent.id} className="item border-1 ">
                      <div className="agent-card-one position-relative">
                        <div className="img border-20">
                          <Image
                            src={getAgentImage(agent.avatar)}
                            alt={agent.name}
                            className="w-100 tran5s"
                            width={300}
                            height={350}
                            unoptimized={agent.avatar !== defaultAgentImage}
                          />
                        </div>
                        <div className="text-center">
                          <h6>{agent.name}</h6>
                          <Link
                            href={`/agent_details/${agent.id}`}
                            className="stretched-link"
                          >
                            {agent.email}
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
              Meet Entire Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentArea;
