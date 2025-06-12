"use client"
import Image from "next/image"
import Link from "next/link";
import Count from "@/components/common/Count";
import { useState } from "react";
import VideoPopup from "@/modals/VideoPopup";
import { useTranslations } from "next-intl";

import featureShape from "@/assets/images/assets/screen_01.png";

const BLockFeatureTwo = () => {
  const t = useTranslations("Feature.vid");
   const [isVideoOpen, setIsVideoOpen] = useState(false);

   return (
      <>
         <div className="block-feature-two mt-150 xl-mt-110">
            <div className="wrapper">
               <div className="row gx-xl-5">
                  <div className="col-xxl-7 col-md-6 d-flex wow fadeInLeft">
                     <div className="block-one w-100 h-100">
                        <div className="position-relative z-1 h-100">
                           <h3 className="mb-55">{t("title1")}</h3>
                           <a onClick={() => setIsVideoOpen(true)} style={{ cursor: "pointer" }} className="fancybox video-icon d-flex align-items-center justify-content-center rounded-circle ms-3" data-fancybox="">
                              <i className="fa-solid fa-play"></i>
                           </a>
                           <div className="card-box text-center">
                              <h3 className="main-count fw-500">0<span className="counter"><Count number={7} /></span>+</h3>
                              <p className="fs-20">{t("description")}</p>
                           </div>
                           <Image src={featureShape} alt="" className="lazy-img shapes screen_01" />
                        </div>
                     </div>
                  </div>

                  <div className="col-xxl-5 col-md-6 wow fadeInRight">
                     <div className="block-two">
                        <div className="bg-wrapper">
                              <h4>{t("title2")}</h4>
                           <p className="fs-22 mt-20">{t("description2")}</p>
                           <div className="counter-wrapper ps-xl-3 pb-30 mt-45 mb-50">
                              <div className="row">
                                 <div className="col-6">
                                    <div className="counter-block-one mt-20">
                                       <div className="main-count fw-500 color-dark"><span className="counter"><Count number={1.7} /></span>K+</div>
                                       <span>{t("completed_project")}</span>
                                    </div>
                                 </div>
                                 <div className="col-6">
                                    <div className="counter-block-one mt-20">
                                       <div className="main-count fw-500 color-dark"><span className="counter"><Count number={1.3} /></span>mil+</div>
                                       <span>{t("happy_customers")}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                           <ul className="list-style-one fs-22 color-dark style-none">
                                    <li>{t("loan_and_low_interest_facility")}</li>
                              <li>{t("over_100k_property_and_update_regularly")}</li>
                              <li>{t("expert_agent_consultation")}</li>
                           </ul>
                           <div className="d-inline-flex flex-wrap align-items-center mt-15 md-mt-10">
                              <Link href="/about_us_01" className="btn-two mt-20 me-4"><span>{t("more_details")}</span></Link>
                              <Link href="/contact" className="btn-three mt-20"><span>{t("request_a_callback")}</span> <i className="fa-light fa-arrow-right-long"></i></Link>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         {/* video modal start */}
         <VideoPopup
            isVideoOpen={isVideoOpen}
            setIsVideoOpen={setIsVideoOpen}
            videoId={"tUP5S4YdEJo"}
         />
         {/* video modal end */}
      </>
   )
}

export default BLockFeatureTwo
