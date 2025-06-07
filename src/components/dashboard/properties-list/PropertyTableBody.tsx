import Image from 'next/image';
import React from 'react';
import { useLocale } from 'next-intl';       


const PropertyTableBody = ({ properties }: { properties: any }) => {
   const locale = useLocale();
   return (
      <tbody className="border-0">
         {properties && properties.map((item: any) => (
            <tr key={item.id}>
               <td>
                  <div className="d-lg-flex align-items-center position-relative"   style={{ gap: '10px' }}
                  >
                     <Image 
                        src={item?.cover} 
                        width={100} 
                        height={100} 
                        alt="" 
                        className="p-img"
                        style={{ objectFit: 'cover' }}
                     />
                     <div className="ps-lg-4 md-pt-10">
                        <a href="#" className="property-name tran3s color-dark fw-500 fs-20 stretched-link">{item.title}</a>
                        <div className="address">{item.address}</div>
                        <strong className="price color-dark">${item.price}</strong>
                     </div>
                  </div>
               </td>
               <td>{item.date}</td>
               <td>{item.view}</td>
               <td>
                  <div className={`property-status ${item.status_bg}`}>{item.status}</div>
               </td>
               <td>
                  <div className="action-dots float-end">
                     <button className="action-btn dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <span></span>
                     </button>
                     <ul className="dropdown-menu dropdown-menu-end">
                        <li><a className="dropdown-item" href="#"><Image width={10} height={10} src="/icon_18.svg" alt="" className="lazy-img" /> View</a></li>
                        <li><a className="dropdown-item" href={`./properties-list/create`}><Image width={10} height={10} src="/icon_19.svg" alt="" className="lazy-img" /> Create Property</a></li>
                        <li><a className="dropdown-item" href="#"><Image width={10} height={10} src="/icon_20.svg" alt="" className="lazy-img" /> Edit</a></li>
                        <li><a className="dropdown-item" href="#"><Image width={10} height={10} src="/icon_21.svg" alt="" className="lazy-img" /> Delete</a></li>
                     </ul>
                  </div>
               </td>
            </tr>
         ))}
      </tbody>
   )
}

export default PropertyTableBody;