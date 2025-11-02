"use client";
import { useRouter } from "@/i18n/routing";
import { postData } from "@/libs/server/backendServer";
import { PropertyTypes } from "@/libs/types/types";
import { useState, useMemo, useEffect } from "react";

// Custom styles for the range input - style the moving thumb (browser default)
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
      background: transparent;
    }
    .mortgage-range::-ms-fill-lower,
    .mortgage-range::-ms-fill-upper {
      background: transparent;
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
      background: transparent;
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
    <div className="mortgage-calculator-container">
      {/* Inject custom styles for the range input */}
      <style>{rangeStyles}</style>
      <div className="mortgage-calculator-inner">
        <div className="mortgage-calculator-wrapper">
          <div className="mortgage-calculator-card">
            <div className="mortgage-calculator-payment-section">
              <div className="mortgage-calculator-label mortgage-label-orange">
                Per Month
              </div>
              <div className="mortgage-calculator-value-group">
                <div className="mortgage-calculator-value-main">
                  {formatNumber(Math.round(calculateMortgage.monthlyPayment))}
                </div>
                <div className="mortgage-calculator-value-currency">EGP</div>
              </div>
            </div>
            <div className="mortgage-calculator-payment-section">
              <div className="mortgage-calculator-label mortgage-label-orange">
                Total Loan Amount
              </div>
              <div className="mortgage-calculator-value-group">
                <div className="mortgage-calculator-value-main">
                  {formatNumber(Math.round(calculateMortgage.totalLoanAmount))}
                </div>
                <div className="mortgage-calculator-value-currency">EGP</div>
              </div>
            </div>
          </div>

          {/* Home Price Input */}
          <div className="mortgage-calculator-field-label">Home Price*</div>
          <input
            type="tel"
            value={homePrice}
            onChange={handleHomePriceChange}
            className="mortgage-calculator-input"
            placeholder="1,000,000"
            inputMode="numeric"
            pattern="[0-9,]*"
          />

          {/* Down Payment Section */}
          <div className="mortgage-calculator-field-label">Down Payment</div>
          <div className="mortgage-calculator-down-payment-wrapper">
            <input
              type="number"
              value={downPayment}
              max={price}
              onChange={handleDownPaymentChange}
              className="mortgage-calculator-input mortgage-input-with-percent"
              placeholder="100,000"
              inputMode="numeric"
              pattern="[0-9,]*"
            />
            <div className="mortgage-calculator-percent-box">
              <div className="mortgage-calculator-percent-text">
                {price > 0 ? ((down / price) * 100).toFixed(1) : "0.0"} %
              </div>
            </div>
          </div>

          {/* Loan Period Range Slider - Updated to 72 months */}
          <div className="mortgage-calculator-field-label mortgage-slider-label">
            Loan period *
          </div>
          <div className="mortgage-calculator-slider-wrapper">
            <input
              type="range"
              min="1"
              max="72"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="mortgage-range absolute inset-0 w-full h-full cursor-pointer z-10"
            />
            <div
              className="mortgage-slider-track"
              style={{ width: `${(parseInt(loanTerm) / 72) * 100}%` }}
            />
            {/* Show the value of the range (loanTerm) above the slider thumb */}
            <div
              className="mortgage-slider-tooltip"
              style={{
                left: `${((parseInt(loanTerm) - 1) / 71) * 100}%`,
              }}
            >
              <div className="mortgage-slider-tooltip-content">
                {loanTerm} Month{loanTerm !== "1" ? "s" : ""}
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            className="mortgage-calculator-button"
            disabled={price <= 0 || down <= 0 || down >= price}
            onClick={() => {
              router.push(
                `/installments?price=${price}&down=${down}&loanTerm=${loanTerm}`
              );
            }}
            type="button"
          >
            <div className="mortgage-calculator-button-text">
              Installment now
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
