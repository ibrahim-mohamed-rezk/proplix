// import FeatureListing from "../listing-details-sidebar.tsx/FeatureListing"
import { PropertyTypes } from "@/libs/types/types";
import MortgageCalculator from "../listing-details-sidebar.tsx/MortgageCalculator"
import ScheduleForm from "../listing-details-sidebar.tsx/ScheduleForm"
import SidebarInfo from "../listing-details-sidebar.tsx/SidebarInfo"

const Sidebar = ({ property }: { property?: PropertyTypes }) => {
  return (
    <div className="col-xl-4 col-lg-8 me-auto ms-auto">
      <div className="theme-sidebar-one dot-bg p-30 ms-xxl-3 lg-mt-80">
        <div className="agent-info bg-white rounded-[20px] p-30 mb-40">
          <SidebarInfo property={property} />
        </div>
        <div className="tour-schedule rounded-[20px] bg-white p-30 mb-40">
          <h5 className="mb-40">Schedule Tour</h5>
          <ScheduleForm property={property} />
        </div>
        <div className="mortgage-calculator rounded-[20px] bg-white p-30 mb-20">
          <h5 className="mb-40">Mortgage Calculator</h5>
          <MortgageCalculator property={property} />
        </div>
        {/* <FeatureListing /> */}
      </div>
    </div>
  );
};

export default Sidebar
