// "use client";

import HeaderOne from "@/layouts/headers/HeaderOne";
import { cookies } from "next/headers";
import Banner from "./components/Banner";
import FooterOne from "@/layouts/footers/FooterOne";
import CircularProgress from "./components/CircularProgress";
import ProgressBar from "./components/ProgressBar";
import "./installments.css";
import { postData } from "@/libs/server/backendServer";

const page = async ({ searchParams }: { searchParams: any }) => {
  const token = (await cookies()).get("token")?.value;
  const price = searchParams.price;
  const down = searchParams.down;
  const loanTerm = searchParams.loanTerm;

  // Fetch installments data
  let installmentsData: any = null;
  let error: any = null;

  try {
    const response = await postData(
      "get-installment-Plan",
      {
        total_price: price,
        down_payment: down,
        installment_count: parseInt(loanTerm || "0"),
        start_date: new Date(),
        currency: "EGP",
      },
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      }
    );
    installmentsData = response.data;
  } catch (err) {
    error = err;
    console.error("Error fetching installments:", err);
  }

  // Extract progress percentage (remove % sign for CircularProgress component)
  const progressValue = installmentsData?.progress
    ? parseInt(installmentsData.progress.replace("%", ""))
    : 0;

  return (
    <div className="!bg-[#fff]">
      <HeaderOne token={token} style={false} />
      <Banner />
      <div className="z-1 pt-[64px] pb-250 xl-pb-150 position-relative">
        <div className="container mx-auto">
          <div className="w-full max-w-[1392px] mx-auto">
            <div className="w-full rounded-[24px] p-4 md:p-10 bg-[#FFF8F4] rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="w-full lg:w-[672px] flex flex-col justify-start items-start gap-8">
                {/* Statistics Container */}
                <div className="w-full flex flex-wrap justify-between items-center">
                  {/* Statistics text */}
                  <div className="w-[50%] statstics-container flex flex-col justify-start items-start gap-4">
                    <div className="w-full text-black text-2xl md:text-4xl font-medium font-['Gordita'] leading-[48px]">
                      Payment Plan Overview
                    </div>
                    <div className="w-full text-neutral-500 text-xl md:text-3xl font-normal font-['Gordita'] leading-loose">
                      Total Property Value
                    </div>
                    <div className="w-full">
                      <span className="text-[#0A0A0A] text-2xl md:text-4xl font-bold font-['Gordita'] leading-[48px]">
                        {installmentsData?.total_price || `${price} EGP`}
                      </span>
                    </div>
                    <ProgressBar value={progressValue} />
                  </div>
                  {/* Statistics circle */}
                  <div className="text-[#FF6625] statstics-circle text-xl md:text-2xl font-medium font-['Gordita'] leading-normal">
                    <CircularProgress value={progressValue} strokeWidth={25} />
                  </div>
                </div>
              </div>
              <div className="w-full mt-[40px] flex flex-col justify-end items-center gap-10">
                <div className="w-full statstics-info flex justify-end items-center gap-[60px]">
                  <div className="flex justify-start items-center gap-[4px]">
                    <div className="w-[40px] h-[24px] bg-[#FF6625] rounded" />
                    <div className="text-center text-stone-500 text-lg md:text-2xl font-normal font-['Gordita'] leading-loose">
                      Paid
                    </div>
                  </div>

                  <div className="flex justify-start items-center gap-[4px]">
                    <div className="w-[40px] h-[24px] bg-[#D8D8D8] rounded" />
                    <div className="text-center text-stone-500 text-lg md:text-2xl font-normal font-['Gordita'] leading-loose">
                      Remaining
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[48px] w-full flex flex-wrap items-center justify-stretch gap-[16px]">
              {/* Total Paid Card */}
              <div className="p-4 w-[24%] featured-card rounded-[8px] md:p-6 bg-[#FFF8F4] rounded-lg outline-1 outline-offset-[-1px] outline-[#FFB799] flex flex-col justify-start items-start gap-2">
                <div className="text-neutral-400 text-sm md:text-base font-normal font-['Gordita'] leading-tight">
                  Total Paid
                </div>
                <div className="h-6 flex items-center">
                  <span className="text-[#0A0A0A] text-xl md:text-2xl font-medium font-['Gordita'] leading-loose">
                    {installmentsData?.total_paid || "0.00 EGP"}
                  </span>
                </div>
              </div>

              {/* Remaining Balance Card */}
              <div className="p-4 w-[24%] featured-card rounded-[8px] md:p-6 bg-[#FFF8F4] rounded-lg outline-1 outline-offset-[-1px] outline-[#FFB799] flex flex-col justify-start items-start gap-2">
                <div className="text-neutral-400 text-sm md:text-base font-normal font-['Gordita'] leading-tight">
                  Remaining Balance
                </div>
                <div className="h-6 flex items-center">
                  <span className="text-[#0A0A0A] text-xl md:text-2xl font-medium font-['Gordita'] leading-loose">
                    {installmentsData?.remaining_balance || "0.00 EGP"}
                  </span>
                </div>
              </div>

              {/* Monthly Payment Card */}
              <div className="p-4 w-[24%] featured-card rounded-[8px] md:p-6 bg-[#FFF8F4] rounded-lg outline-1 outline-offset-[-1px] outline-[#FFB799] flex flex-col justify-start items-start gap-2">
                <div className="text-neutral-400 text-sm md:text-base font-normal font-['Gordita'] leading-tight">
                  Monthly Payment
                </div>
                <div className="h-6 flex items-center">
                  <span className="text-[#0A0A0A] text-xl md:text-2xl font-medium font-['Gordita'] leading-loose">
                    {installmentsData?.monthly_payment || "0.00 EGP"}
                  </span>
                </div>
              </div>

              {/* Next Payment Due Card */}
              <div className="p-4 w-[24%] featured-card rounded-[8px] md:p-6 bg-[#FFF8F4] rounded-lg outline-1 outline-offset-[-1px] outline-[#FFB799] flex flex-col justify-start items-start gap-2">
                <div className="text-neutral-400 text-sm md:text-base font-normal font-['Gordita'] leading-tight">
                  Next Payment Due
                </div>
                <div className="h-6 flex items-center">
                  <span className="text-[#0A0A0A] text-xl md:text-2xl font-medium font-['Gordita'] leading-loose">
                    {installmentsData?.next_payment_due || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-[48px] flex flex-col gap-4">
              {installmentsData?.installments?.map((installment: any) => (
                <div
                  key={installment.number}
                  className="relative rounded-[8px] flex justify-start items-center md:items-center gap-4"
                >
                  <div className="h-[64px] !w-[64px] bg-black rounded-full flex justify-center items-center">
                    <div className="text-white text-xl md:text-3xl font-normal font-['Gordita'] leading-10">
                      {installment.number}
                    </div>
                  </div>
                  <div className="flex w-[calc(100%-72px)] items-center px-[16px] py-4 rounded-[8px] bg-[#FFF8F4] justify-between gap-2">
                    <div className="flex flex-col items-start gap-1">
                      <div className="text-black text-lg md:text-xl font-normal font-['Gordita'] leading-loose">
                        {installment.title}
                      </div>
                      <div className="text-gray-500 text-sm md:text-base font-normal font-['Gordita']">
                        Due: {installment.due_date}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-gray-900 text-lg md:text-xl font-normal font-['Gordita'] leading-loose">
                        {installment.amount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Show error message if API call failed */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">
                    Failed to load installment data. Please try again later.
                  </p>
                </div>
              )}

              {/* Show loading state if no data and no error */}
              {!installmentsData && !error && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-gray-600">Loading installment data...</p>
                </div>
              )}

              <button className="mt-4 w-[139px] ms-auto py-[12px] bg-[#FF6625] rounded-[8px] inline-flex justify-center items-center gap-[8px] hover:bg-[#ff6625ef] transition-colors">
                <div className="text-white text-base font-medium font-['Gordita'] leading-tight">
                  Payment
                </div>
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 11 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.21967 0.969668C5.51256 0.676777 5.98744 0.676777 6.28033 0.969668L10.5303 5.21967C10.8232 5.51256 10.8232 5.98744 10.5303 6.28033L6.28033 10.5303C5.98744 10.8232 5.51256 10.8232 5.21967 10.5303C4.92678 10.2374 4.92678 9.7626 5.21967 9.4697L8.1893 6.5H0.75C0.33579 6.5 0 6.16421 0 5.75C0 5.33579 0.33579 5 0.75 5H8.1893L5.21967 2.03033C4.92678 1.73744 4.92678 1.26256 5.21967 0.969668Z"
                    fill="#FFFFFE"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <FooterOne style={false} />
    </div>
  );
};

export default page;
