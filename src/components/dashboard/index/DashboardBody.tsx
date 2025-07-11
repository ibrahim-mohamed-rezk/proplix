"use client"
import Image, { StaticImageData } from "next/image"
import { useEffect, useState } from "react"
import NiceSelect from "@/ui/NiceSelect"
import DashboardHeaderTwo from "@/layouts/headers/dashboard/DashboardHeaderTwo"

import icon_1 from "@/assets/images/dashboard/icon/icon_12.svg"
import icon_2 from "@/assets/images/dashboard/icon/icon_13.svg"
import icon_3 from "@/assets/images/dashboard/icon/icon_14.svg"
import icon_4 from "@/assets/images/dashboard/icon/icon_15.svg"
import DashboardChart from "./DashboardChart"
import { getData } from "@/libs/server/backendServer"
import { useTranslations } from "next-intl"

interface DataType {
   id: number;
   icon: StaticImageData;
   title: string;
   value: string;
   class_name?: string;
}

interface StatisticsData {
   total: number;
   cancelled: number;
   pending: number;
   accepted: number;
   for_sale: number;
   for_rent: number;
   immediate_delivery: number;
   average_price: number;
   total_price_for_sale: number;
   total_price_for_rent: number;
   by_area: Array<{
      area_name: string;
      count: number;
   }>;
   by_type: any[];
}

interface ApiResponse {
   status: boolean;
   msg: string;
   data: StatisticsData;
}

