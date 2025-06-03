import Link from "next/link"

import { PropertyTypes } from "@/libs/types/types"
import { useTranslations } from "next-intl";

const SidebarInfo = ({ property }: { property?: PropertyTypes }) => {
   const t = useTranslations("sidebar");
   return (
     <>
       <img
         src={property?.user.avatar || ""}
         alt="user"
         className="lazy-img rounded-circle ms-auto me-auto mt-3 avatar"
       />
       <div className="text-center mt-25">
         <h6 className="name">{property?.user.name}</h6>
         <p className="fs-16">{property?.user.role}</p>
         <ul className="style-none d-flex align-items-center justify-content-center social-icon">
           <li>
             <Link href="#">
               <i className="fa-brands fa-facebook-f"></i>
             </Link>
           </li>
           <li>
             <Link href="#">
               <i className="fa-brands fa-twitter"></i>
             </Link>
           </li>
           <li>
             <Link href="#">
               <i className="fa-brands fa-instagram"></i>
             </Link>
           </li>
           <li>
             <Link href="#">
               <i className="fa-brands fa-linkedin"></i>
             </Link>
           </li>
         </ul>
       </div>
       <div className="divider-line mt-40 mb-45 pt-20">
         <ul className="style-none flex flex-col">
           <li>
             <span>{t("Location")}</span> <span>{property?.user.address}</span>
           </li>
           <li>
             <span>{t("Email")}</span>{" "}
             <span>
               <Link href={`mailto:${property?.user.email}`}>
                 {property?.user.email}
               </Link>
             </span>
           </li>
           <li>
             <span>{t("Phone")}</span>{" "}
             <span>
               <Link href={`tel:${property?.user.phone}`}>
                 {property?.user.phone}
               </Link>
             </span>
           </li>
         </ul>
       </div>
       <Link
         href="/contact"
         className="btn-nine text-uppercase rounded-3 w-100 mb-10"
       >
         {t("Contact Agent")}
       </Link>
     </>
   );
}

export default SidebarInfo
