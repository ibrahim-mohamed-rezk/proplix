// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import agent_data from "@/data/home-data/AgentData";
// import Slider from "react-slick";

// import titleShape from "@/assets/images/shape/title_shape_05.svg";

// const AgentArea = ({ style }: any) => {
//   const settings = {
//     dots: true,
//     arrows: false,
//     centerPadding: "0px",
//     slidesToShow: 4,
//     slidesToScroll: 2,
//     autoplay: true,
//     autoplaySpeed: 3000,
//     responsive: [
//       {
//         breakpoint: 1200,
//         settings: {
//           slidesToShow: 3,
//         },
//       },
//       {
//         breakpoint: 768,
//         settings: {
//           slidesToShow: 2,
//         },
//       },
//       {
//         breakpoint: 576,
//         settings: {
//           slidesToShow: 1,
//         },
//       },
//     ],
//   };

//   return (
//     <div
//       className={`agent-section-one position-relative z-1 xl-mt-120 ${
//         style ? "mt-170" : "mt-150"
//       }`}
//     >
//       <div className={`container ${style ? "container-large" : ""}`}>
//         <div className="position-relative">
//           <div className="title-one mb-85 lg-mb-50 wow fadeInLeft">
//             <h3>
//               Our{" "}
//               <span>
//                 Agents
//                 {style ? (
//                   ""
//                 ) : (
//                   <Image src={titleShape} alt="" className="lazy-img" />
//                 )}
//               </span>
//             </h3>
//             <p className="fs-22 mt-xs">
//               Lorem is placeholder text commonly used graphic{" "}
//             </p>
//           </div>

//           <div className="wrapper position-relative z-1">
//             <Slider {...settings} className="agent-slider-one">
//               {agent_data
//                 .filter((items) => items.page === "home_1")
//                 .map((item) => (
//                   <div key={item.id} className="item">
//                     <div className="agent-card-one position-relative">
//                       <div className="img border-20">
//                         <Image
//                           src={item.thumb}
//                           alt=""
//                           className="w-100 tran5s"
//                         />
//                       </div>
//                       <div className="text-center">
//                         <h6>{item.title}</h6>
//                         <Link href="/agent_details" className="stretched-link">
//                           {item.desc}
//                         </Link>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//             </Slider>
//           </div>

//           <div className="section-btn text-center md-mt-60">
//             <Link
//               href="agent"
//               className={` ${style ? "btn-eight" : "btn-one fw-normal"}`}
//             >
//               Meet Entire Team
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AgentArea;

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import agent_data from "@/data/home-data/AgentData"; // Keep as fallback
import Slider from "react-slick";

import titleShape from "@/assets/images/shape/title_shape_05.svg";
import { getData } from "@/libs/server/backendServer";

// Define types
interface Agent {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  subscription: string;
  provider_id: string | null;
  email_verified_at: string | null;
  role: string;
}

interface ApiResponse {
  data: {
    data: {
      agents: Agent[];
    };
  };
}

interface AgentAreaProps {
  style?: boolean;
}

// Default agent placeholder image
const defaultAgentImage = "/assets/images/agent/agent-placeholder.jpg";

const AgentArea = ({ style }: AgentAreaProps) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const response = (await getData("home")) as ApiResponse;
        if (response?.data?.data?.agents) {
          setAgents(response.data.data.agents);
        } else {
          // Fallback to static data if API didn't return agents
          setError("No agents found in the API response");
        }
      } catch (err) {
        console.error("Failed to load agents:", err);
        setError("Failed to load agents data");
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const settings = {
    infinite: agents.length > 1,
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
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <Slider {...settings} className="agent-slider-one">
                {agents.length > 0
                  ? agents.map((agent) => (
                      <div key={agent.id} className="item border border-1">
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
                    ))
                  : // Fallback to static data if no agents from API
                    agent_data
                      .filter((items) => items.page === "home_1")
                      .map((item) => (
                        <div key={item.id} className="item">
                          <div className="agent-card-one position-relative">
                            <div className="img border-20">
                              <Image
                                src={item.thumb}
                                alt={item.title}
                                className="w-100 tran5s"
                                width={300}
                                height={350}
                              />
                            </div>
                            <div className="text-center">
                              <h6>{item.title}</h6>
                              <Link
                                href="/agent_details"
                                className="stretched-link"
                              >
                                {item.desc}
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
