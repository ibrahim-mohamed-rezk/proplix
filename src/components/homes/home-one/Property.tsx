// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image"
// import Link from "next/link";
// import property_data from "@/data/home-data/PropertyData";

// import titleShape from "@/assets/images/shape/title_shape_03.svg";
// import { getData } from "@/libs/server/backendServer";

// const Property = () => {

//    interface Listing {
//       id: number;
//       image: string;
//       count_of_properties: number;
//       name: string;
//       user: {
//          id: number;
//          name: string;
//          email: string;
//          phone: string;
//       };
//       type: string;
//       area: string;
//       price: number;
//       down_price: number;
//       sqt: number;
//       bathroom: number;
//       bedroom: number;
//       kitichen: number;
//       status: string;
//       apartment_office: string;
//       immediate_delivery: string;
//       title: string;
//       description: string;
//       keywords: string;
//       slug: string;
//       meta_title: string;
//       meta_description: string;
//       meta_keywords: string;
//     }
//    const [listings, setListings] = useState<Listing[]>([]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const response = await getData("home");
//         setListings(response.data.data.property_listings);
       
//       } catch (err) {
//         console.error("Failed to load listings:", err);
//       }
//     })();
//   }, []);
//    return (
//       <div className="property-listing-one bg-pink-two mt-150 xl-mt-120 pt-140 xl-pt-120 lg-pt-80 pb-180 xl-pb-120 lg-pb-100">
//          <div className="container">
//             <div className="position-relative">
//                <div className="title-one text-center text-lg-start mb-45 xl-mb-30 lg-mb-20 wow fadeInUp">
//                   <h3>New <span>Listings <Image src={titleShape} alt="" className="lazy-img" /></span></h3>
//                   <p className="fs-22 mt-xs">Explore latest & featured properties for sale.</p>
//                </div>

//                <div className="row gx-xxl-5">
//                   {property_data.filter((items) => items.page === "home_1").map((item) => (
//                      <div key={item.id} className="col-lg-4 col-md-6 d-flex mt-40 wow fadeInUp" data-wow-delay={item.data_delay_time}>
//                         <div className="listing-card-one border-25 h-100 w-100">
//                            <div className="img-gallery p-15">
//                               <div className="position-relative border-25 overflow-hidden">
//                                  <div className={`tag border-25 ${item.tag_bg}`}>{item.tag}</div>
//                                  <div id={`carousel${item.carousel}`} className="carousel slide">
//                                     <div className="carousel-indicators">
//                                        <button type="button" data-bs-target={`#carousel${item.carousel}`} data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
//                                        <button type="button" data-bs-target={`#carousel${item.carousel}`} data-bs-slide-to="1" aria-label="Slide 2"></button>
//                                        <button type="button" data-bs-target={`#carousel${item.carousel}`} data-bs-slide-to="2" aria-label="Slide 3"></button>
//                                     </div>
//                                     <div className="carousel-inner">
//                                        {item.carousel_thumb.map((item, i) => (
//                                           <div key={i} className={`carousel-item ${item.active}`} data-bs-interval="1000000">
//                                              <Link href="/listing_details_01" className="d-block"><Image src={item.img} className="w-100" alt="..." /></Link>
//                                           </div>
//                                        ))}
//                                     </div>
//                                  </div>
//                               </div>
//                            </div>

//                            <div className="property-info p-25">
//                               <Link href="/listing_details_01" className="title tran3s">{item.title}</Link>
//                               <div className="address">{item.address}</div>
//                               <ul className="style-none feature d-flex flex-wrap align-items-center justify-content-between">
//                                  {item.property_info.map((info, index) => (
//                                     <li key={index} className="d-flex align-items-center">
//                                        <Image src={info.icon} alt="" className="lazy-img icon me-2" />
//                                        <span className="fs-16">{info.total_feature} {info.feature}</span>
//                                     </li>
//                                  ))}
//                               </ul>
//                               <div className="pl-footer top-border d-flex align-items-center justify-content-between">
//                                  <strong className="price fw-500 color-dark">
//                                     ${item.price.toLocaleString(undefined, {
//                                        minimumFractionDigits: item.price_text ? 0 : 2,
//                                        maximumFractionDigits: 2
//                                     })}{item.price_text &&<>/<sub>m</sub></>}
//                                  </strong>
//                                  <Link href="/listing_details_01" className="btn-four rounded-circle"><i className="bi bi-arrow-up-right"></i></Link>
//                               </div>
//                            </div>
//                         </div>
//                      </div>
//                   ))}
//                </div>
//             </div>
//          </div>
//       </div>
//    )
// }

// export default Property;

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import property_data from "@/data/home-data/PropertyData"; // Keep as fallback

import titleShape from "@/assets/images/shape/title_shape_03.svg";
import { getData } from "@/libs/server/backendServer";

// Default placeholder images for property carousel
const defaultImages = [
  "/assets/images/property/property-placeholder-1.jpg",
  "/assets/images/property/property-placeholder-2.jpg",
  "/assets/images/property/property-placeholder-3.jpg"
];

// Define types
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  subscription?: string;
  provider_id?: string | null;
  email_verified_at?: string | null;
  role?: string;
}

