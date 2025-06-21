"use client"
import { useState } from "react";
import VideoPopup from "@/modals/VideoPopup";
import Image from "next/image"
import videoImg from "@/assets/images/listing/img_47.jpg";
import { useTranslations } from "next-intl";

const CommonPropertyVideoTour = () => {

  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const t = useTranslations("endUser");

   return (
     <>
       <h4 className="mb-40">{t("Video Tour")}</h4>
       <div className="bg-white shadow4   p-15">
         <div className="position-relative      image-bg overflow-hidden z-1">
           <Image src={videoImg} alt="" className="lazy-img w-100" />
           <a
             onClick={() => setIsVideoOpen(true)}
             style={{ cursor: "pointer" }}
             className="video-icon tran3s rounded-circle d-flex align-items-center justify-content-center"
             data-fancybox
           >
             <i className="fa-thin fa-play"></i>
           </a>
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
   );
}

export default CommonPropertyVideoTour;
