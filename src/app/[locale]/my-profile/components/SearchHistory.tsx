"use client";
import { deleteData, getData } from "@/libs/server/backendServer";
import { PropertyTypes } from "@/libs/types/types";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const SearchHistory = ({ token }: { token: string }) => {
  const locale = useLocale();
  const t = useTranslations("SearchHistory");
  const [logs, setLogs] = useState<PropertyTypes[]>([]);

  // fetch data from api
  const feachData = async () => {
    try {
      const response = await getData(
        "view",
        {},
        {
          lang: locale,
          Authorization: `Bearer ${token}`,
        }
      );
      setLogs(response.data.data);
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    feachData();
  }, [token, locale]);

  // delet item from logs
  const deleteItem = async (id: string | number) => {
    try {
      await deleteData(`view/delete/${id}`, {
        lang: locale,
        Authorization: `Bearer ${token}`,
      });
      feachData();
    } catch (error) {
      throw error;
    }
  };

  // clear all logs
  const clearHistory = async () => {
    try {
      await deleteData(`view/clear`, {
        lang: locale,
        Authorization: `Bearer ${token}`,
      });
      feachData();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="w-full inline-flex flex-col justify-start items-start gap-8 rounded-2xl p-8">
      {/* Header Section */}
      <div className="self-stretch inline-flex justify-between items-center">
        <div className="w-60 inline-flex flex-col justify-start items-start gap-7">
          <div className="self-stretch justify-start text-neutral-950 text-3xl font-bold font-['Gordita'] leading-loose">
            {t("title")}
          </div>
        </div>
        <button
          onClick={() => clearHistory()}
          className="w-[119px] h-[48px] rounded-[8px] outline-1 outline-offset-[-1px] outline-[#FF6625] flex justify-center items-center gap-[10px] hover:bg-orange-50 transition-colors duration-200"
        >
          <span className="justify-start text-[#FF6625] text-base font-medium font-['Gordita'] leading-normal">
            {t("clear")}
          </span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.9999 6.73001C20.9799 6.73001 20.9499 6.73001 20.9199 6.73001C15.6299 6.20001 10.3499 6.00001 5.11992 6.53001L3.07992 6.73001C2.65992 6.77001 2.28992 6.47001 2.24992 6.05001C2.20992 5.63001 2.50992 5.27001 2.91992 5.23001L4.95992 5.03001C10.2799 4.49001 15.6699 4.70001 21.0699 5.23001C21.4799 5.27001 21.7799 5.64001 21.7399 6.05001C21.7099 6.44001 21.3799 6.73001 20.9999 6.73001Z"
              fill="#F54900"
            />
            <path
              d="M8.50001 5.72C8.46001 5.72 8.42001 5.72 8.37001 5.71C7.97001 5.64 7.69001 5.25 7.76001 4.85L7.98001 3.54C8.14001 2.58 8.36001 1.25 10.69 1.25H13.31C15.65 1.25 15.87 2.63 16.02 3.55L16.24 4.85C16.31 5.26 16.03 5.65 15.63 5.71C15.22 5.78 14.83 5.5 14.77 5.1L14.55 3.8C14.41 2.93 14.38 2.76 13.32 2.76H10.7C9.64001 2.76 9.62001 2.9 9.47001 3.79L9.24001 5.09C9.18001 5.46 8.86001 5.72 8.50001 5.72Z"
              fill="#F54900"
            />
            <path
              d="M15.2099 22.75H8.7899C5.2999 22.75 5.1599 20.82 5.0499 19.26L4.3999 9.19001C4.3699 8.78001 4.6899 8.42001 5.0999 8.39001C5.5199 8.37001 5.8699 8.68001 5.8999 9.09001L6.5499 19.16C6.6599 20.68 6.6999 21.25 8.7899 21.25H15.2099C17.3099 21.25 17.3499 20.68 17.4499 19.16L18.0999 9.09001C18.1299 8.68001 18.4899 8.37001 18.8999 8.39001C19.3099 8.42001 19.6299 8.77001 19.5999 9.19001L18.9499 19.26C18.8399 20.82 18.6999 22.75 15.2099 22.75Z"
              fill="#F54900"
            />
            <path
              d="M13.6601 17.25H10.3301C9.92008 17.25 9.58008 16.91 9.58008 16.5C9.58008 16.09 9.92008 15.75 10.3301 15.75H13.6601C14.0701 15.75 14.4101 16.09 14.4101 16.5C14.4101 16.91 14.0701 17.25 13.6601 17.25Z"
              fill="#F54900"
            />
            <path
              d="M14.5 13.25H9.5C9.09 13.25 8.75 12.91 8.75 12.5C8.75 12.09 9.09 11.75 9.5 11.75H14.5C14.91 11.75 15.25 12.09 15.25 12.5C15.25 12.91 14.91 13.25 14.5 13.25Z"
              fill="#F54900"
            />
          </svg>
        </button>
      </div>

      {/* Table Section */}

      <div className="w-full mt-[20px] inline-flex justify-start items-start">
        {/* Headers */}
        <div className="flex-1 w-[25%] min-w-[200px]">
          <div className="self-stretch flex flex-col justify-start items-start gap-2">
            <div className="self-stretch inline-flex justify-start items-center gap-8">
              <div className="justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
                {t("name")}
              </div>
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[25%] min-w-[120px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
              {t("area")}
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[25%] min-w-[120px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="w-48 flex-1 text-center justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
              {t("date")}
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>

        <div className="w-[25%] min-w-[80px]">
          <div className="self-stretch flex flex-col justify-center items-center gap-2">
            <div className="self-stretch inline-flex justify-start items-center gap-8">
              <div className="flex-1 text-center justify-start text-zinc-800 text-2xl font-medium font-['Gordita'] leading-loose">
                {t("action")}
              </div>
            </div>
            <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-neutral-400" />
          </div>
        </div>
      </div>
      {logs.length === 0 ? (
        <div className="w-full mt-[20px] flex justify-center items-center py-8">
          <p className="text-neutral-600 text-lg font-normal font-['Gordita']">
            {t("noLogs")}
          </p>
        </div>
      ) : (
        <>
          {/* Rows */}
          {logs.map((row) => (
            <div
              key={row.id}
              className="w-full inline-flex justify-start items-stretch"
            >
              {/* Name Column */}
              <div className="flex-1 w-[25%] min-w-[200px] inline-flex justify-start items-center gap-2 group hover:bg-neutral-50 p-2 rounded-lg transition-colors duration-200">
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
                  {row.title}
                </div>
              </div>

              {/* Area Column */}
              <div className="w-[25%] flex items-center justify-center min-w-[120px] self-stretch text-center text-neutral-600 text-base font-normal font-['Gordita'] leading-loose hover:text-neutral-900 transition-colors duration-200">
                {row.area.name}
              </div>

              {/* Date Column */}
              <div className="w-[25%] flex items-center justify-center min-w-[120px] text-neutral-600 text-base font-normal font-['Gordita'] leading-loose hover:text-neutral-900 transition-colors duration-200">
                {new Date(row.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </div>

              {/* Action Column */}
              <div className="w-[25%] min-w-[80px] inline-flex justify-end items-center gap-2">
                <button
                  onClick={() => deleteItem(row.id)}
                  className="p-2 rounded-lg flex justify-center items-center gap-2.5 hover:bg-red-50 transition-colors duration-200"
                >
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
        </>
      )}
    </div>
  );
};

export default SearchHistory;