interface Listing {
  id: number;
  image: string;
  count_of_properties?: number;
  name?: string;
  user: User;
  type: string;
  area: string;
  price: number;
  down_price: number;
  sqt: number;
  bathroom: number;
  bedroom: number;
  kitichen: number;
  status: string;
  apartment_office: string;
  immediate_delivery: string;
  title: string;
  description: string;
  keywords: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface ApiResponse {
  data: {
    data: {
      property_listings: Listing[];
    };
  };
}

const Property = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const response = await getData("home") as ApiResponse;
        if (response?.data?.data?.property_listings) {
          setListings(response.data.data.property_listings);
        } else {
          setError("No listings found in the API response");
        }
      } catch (err) {
        console.error("Failed to load listings:", err);
        setError("Failed to load property listings");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Function to determine tag background class based on property status
  const getTagBgClass = (status: string): string => {
    switch (status) {
      case "sale":
        return "bg-one";
      case "rent":
        return "bg-two";
      case "sold":
        return "bg-three";
      default:
        return "bg-one";
    }
  };

  // Function to format status text for display
  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="property-listing-one bg-pink-two mt-150 xl-mt-120 pt-140 xl-pt-120 lg-pt-80 pb-180 xl-pb-120 lg-pb-100">
      <div className="container">
        <div className="position-relative">
          <div className="title-one text-center text-lg-start mb-45 xl-mb-30 lg-mb-20 wow fadeInUp">
            <h3>
              New <span>Listings <Image src={titleShape} alt="" className="lazy-img" /></span>
            </h3>
            <p className="fs-22 mt-xs">Explore latest & featured properties for sale.</p>
          </div>

          {loading ? (
            <div className="text-center p-5">Loading properties...</div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <div className="row gx-xxl-5">
              {listings.length > 0 ? (
                listings.map((item, index) => (
                  <div key={item.id} className="col-lg-4 col-md-6 d-flex mt-40 wow fadeInUp" data-wow-delay={`0.${index + 1}s`}>
                    <div className="listing-card-one border-25 h-100 w-100">
                      <div className="img-gallery p-15">
                        <div className="position-relative border-25 overflow-hidden">
                          <div className={`tag border-25 ${getTagBgClass(item.status)}`}>
                            {formatStatus(item.status)}
                          </div>
                          <div id={`carousel${item.id}`} className="carousel slide">
                            <div className="carousel-indicators">
                              <button type="button" data-bs-target={`#carousel${item.id}`} data-bs-slide-to="0" className="active" aria-current="true" aria-label="Slide 1"></button>
                              <button type="button" data-bs-target={`#carousel${item.id}`} data-bs-slide-to="1" aria-label="Slide 2"></button>
                              <button type="button" data-bs-target={`#carousel${item.id}`} data-bs-slide-to="2" aria-label="Slide 3"></button>
                            </div>
                            <div className="carousel-inner">
                              {/* If image is available from API use it, otherwise use placeholder images */}
                              {item.image && item.image !== "https://darkgrey-chough-759221.hostingersite.com/" ? (
                                <div className="carousel-item active" data-bs-interval="1000000">
                                  <Link href={`/listing_details_01/${item.id}`} className="d-block">
                                    <Image 
                                      src={item.image} 
                                      width={400} 
                                      height={300} 
                                      className="w-100" 
                                      alt={item.title}
                                      unoptimized
                                    />
                                  </Link>
                                </div>
                              ) : (
                                // Use default placeholder images if no valid image is provided
                                defaultImages.map((img, i) => (
                                  <div key={i} className={`carousel-item ${i === 0 ? 'active' : ''}`} data-bs-interval="1000000">
                                    <Link href={`/listing_details_01/${item.id}`} className="d-block">
                                      <Image 
                                        src={img} 
                                        width={400} 
                                        height={300} 
                                        className="w-100" 
                                        alt={item.title} 
                                      />
                                    </Link>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="property-info p-25">
                        <Link href={`/listing_details_01/${item.id}`} className="title tran3s">{item.title}</Link>
                        <div className="address">{item.area}</div>
                        <ul className="style-none feature d-flex flex-wrap align-items-center justify-content-between">
                          <li className="d-flex align-items-center">
                            <Image 
                              src="/assets/images/icon/bed.svg" 
                              width={20} 
                              height={20} 
                              alt="Bed" 
                              className="lazy-img icon me-2" 
                            />
                            <span className="fs-16">{item.bedroom} Beds</span>
                          </li>
                          <li className="d-flex align-items-center">
                            <Image 
                              src="/assets/images/icon/bath.svg" 
                              width={20} 
                              height={20} 
                              alt="Bath" 
                              className="lazy-img icon me-2" 
                            />
                            <span className="fs-16">{item.bathroom} Baths</span>
                          </li>
                          <li className="d-flex align-items-center">
                            <Image 
                              src="/assets/images/icon/kitchen.svg" 
                              width={20} 
                              height={20} 
                              alt="Kitchen" 
                              className="lazy-img icon me-2" 
                            />
                            <span className="fs-16">{item.kitichen} Kitchen</span>
                          </li>
                        </ul>
                        <div className="pl-footer top-border d-flex align-items-center justify-content-between">
                          <strong className="price fw-500 color-dark">
                            ${item.price.toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            })}
                          </strong>
                          <Link href={`/listing_details_01/${item.id}`} className="btn-four rounded-circle">
                            <i className="bi bi-arrow-up-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center p-5">No properties available at the moment</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Property;