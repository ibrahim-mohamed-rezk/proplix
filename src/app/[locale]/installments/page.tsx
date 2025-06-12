import HeaderOne from "@/layouts/headers/HeaderOne";
import { cookies } from "next/headers";
import Banner from "./components/Banner";
import FooterOne from "@/layouts/footers/FooterOne";
import CircularProgress from "./components/CircularProgress";
import ProgressBar from "./components/ProgressBar";
import "./installments.css";

type PaymentMethodType = "Bank Transfer" | "Credit Card";

interface Installment {
  id: number;
  amount: number;
  dueDate: string;
  status: "paid" | "pending";
  paymentMethod: PaymentMethodType;
  paymentDate: string | null;
  transactionId: string | null;
  lateFee: number;
  notes: string;
}

const installmentsData: Installment[] = [
  {
    id: 1,
    amount: 1203211231,
    dueDate: "2024-03-15",
    status: "paid",
    paymentMethod: "Bank Transfer",
    paymentDate: "2024-03-10",
    transactionId: "TRX123456",
    lateFee: 0,
    notes: "Early payment",
  },
  {
    id: 2,
    amount: 120321231,
    dueDate: "2024-04-15",
    status: "pending",
    paymentMethod: "Credit Card",
    paymentDate: null,
    transactionId: null,
    lateFee: 0,
    notes: "Scheduled payment",
  },
  {
    id: 3,
    amount: 120321231,
    dueDate: "2024-05-15",
    status: "pending",
    paymentMethod: "Bank Transfer",
    paymentDate: null,
    transactionId: null,
    lateFee: 0,
    notes: "Scheduled payment",
  },
  {
    id: 4,
    amount: 120321231,
    dueDate: "2024-06-15",
    status: "pending",
    paymentMethod: "Credit Card",
    paymentDate: null,
    transactionId: null,
    lateFee: 0,
    notes: "Scheduled payment",
  },
  {
    id: 5,
    amount: 120321231,
    dueDate: "2024-07-15",
    status: "pending",
    paymentMethod: "Bank Transfer",
    paymentDate: null,
    transactionId: null,
    lateFee: 0,
    notes: "Scheduled payment",
  },
  {
    id: 6,
    amount: 120321231,
    dueDate: "2024-08-15",
    status: "pending",
    paymentMethod: "Credit Card",
    paymentDate: null,
    transactionId: null,
    lateFee: 0,
    notes: "Scheduled payment",
  },
];

const page = async () => {
  const token = (await cookies()).get("token")?.value;
  const user = JSON.parse((await cookies()).get("user")?.value || "{}");

  // Calculate total amount and remaining amount
  const totalAmount = installmentsData.reduce(
    (sum, installment) => sum + installment.amount,
    0
  );
  const paidAmount = installmentsData
    .filter((installment) => installment.status === "paid")
    .reduce((sum, installment) => sum + installment.amount, 0);
  const progressPercentage = Math.round((paidAmount / totalAmount) * 100);

  return (
    <div className="!bg-[#fff]">
      <HeaderOne user={user} token={token} style={false} />
      <Banner />
      <div className="z-1 pt-[64px] pb-250 xl-pb-150 position-relative">
        <div className="container mx-auto">
          <div className="w-full max-w-[1392px] mx-auto">
            <div className="w-full rounded-[24px] p-4 md:p-10 bg-[#FFF8F4] rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="w-full lg:w-[672px] flex flex-col justify-start items-start gap-8">
                {/* Statstics Container */}
                <div className="w-full flex flex-wrap justify-between items-center">
                  {/* Statstics text */}
                  <div className="w-[50%] statstics-container flex flex-col justify-start items-start gap-4">
                    <div className="w-full text-black text-2xl md:text-4xl font-medium font-['Gordita'] leading-[48px]">
                      Payment Plan Overview
                    </div>
                    <div className="w-full text-neutral-500 text-xl md:text-3xl font-normal font-['Gordita'] leading-loose">
                      Total Property Value
                    </div>
                    <div className="w-full">
                      <span className="text-[#0A0A0A] text-2xl md:text-4xl font-bold font-['Gordita'] leading-[48px]">
                        {totalAmount.toLocaleString()}
                      </span>
                      <span className="text-black text-xl md:text-3xl font-medium font-['Gordita'] leading-10">
                        {" "}
                        EGY
                      </span>
                    </div>
                    <ProgressBar />
                  </div>
                  {/* Statstics circle */}
                  <div className="text-[#FF6625] statstics-circle text-xl md:text-2xl font-medium font-['Gordita'] leading-normal">
                    <CircularProgress
                      value={progressPercentage}
                      strokeWidth={25}
                    />
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
              {[0, 1, 2, 3].map((item) => {
                return (
                  <div className="p-4 w-[24%] featured-card rounded-[8px] md:p-6 bg-[#FFF8F4] rounded-lg outline-1 outline-offset-[-1px] outline-[#FFB799] flex flex-col justify-start items-start gap-2">
                    <div className="text-neutral-400 text-sm md:text-base font-normal font-['Gordita'] leading-tight">
                      Total Paid
                    </div>
                    <div className="h-6 flex items-center">
                      <span className="text-[#0A0A0A] text-xl md:text-2xl font-medium font-['Gordita'] leading-loose">
                        {paidAmount.toLocaleString()}
                      </span>
                      <span className="text-black text-lg md:text-xl font-medium font-['Gordita'] leading-loose">
                        {" "}
                        EGY
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-[48px] flex flex-col gap-4">
              {installmentsData.map((installment) => (
                <div
                  key={installment.id}
                  className="relative  rounded-[8px] flex justify-start items-center md:items-center gap-4"
                >
                  <div className="h-[64px] !w-[64px] bg-black rounded-full flex  justify-center items-center">
                    <div className="text-white text-xl md:text-3xl font-normal font-['Gordita'] leading-10">
                      {installment.id}
                    </div>
                  </div>
                  <div className="flex w-[calc(100%-72px)] items-center px-[16px] py-4 rounded-[8px] bg-[#FFF8F4] justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="text-black text-lg md:text-xl font-normal font-['Gordita'] leading-loose">
                        Installment Payment {installment.id}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-gray-900 text-lg md:text-xl font-normal font-['Gordita'] leading-loose">
                        {installment.amount.toLocaleString()} EGY
                      </div>
                      {installment.lateFee > 0 && (
                        <div className="text-red-500 text-sm">
                          Late fee: {installment.lateFee.toLocaleString()} EGY
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

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
                    fill-rule="evenodd"
                    clip-rule="evenodd"
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
