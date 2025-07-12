"use client";
import { PropertyTypes } from "@/libs/types/types";
import { useState } from "react";

const MortgageCalculator = ({ property }: { property?: PropertyTypes }) => {
  const [homePrice, setHomePrice] = useState(property?.price || "");
  const [downPayment, setDownPayment] = useState(property?.down_price || "");
  const [interestRate, setInterestRate] = useState("24");
  const [loanTerm, setLoanTerm] = useState("5");

  // Custom styles for the range input to make the thumb and track #FF6625
  const rangeStyles = `
    .mortgage-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #FF6625;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      cursor: pointer;
      margin-top: -8px;
    }
    .mortgage-range::-webkit-slider-runnable-track {
      height: 8px;
      border-radius: 8px;
      background: #FF6625;
    }
    .mortgage-range::-ms-fill-lower,
    .mortgage-range::-ms-fill-upper {
      background: #FF6625;
    }
    .mortgage-range::-moz-range-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #FF6625;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      cursor: pointer;
    }
    .mortgage-range::-moz-range-track {
      height: 8px;
      border-radius: 8px;
      background: #FF6625;
    }
    .mortgage-range::-ms-thumb {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #FF6625;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      cursor: pointer;
    }
    .mortgage-range {
      accent-color: #FF6625;
      background: transparent;
    }
    .mortgage-range:focus {
      outline: none;
    }
    input[type="range"].mortgage-range {
      accent-color: #FF6625;
      background: transparent;
    }
    /* Remove default styles for Firefox */
    input[type="range"].mortgage-range {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      background: transparent;
      height: 8px;
    }
    input[type="range"].mortgage-range::-ms-tooltip {
      display: none;
    }
  `;

  // Calculate mortgage values
  const calculateMortgage = () => {
    const price =
      typeof homePrice === "string"
        ? parseFloat(homePrice.replace(/,/g, ""))
        : typeof homePrice === "number"
        ? homePrice
        : 0;
    const down =
      typeof downPayment === "string"
        ? parseFloat(downPayment.replace(/,/g, ""))
        : typeof downPayment === "number"
        ? downPayment
        : 0;
    const rate = parseFloat(String(interestRate)) / 100 / 12 || 0;
    const term = parseFloat(String(loanTerm)) * 12 || 0;

    const loanAmount = price - down;
    if (loanAmount <= 0 || rate <= 0 || term <= 0) {
      return { monthlyPayment: 52212, totalLoanAmount: 23212322 };
    }

    const monthlyPayment =
      (loanAmount * (rate * Math.pow(1 + rate, term))) /
      (Math.pow(1 + rate, term) - 1);

    return {
      monthlyPayment: monthlyPayment,
      totalLoanAmount: loanAmount,
    };
  };

  const { monthlyPayment, totalLoanAmount } = calculateMortgage();

  return (
    <div className="w-full  bg-white rounded-[20px]  inline-flex justify-start items-center gap-[10px]">
      {/* Inject custom styles for the range input */}
      <style>{rangeStyles}</style>
      <div className="flex justify-start items-center gap-[10px]">
        <div className="w-[320px] inline-flex flex-col justify-start items-start gap-[28px]">
          <div className="w-[320px] p-[16px] bg-[#FFF8F4] rounded-[12px]  outline-[1px] outline-offset-[-1px] outline-red-300 flex flex-col justify-center items-start gap-[16px]">
            <div className="h-[64px] flex flex-col justify-start items-start gap-[8px]">
              <div className="self-stretch justify-end text-orange-600 text-[16px] font-medium font-['Gordita'] leading-normal tracking-tight">
                Per Month
              </div>
              <div className="self-stretch inline-flex justify-start items-end gap-[8px]">
                <div className="justify-end text-black text-[30px] font-medium font-['Gordita'] leading-loose tracking-tight">
                  {Math.round(monthlyPayment).toLocaleString()}
                </div>
                <div className="justify-end text-neutral-500 text-[20px] font-medium font-['Gordita'] leading-normal tracking-tight">
                  EGP
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-start items-start gap-[8px]">
              <div className="self-stretch justify-end text-orange-600 text-[16px] font-medium font-['Gordita'] leading-normal tracking-tight">
                Total Loan Amount
              </div>
              <div className="self-stretch inline-flex justify-start items-end gap-[8px]">
                <div className="justify-end text-black text-[30px] font-medium font-['Gordita'] leading-loose tracking-tight">
                  {Math.round(totalLoanAmount).toLocaleString()}
                </div>
                <div className="justify-end text-neutral-500 text-[20px] font-medium font-['Gordita'] leading-normal tracking-tight">
                  EGP
                </div>
              </div>
            </div>
          </div>

          {/* Home Price Input */}
          <div className="w-[96px] justify-start text-black text-[16px] font-normal font-['Gordita'] leading-loose">
            Home Price*
          </div>
          <input
            type="tel"
            value={homePrice}
            onChange={(e) => setHomePrice(e.target.value)}
            className="w-[320px] h-[48px] bg-white rounded-[10px] border border-black px-[16px] text-black text-[16px] font-normal font-['Gordita'] focus:outline-none focus:border-orange-500"
            placeholder="1,32,789"
          />

          {/* Interest Rate Section */}
          <div className="w-[144px] justify-start text-black text-[16px] font-normal font-['Gordita'] leading-loose">
            Down Payment
          </div>
          <div className="relative w-[320px]">
            <input
              type="tel"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full h-[48px] bg-white rounded-[10px] border border-black px-[16px] text-black text-[16px] font-normal font-['Gordita'] focus:outline-none focus:border-orange-500"
              placeholder="24"
            />
            <div className="w-[64px] h-[48px] absolute end-0 top-0 bg-[#FFF8F4] rounded-[10px] border border-black flex items-center justify-center">
              <div className="text-[#FF6625]text-[16px] font-medium font-['Gordita'] leading-tight">
                {interestRate} %
              </div>
            </div>
          </div>

          {/* Loan Period Range Slider */}
          <div className="w-[128px] h-[24px] justify-start text-black text-[16px] font-normal font-['Gordita'] leading-loose">
            Loan period *
          </div>
          <div className="w-[320px] h-[8px] mt-[20px] relative bg-red-200/50 rounded flex items-center">
            <input
              type="range"
              min="1"
              max="30"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="mortgage-range absolute inset-0 w-full h-full cursor-pointer z-10"
              style={{
                accentColor: "#FF6625",
                background: "transparent",
              }}
            />
            <div
              className="h-[8px] left-0 top-0 absolute bg-[#FF6625]rounded inline-flex justify-start items-center gap-[64px]"
              style={{ width: `${(parseInt(loanTerm) / 30) * 100}%` }}
            >
              <div className="w-0 self-stretch relative origin-top-left rotate-180" />
              <div className="w-[24px] h-[24px] relative origin-top-left rotate-180">
                <div className="w-[24px] h-[24px] absolute origin-top-left rotate-180 bg-[#FF6625]rounded-full border-2 border-white shadow-md" />
              </div>
            </div>
            {/* Show the value of the range (loanTerm) above the slider thumb */}
            <div
              style={{
                position: "absolute",
                left: `calc(${((parseInt(loanTerm) - 1) / 29) * 100}% - 10px)`,
                top: "-40px",
                zIndex: 20,
                transition: "left 0.2s",
                pointerEvents: "none",
                borderRadius: "100%",
              }}
            >
              <div className="bg-[#FF6625] text-white text-xs font-bold px-3 py-1 rounded shadow">
                {loanTerm}
              </div>
            </div>
          </div>

          {/* Down Payment Input */}
          <div className="w-[144px] justify-start text-black text-[16px] font-normal font-['Gordita'] leading-loose">
            Default Value
          </div>
          <input
            type="tel"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className="w-[320px] h-[48px] bg-white rounded-[10px] border border-black px-[16px] text-black text-[16px] font-normal font-['Gordita'] focus:outline-none focus:border-orange-500"
            placeholder="24,478,000"
          />

          {/* Calculate Button */}
          <div className="w-[320px] px-[32px] py-[12px] bg-black rounded-[8px] inline-flex justify-center items-center gap-[10px] cursor-pointer hover:bg-gray-800 transition-colors">
            <div className="justify-end text-white text-[16px] font-medium font-['Gordita'] leading-normal tracking-tight">
              Installment now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
