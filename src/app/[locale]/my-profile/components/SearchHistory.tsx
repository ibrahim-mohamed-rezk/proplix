import React from "react";

const SearchHistory = () => {
  const rows = Array(11)
    .fill(null)
    .map((_, index) => ({
      id: index,
      name: "Search Filter 1",
      area: "New Cairo",
      development: "Search Filter 1",
      date: "23 Sep 2024",
      time: "12:40 Pm",
    }));

  return (
    <div className="w-full inline-flex flex-col justify-start items-start gap-8 rounded-2xl p-8">
      {/* Header Section */}
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="w-60 inline-flex flex-col justify-start items-start gap-7">
          <div className="self-stretch justify-start text-neutral-950 text-3xl font-bold font-['Gordita'] leading-loose">
            Search History
          </div>
        </div>
        <button className="w-28 px-6 py-3 rounded-lg outline-1 outline-offset-[-1px] outline-orange-500 flex justify-center items-center gap-2.5 hover:bg-orange-50 transition-colors duration-200">
          <span className="justify-start text-orange-500 text-base font-medium font-['Gordita'] leading-normal">
            Clear
          </span>
          <div className="w-6 h-6 relative">
            <div className="w-5 h-0.5 left-[2.25px] top-[4.71px] absolute bg-orange-600" />
            <div className="w-2 h-1 left-[7.75px] top-[1.25px] absolute bg-orange-600" />
            <div className="w-4 h-3.5 left-[4.40px] top-[8.39px] absolute bg-orange-600" />
            <div className="w-[4.83px] h-[1.50px] left-[9.58px] top-[15.75px] absolute bg-orange-600" />
            <div className="w-1.5 h-[1.50px] left-[8.75px] top-[11.75px] absolute bg-orange-600" />
          </div>
        </button>
      </div>

      {/* Table Section */}
      <div className="w-full inline-flex justify-start items-start">
        {/* Headers */}
        <div className="flex-1 min-w-[200px]">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch inline-flex justify-start items-center gap-8">
              <div className="justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
                Name
              </div>
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[15%] min-w-[120px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
              Area
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[15%] min-w-[120px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
              Dev.
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[15%] min-w-[120px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="w-48 flex-1 text-center justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
              Date
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[15%] min-w-[120px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="self-stretch inline-flex justify-start items-center gap-8">
              <div className="flex-1 text-center justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
                Time
              </div>
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[10%] min-w-[80px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="self-stretch inline-flex justify-start items-center gap-8">
              <div className="flex-1 text-center justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
                Action
              </div>
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>
      </div>

      {/* Rows */}
      {rows.map((row) => (
        <div
          key={row.id}
          className="w-full inline-flex justify-start items-start"
        >
          {/* Name Column */}
          <div className="flex-1 min-w-[200px] inline-flex justify-start items-center gap-2 group hover:bg-neutral-50 p-2 rounded-lg transition-colors duration-200">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.57211 30.3332C6.01211 30.3332 5.49211 30.1998 5.02544 29.9332C3.99878 29.3332 3.41211 28.1198 3.41211 26.6132V7.81317C3.41211 4.4265 6.17211 1.6665 9.55878 1.6665H22.4254C25.8121 1.6665 28.5721 4.4265 28.5721 7.81317V26.5998C28.5721 28.1065 27.9854 29.3198 26.9588 29.9198C25.9321 30.5198 24.5854 30.4532 23.2654 29.7198L16.7588 26.1065C16.3721 25.8932 15.6121 25.8932 15.2254 26.1065L8.71878 29.7198C7.99878 30.1198 7.26544 30.3332 6.57211 30.3332ZM9.57211 3.6665C7.29211 3.6665 5.42544 5.53317 5.42544 7.81317V26.5998C5.42544 27.3865 5.65211 27.9732 6.05211 28.1998C6.45211 28.4265 7.07878 28.3598 7.75878 27.9732L14.2654 24.3598C15.2521 23.8132 16.7454 23.8132 17.7321 24.3598L24.2388 27.9732C24.9188 28.3598 25.5454 28.4398 25.9454 28.1998C26.3454 27.9598 26.5721 27.3732 26.5721 26.5998V7.81317C26.5721 5.53317 24.7054 3.6665 22.4254 3.6665H9.57211V3.6665Z"
                fill="#2A194B"
              />
              <path
                d="M14.7877 17.6664C14.5343 17.6664 14.281 17.5731 14.081 17.3731L12.081 15.3731C11.6943 14.9864 11.6943 14.3464 12.081 13.9598C12.4677 13.5731 13.1077 13.5731 13.4943 13.9598L14.7877 15.2531L19.4144 10.6264C19.801 10.2398 20.441 10.2398 20.8277 10.6264C21.2143 11.0131 21.2143 11.6531 20.8277 12.0398L15.4943 17.3731C15.2943 17.5731 15.041 17.6664 14.7877 17.6664Z"
                fill="#2A194B"
              />
            </svg>
            <div className="justify-start text-zinc-800 text-2xl font-normal font-['Gordita'] leading-loose group-hover:text-zinc-900 transition-colors duration-200">
              {row.name}
            </div>
          </div>

          {/* Area Column */}
          <div className="w-[15%] min-w-[120px] self-stretch text-center justify-start text-neutral-600 text-base font-normal font-['Gordita'] leading-loose hover:text-neutral-900 transition-colors duration-200">
            {row.area}
          </div>

          {/* Development Column */}
          <div className="w-[15%] min-w-[120px] self-stretch text-center justify-start text-neutral-600 text-base font-normal font-['Gordita'] leading-loose hover:text-neutral-900 transition-colors duration-200">
            {row.development}
          </div>

          {/* Date Column */}
          <div className="w-[15%] min-w-[120px] justify-start text-neutral-600 text-base font-normal font-['Gordita'] leading-loose hover:text-neutral-900 transition-colors duration-200">
            {row.date}
          </div>

          {/* Time Column */}
          <div className="w-[15%] min-w-[120px] self-stretch opacity-80 inline-flex justify-center items-center gap-8 hover:opacity-100 transition-opacity duration-200">
            <div className="flex-1 flex justify-start items-center gap-2">
              <div className="flex-1 text-center justify-start text-neutral-600 text-base font-normal font-['Gordita'] leading-loose hover:text-neutral-900 transition-colors duration-200">
                {row.time}
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="w-[10%] min-w-[80px] inline-flex justify-end items-center gap-2">
            <button className="p-2 rounded-lg flex justify-center items-center gap-2.5 hover:bg-red-50 transition-colors duration-200">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.5"
                  y="0.5"
                  width="31"
                  height="31"
                  rx="7.5"
                  stroke="#D82F32"
                />
                <path
                  d="M22.0004 12.4868C21.9871 12.4868 21.9671 12.4868 21.9471 12.4868C18.4204 12.1335 14.9004 12.0001 11.4138 12.3535L10.0538 12.4868C9.77377 12.5135 9.5271 12.3135 9.50043 12.0335C9.47377 11.7535 9.67377 11.5135 9.9471 11.4868L11.3071 11.3535C14.8538 10.9935 18.4471 11.1335 22.0471 11.4868C22.3204 11.5135 22.5204 11.7601 22.4938 12.0335C22.4738 12.2935 22.2538 12.4868 22.0004 12.4868Z"
                  fill="#D82F32"
                />
                <path
                  d="M13.6665 11.8135C13.6398 11.8135 13.6132 11.8135 13.5798 11.8068C13.3132 11.7602 13.1265 11.5002 13.1732 11.2335L13.3198 10.3602C13.4265 9.72016 13.5732 8.8335 15.1265 8.8335H16.8732C18.4332 8.8335 18.5798 9.7535 18.6798 10.3668L18.8265 11.2335C18.8732 11.5068 18.6865 11.7668 18.4198 11.8068C18.1465 11.8535 17.8865 11.6668 17.8465 11.4002L17.6998 10.5335C17.6065 9.9535 17.5865 9.84016 16.8798 9.84016H15.1332C14.4265 9.84016 14.4132 9.9335 14.3132 10.5268L14.1598 11.3935C14.1198 11.6402 13.9065 11.8135 13.6665 11.8135Z"
                  fill="#D82F32"
                />
                <path
                  d="M18.1396 23.1667H13.8596C11.5329 23.1667 11.4396 21.8801 11.3663 20.8401L10.9329 14.1267C10.9129 13.8534 11.1263 13.6134 11.3996 13.5934C11.6796 13.5801 11.9129 13.7867 11.9329 14.0601L12.3663 20.7734C12.4396 21.7867 12.4663 22.1667 13.8596 22.1667H18.1396C19.5396 22.1667 19.5663 21.7867 19.6329 20.7734L20.0663 14.0601C20.0863 13.7867 20.3263 13.5801 20.5996 13.5934C20.8729 13.6134 21.0863 13.8467 21.0663 14.1267L20.6329 20.8401C20.5596 21.8801 20.4663 23.1667 18.1396 23.1667Z"
                  fill="#D82F32"
                />
                <path
                  d="M17.1067 19.5H14.8867C14.6134 19.5 14.3867 19.2733 14.3867 19C14.3867 18.7267 14.6134 18.5 14.8867 18.5H17.1067C17.3801 18.5 17.6067 18.7267 17.6067 19C17.6067 19.2733 17.3801 19.5 17.1067 19.5Z"
                  fill="#D82F32"
                />
                <path
                  d="M17.6673 16.8335H14.334C14.0607 16.8335 13.834 16.6068 13.834 16.3335C13.834 16.0602 14.0607 15.8335 14.334 15.8335H17.6673C17.9407 15.8335 18.1673 16.0602 18.1673 16.3335C18.1673 16.6068 17.9407 16.8335 17.6673 16.8335Z"
                  fill="#D82F32"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchHistory;
