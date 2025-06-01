import { Link } from "@/i18n/routing";
import React from "react";

const Sidebar = ({ page }: { page: string | undefined }) => {
  return (
    <div>
      <div className="w-full max-w-[384px] h-auto min-h-[819px] flex flex-col justify-between items-start p-4 md:p-6">
        <div className="w-full flex flex-col justify-start items-start gap-8 md:gap-12">
          <h1 className="text-[32px] font-[700] text-black leading-tight md:leading-10">
            My Account
          </h1>
          <div className="w-full flex flex-col justify-start items-start">
            {[
              {
                title: "Account Details",
                url: `/my-profile?page=personal-information`,
              },
              {
                title: " Favorite Properties",
                url: `/my-profile?page=favorites`,
              },
              {
                title: "Search History",
                url: `/my-profile?page=search-history`,
              },
              {
                title: "Settings",
                url: `/my-profile?page=settings`,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`w-full px-4 md:px-6 py-3 md:py-4 cursor-pointer rounded-[8px]  flex justify-between items-center ${
                  page === item.url.split("=")[1] &&
                  "bg-[#FFD4C2] text-[#000] border-s-[4px] border-[#F54900] "
                }`}
              >
                <Link
                  href={item.url}
                  className={`text-xl no-underline md:text-2xl font-medium text-[#000] leading-relaxed `}
                >
                  {item.title}
                </Link>
                {page === item.url.split("=")[1] && (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.90961 20.67C8.71961 20.67 8.52961 20.6 8.37961 20.45C8.08961 20.16 8.08961 19.68 8.37961 19.39L14.8996 12.87C15.3796 12.39 15.3796 11.61 14.8996 11.13L8.37961 4.61002C8.08961 4.32002 8.08961 3.84002 8.37961 3.55002C8.66961 3.26002 9.14961 3.26002 9.43961 3.55002L15.9596 10.07C16.4696 10.58 16.7596 11.27 16.7596 12C16.7596 12.73 16.4796 13.42 15.9596 13.93L9.43961 20.45C9.28961 20.59 9.09961 20.67 8.90961 20.67Z"
                      fill="#2A194B"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full px-4 md:px-6 py-3 md:py-4 bg-red-600 rounded-lg flex justify-between items-center">
          <span className="text-xl md:text-2xl font-medium text-white leading-relaxed">
            Logout
          </span>
          <div className="w-5 h-5 md:w-6 md:h-6 relative">
            <div className="w-3.5 h-5 left-[8.15px] top-[1.73px] absolute bg-white" />
            <div className="w-3 h-[1.50px] left-[2.87px] top-[11.25px] absolute bg-white" />
            <div className="w-[4.85px] h-2 left-[1.75px] top-[7.90px] absolute bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