const DashboardBody = ({token}:{token:string}) => {
   const [statistics, setStatistics] = useState<StatisticsData | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
  const t = useTranslations('dashboard-index');

   // Fetch statistics data
   useEffect(() => {
      const fetchStatistics = async () => {
         try {
            setLoading(true);
            const response = await getData(
               'agent/statistics',
               {},
               {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
               }
            );
            
            if (response.data.status) {
               setStatistics(response.data.data);
            } else {
               setError(response.data.msg || 'Failed to fetch statistics');
            }
         } catch (err) {
            console.error('Error fetching statistics:', err);
            setError('Failed to load dashboard data');
         } finally {
            setLoading(false);
         }
      };

      if (token) {
         fetchStatistics();
      }
   }, [token]);

   // Dynamic dashboard card data based on API response - only show if data exists
   const getDashboardCardData = (): DataType[] => {
      if (!statistics) {
         return [];
      }

      return [
         {
            id: 1,
            icon: icon_1,
          title: t('all_properties'),
            value: statistics.total.toString(),
            class_name: "skew-none",
         },
         {
            id: 2,
            icon: icon_2,
           title: t('total_pending'),
            value: statistics.pending.toString(),
         },
         {
            id: 3,
            icon: icon_3,
           title: t('for_sale'),
            value: statistics.for_sale.toString(),
         },
         {
            id: 4,
            icon: icon_4,
           title: t('for_rent'),
            value: statistics.for_rent.toString(),
         },
      ];
   };

   const selectHandler = (e: any) => { };

   // Show loading state
   if (loading) {
      return (
         <div className="dashboard-body">
            <div className="position-relative">
            <DashboardHeaderTwo title={t('dashboard')} />
               <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                  <div className="spinner-border" role="status">
                <span className="visually-hidden">{t('loading')}</span>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // Show NOT FOUND if no data or error
   if (error || !statistics) {
      return (
         <div className="dashboard-body">
            <div className="position-relative">
            <DashboardHeaderTwo title={t('dashboard')} />
               <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                  <div className="text-center">
                <h2 className="text-muted">{t('not_found')}</h2>
                     {error && <p className="text-danger">{error}</p>}
                  </div>
               </div>
            </div>
         </div>
      );
   }

   const dashboardCardData = getDashboardCardData();

   return (
     <div className="dashboard-body">
       <div className="position-relative">
         <DashboardHeaderTwo title='dashboard' />
         {/* First Row - Main Statistics (4 icons) */}
         <div className="bg-white  rounded-3 p-4 mb-4">
           <div className="row g-3">
             {dashboardCardData.map((item) => (
               <div key={item.id} className="col-lg-3 col-md-6 col-12">
                 <div className="dash-card-one bg-gradient-light border-0  rounded-3 position-relative p-3 h-100">
                   <div className="d-sm-flex align-items-center justify-content-between h-100">
                     <div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-dark" 
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            minWidth: '48px',
                            minHeight: '48px',
                            flexShrink: '0'
                          }}>
                       <Image 
                         src={item.icon} 
                         alt={item.title} 
                         className="lazy-img" 
                         width={24} 
                         height={24}
                         style={{ 
                           filter: 'brightness(0) invert(1)',
                           objectFit: 'contain'
                         }}
                         priority={true}
                         unoptimized={true}
                       />
                     </div>
                     <div className="order-sm-0 flex-grow-1">
                       <span className="text-muted small d-block mb-1">{item.title}</span>
                       <div className="value fw-bold text-dark" style={{ fontSize: '42px' }}>{item.value}</div>
                     </div>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>

         <div className="row d-flex pt-15 lg-pt-10">
           <div className="col-12">
             <div className="user-activity-chart bg-white  rounded-3 p-4">
               <div className="d-flex align-items-center justify-content-between mb-4">
                 <h5 className="dash-title-two mb-0 fw-bold text-dark">{t('property_analytics_overview')}</h5>
                 <div className="short-filter d-flex align-items-center">
                   <div className="fs-16 me-3 text-muted">{t('filter_by')}</div>
                   <NiceSelect
                     className="nice-select fw-normal border rounded-2"
                     options={[
                       { value: "1", text: t('weekly') },
                       { value: "2", text: t('daily') },
                       { value: "3", text: t('monthly') },
                     ]}
                     defaultCurrent={0}
                     onChange={selectHandler}
                     name=""
                     placeholder=""
                   />
                 </div>
               </div>
               <div className="chart-wrapper bg-light rounded-3 p-3">
                 <DashboardChart />
               </div>
             </div>
           </div>
         </div>

         {/* Second Row - Additional Statistics (4 icons under chart) */}
         <div className="bg-white  rounded-3 p-4 mt-4">
           <div className="row g-3">
             <div className="col-lg-3 col-md-6 col-12">
               <div className="dash-card-one bg-white border-0  rounded-3 position-relative p-3 h-100">
                 <div className="d-sm-flex align-items-center justify-content-between h-100">
                   <div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-dark"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          minWidth: '48px',
                          minHeight: '48px',
                          flexShrink: '0'
                        }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V6C15 4.9 14.1 4 13 4H11C9.9 4 9 4.9 9 6V7.5L3 7V9L9 8.5V21C9 21.6 9.4 22 10 22H14C14.6 22 15 21.6 15 21V8.5L21 9Z" fill="#ffffff" />
                     </svg>
                   </div>
                   <div className="order-sm-0 flex-grow-1">
                     <span className="text-muted small d-block mb-1">{t('average_price')}</span>
                     <div className="value fw-bold text-dark" style={{ fontSize: '42px' }}>{statistics?.average_price?.toLocaleString()} {t('egp')}</div>
                   </div>
                 </div>
               </div>
             </div>
             <div className="col-lg-3 col-md-6 col-12">
               <div className="dash-card-one bg-white border-0  rounded-3 position-relative p-3 h-100">
                 <div className="d-sm-flex align-items-center justify-content-between h-100">
                   <div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-dark"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          minWidth: '48px',
                          minHeight: '48px',
                          flexShrink: '0'
                        }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#ffffff" />
                     </svg>
                   </div>
                   <div className="order-sm-0 flex-grow-1">
                     <span className="text-muted small d-block mb-1">{t('cancelled')}</span>
                     <div className="value fw-bold text-dark" style={{ fontSize: '42px' }}>{statistics.cancelled}</div>
                   </div>
                 </div>
               </div>
             </div>
             <div className="col-lg-3 col-md-6 col-12">
               <div className="dash-card-one bg-white border-0  rounded-3 position-relative p-3 h-100">
                 <div className="d-sm-flex align-items-center justify-content-between h-100">
                   <div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-dark"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          minWidth: '48px',
                          minHeight: '48px',
                          flexShrink: '0'
                        }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#ffffff" />
                     </svg>
                   </div>
                   <div className="order-sm-0 flex-grow-1">
                     <span className="text-muted small d-block mb-1">{t('accepted')}</span>
                     <div className="value fw-bold text-dark" style={{ fontSize: '42px' }}>{statistics.accepted}</div>
                   </div>
                 </div>
               </div>
             </div>
             <div className="col-lg-3 col-md-6 col-12">
               <div className="dash-card-one bg-white border-0  rounded-3 position-relative p-3 h-100">
                 <div className="d-sm-flex align-items-center justify-content-between h-100">
                   <div className="icon rounded-circle d-flex align-items-center justify-content-center order-sm-1 bg-dark"
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          minWidth: '48px',
                          minHeight: '48px',
                          flexShrink: '0'
                        }}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                       <path d="M13 3C9.23 3 6.19 5.95 6 9.66L4.74 12.38C4.16 13.5 5.02 14.76 6.27 14.76H7.79C7.93 16.02 8.94 17.03 10.21 17.17V19H8V21H16V19H13.79C14.05 18.85 14.28 18.65 14.46 18.41C14.73 18.05 14.9 17.62 14.97 17.17H16.73C17.98 17.17 18.84 15.91 18.26 14.79L17 12.07C16.81 8.95 13.77 6 10 6H13C13 4.34 14.34 3 16 3V1C12.69 1 10 3.69 10 7H13V3Z" fill="#ffffff" />
                     </svg>
                   </div>
                   <div className="order-sm-0 flex-grow-1">
                     <span className="text-muted small d-block mb-1">{t('immediate_delivery')}</span>
                     <div className="value fw-bold text-dark" style={{ fontSize: '42px' }}>{statistics.immediate_delivery}</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Area Statistics - only show if data exists */}
         {statistics.by_area.length > 0 && (
           <div className="row mt-4">
             <div className="col-12">
               <div className="bg-white  rounded-3 p-4">
                 <div className="d-flex align-items-center justify-content-between mb-4">
                   <h5 className="dash-title-two mb-0 fw-bold text-dark">{t('properties_distribution_by_area')}</h5>
                   <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                     {statistics.by_area.length} {t('areas')}
                   </span>
                 </div>
                 <div className="row g-3">
                   {statistics.by_area.map((area, index) => (
                     <div key={index} className="col-lg-4 col-md-6 col-12">
                       <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border-start border-primary border-4">
                         <div>
                           <span className="fw-semibold text-dark">{area.area_name}</span>
                           <div className="text-muted small">{t('properties')}</div>
                         </div>
                         <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">{area.count}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
}

export default DashboardBody