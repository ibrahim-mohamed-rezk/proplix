import { PropertyTypes } from "@/libs/types/types";
import { useTranslations } from "next-intl";
import Link from "next/link"

const CommonBanner = ({ style_3, property }: { style_3?: boolean, property?: PropertyTypes }) => {
  const t = useTranslations("properties.property");
   return (
     <div className="row">
       <div className="col-lg-6">
         <h3 className="property-titlee">{property?.title}</h3>
         <div className="d-flex flex-wrap mt-10">
           <div
             className={`list-type text-uppercase mt-15 me-3 ${
               style_3 ? "bg-white text-dark fw-500" : "text-uppercase  "
             }`}
           >
             {t("FOR SELL")}
           </div>
           <div className="address mt-15">
             <i className="bi bi-geo-alt"></i> {property?.area.name}
           </div>
         </div>
       </div>
       <div className="col-lg-6 d-flex justify-content-end PropertyTypes text-lg-end">
         <div className="d-inline-flex flex-column justify-content-start  md-mt-40">
           <div className="price color-dark fw-500">Price: $1,67,000</div>
           <div className="est-price fs-20 mt-25 mb-35 md-mb-30">
             Est. Payment <span className="fw-500 color-dark">$8,343/mo*</span>
           </div>
           <ul className="style-none d-flex align-items-center justify-content-center action-btns">
             <li className=" fw-500 color-dark">
               <i className="fa-sharp fa-regular fa-share-nodes me-2"></i>
               Share
             </li>
             <li>
               <Link
                 href="#"
                 className={`d-flex align-items-center justify-content-center tran3s ${
                   style_3 ? "" : "rounded-circle"
                 }`}
               >
                 <i className="fa-light fa-heart"></i>
               </Link>
             </li>
             <li>
               <Link
                 href="#"
                 className={`d-flex align-items-center justify-content-center tran3s ${
                   style_3 ? "" : "rounded-circle"
                 }`}
               >
                 <i className="fa-light fa-bookmark"></i>
               </Link>
             </li>
             <li>
               <Link
                 href="#"
                 className={`d-flex align-items-center justify-content-center tran3s ${
                   style_3 ? "" : "rounded-circle"
                 }`}
               >
                 <i className="fa-light fa-circle-plus"></i>
               </Link>
             </li>
           </ul>
         </div>
       </div>
     </div>
   );
}

export default CommonBanner
