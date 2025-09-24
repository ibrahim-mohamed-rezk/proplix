"use client";
import { useRouter } from "@/i18n/routing";
import { postData } from "@/libs/server/backendServer";
import { PropertyTypes } from "@/libs/types/types";
import { useState, useMemo, useEffect } from "react";

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

// Helper function to format numbers with commas
function formatNumber(num: number | string) {
  if (typeof num === "string") num = parseFloat(num.replace(/,/g, ""));
  if (isNaN(num)) return "0";
  return num.toLocaleString();
}

// Helper to sanitize input (allow only numbers and commas)
function sanitizeInput(value: string) {
  return value.replace(/[^\d,]/g, "");
}

const MortgageCalculator = ({ property }: { property?: PropertyTypes }) => {
  // Initial values from property or sensible defaults
  const [homePrice, setHomePrice] = useState(
    property?.price ? property.price.toString() : ""
  );
  const [downPayment, setDownPayment] = useState(
    property?.down_price ? property.down_price.toString() : ""
  );
  const [loanTerm, setLoanTerm] = useState("5"); // months
  const router = useRouter();

  // Derived values
  const price = useMemo(() => {
    if (typeof homePrice === "string") {
      return parseFloat(homePrice.replace(/,/g, "")) || 0;
    }
    return typeof homePrice === "number" ? homePrice : 0;
  }, [homePrice]);

  const down = useMemo(() => {
    if (typeof downPayment === "string") {
      return parseFloat(downPayment.replace(/,/g, "")) || 0;
    }
    return typeof downPayment === "number" ? downPayment : 0;
  }, [downPayment]);

  const loanAmount = useMemo(() => {
    const amt = price - down;
    return amt > 0 ? amt : 0;
  }, [price, down]);

  // Calculate mortgage values - SIMPLIFIED: just divide amount by months
  const calculateMortgage = useMemo(() => {
    const termMonths = parseInt(loanTerm) || 0;

    if (loanAmount <= 0 || termMonths <= 0) {
      return {
        monthlyPayment: 0,
        totalLoanAmount: loanAmount,
        totalPayment: 0,
        totalInterest: 0,
      };
    }

    // Simple calculation: divide loan amount by number of months
    const monthlyPayment = loanAmount / termMonths;

    const safeMonthlyPayment = isFinite(monthlyPayment) ? monthlyPayment : 0;
    const totalPayment = safeMonthlyPayment * termMonths;

    return {
      monthlyPayment: safeMonthlyPayment,
      totalLoanAmount: loanAmount,
      totalPayment,
      totalInterest: 0, // No interest calculation
    };
  }, [loanAmount, loanTerm]);

  // Handle home price and down payment input with formatting
  const handleHomePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    setHomePrice(sanitized.replace(/^0+/, "") || "0");
  };

  const handleDownPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeInput(e.target.value);
    const numeric = parseFloat(sanitized.replace(/,/g, "")) || 0;
    const clamped = Math.min(Math.max(numeric, 0), price);
    setDownPayment(clamped.toString());
  };

  // Ensure down payment never exceeds price when price changes
  useEffect(() => {
    if (down > price) {
      setDownPayment(price.toString());
    }
  }, [price, down]);

  return (
    <div className="w-full bg-white rounded-[20px] inline-flex justify-start items-center gap-[10px]">
      {/* Inject custom styles for the range input */}
      <style>{rangeStyles}</style>
      <div className="flex justify-start items-center gap-[10px]">
        <div className="w-[320px] inline-flex flex-col justify-start items-start gap-[28px]">
          <div className="w-[320px] p-[16px] bg-[#FFF8F4] rounded-[12px] outline-[1px] outline-offset-[-1px] outline-red-300 flex flex-col justify-center items-start gap-[16px]">
            <div className="h-[64px] flex flex-col justify-start items-start gap-[8px]">
              <div className="self-stretch justify-end text-orange-600 text-[16px] font-medium font-['Gordita'] leading-normal tracking-tight">
                Per Month
              </div>
              <div className="self-stretch inline-flex justify-start items-end gap-[8px]">
                <div className="justify-end text-black text-[30px] font-medium font-['Gordita'] leading-loose tracking-tight">
                  {formatNumber(Math.round(calculateMortgage.monthlyPayment))}
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
                  {formatNumber(Math.round(calculateMortgage.totalLoanAmount))}
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
            onChange={handleHomePriceChange}
            className="w-[320px] h-[48px] bg-white rounded-[10px] border border-black px-[16px] text-black text-[16px] font-normal font-['Gordita'] focus:outline-none focus:border-orange-500"
            placeholder="1,000,000"
            inputMode="numeric"
            pattern="[0-9,]*"
          />

          {/* Down Payment Section */}
          <div className="w-[144px] justify-start text-black text-[16px] font-normal font-['Gordita'] leading-loose">
            Down Payment
          </div>
          <div className="relative w-[320px]">
            <input
              type="number"
              value={downPayment}
              max={price}
              onChange={handleDownPaymentChange}
              className="w-full h-[48px] bg-white rounded-[10px] border border-black px-[16px] text-black text-[16px] font-normal font-['Gordita'] focus:outline-none focus:border-orange-500"
              placeholder="100,000"
              inputMode="numeric"
              pattern="[0-9,]*"
            />
            <div className="w-[64px] h-[48px] absolute end-0 top-0 bg-[#FFF8F4] rounded-[10px] border border-black flex items-center justify-center">
              <div className="text-[#FF6625] text-[16px] font-medium font-['Gordita'] leading-tight">
                {price > 0 ? ((down / price) * 100).toFixed(1) : "0.0"} %
              </div>
            </div>
          </div>

          {/* Loan Period Range Slider - Updated to 72 months */}
          <div className="w-[128px] h-[24px] justify-start text-black text-[16px] font-normal font-['Gordita'] leading-loose">
            Loan period *
          </div>
          <div className="w-[320px] h-[8px] mt-[20px] relative bg-red-200/50 rounded flex items-center">
            <input
              type="range"
              min="1"
              max="72"
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
              style={{ width: `${(parseInt(loanTerm) / 72) * 100}%` }}
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
                left: `calc(${((parseInt(loanTerm) - 1) / 71) * 100}% - 10px)`,
                top: "-40px",
                zIndex: 20,
                transition: "left 0.2s",
                pointerEvents: "none",
                borderRadius: "100%",
              }}
            >
              <div className="bg-[#FF6625] text-white text-xs font-bold px-3 py-1 rounded shadow">
                {loanTerm} Month{loanTerm !== "1" ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            className={`w-[320px] px-[32px] py-[12px] bg-black rounded-[8px] inline-flex justify-center items-center gap-[10px] cursor-pointer hover:bg-gray-800 transition-colors`}
            disabled={price <= 0 || down <= 0 || down >= price}
            onClick={() => {
              router.push(
                `/installments?price=${price}&down=${down}&loanTerm=${loanTerm}`
              );
            }}
            type="button"
          >
            <div className="justify-end text-white text-[16px] font-medium font-['Gordita'] leading-normal tracking-tight">
              Installment now
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
