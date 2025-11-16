"use client";
import React, { useState, useEffect, useRef } from "react";
import AreaLocationInput, {
  AreaSelectionResult,
} from "@/components/common/AreaLocationInput";
import { useForm, useWatch, useController } from "react-hook-form";
import { postData, getData } from "@/libs/server/backendServer";
import { AxiosHeaders } from "axios";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  Home,
  FileText,
  Globe,
  Camera,
  Check,
  X,
  CreditCard,
  Coins,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";

type FormInputs = {
  // General Information
  type_id: string;
  // area_id: string; // REMOVED
  // userId: string;
  price: string;
  down_price: string;
  sqt: string;
  bedroom: string;
  bathroom: string;
  status: string;
  type: string;
  immediate_delivery: string;
  payment_method: string;
  paid_months?: string;
  furnishing: string;
  mortgage?: string;
  // English fields
  title_en: string;
  description_en: string;
  keywords_en: string;
  slug_en: string;
  // Arabic fields
  title_ar: string;
  description_ar: string;
  keywords_ar: string;
  // New fields
  landing_space: string; // New field in Room Configuration
  starting_day: string; // New field in Property Details
};

type SelectOption = {
  id: string;
  title?: string;
  name?: string;
};

// AreaOption type is no longer needed and can be removed
// type AreaOption = {
//   id: number;
//   image: string;
//   count_of_properties: number;
//   name: string;
//   description: {
//     en: {
//       name: string;
//     };
//     ar: {
//       name: string;
//     };
//   };
// };

type LocationData = AreaSelectionResult;

type AgentOption = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
};

type ImagePreview = {
  file: File;
  url: string;
  id: string;
};

const CreatePropertyPage = ({ token }: { token: string }) => {
  const t = useTranslations("properties");
  const router = useRouter();
  const locale = useLocale();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    watch,
  } = useForm<FormInputs>();
  const [descriptionEn, setDescriptionEn] = useState<string>("");
  const [descriptionAr, setDescriptionAr] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    rooms: true,
    details: true,
    arabic: true,
    english: true,
    images: true,
  });

  const paymentMethod = useWatch({ control, name: "payment_method" }) || "cash";
  const status = useWatch({ control, name: "status" });
  const immediateDelivery = useWatch({ control, name: "immediate_delivery" });

  // State for dropdown options
  const [propertyTypes, setPropertyTypes] = useState<SelectOption[]>([]);
  // const [areas, setAreas] = useState<AreaOption[]>([]); // REMOVED
  // const [agents, setAgents] = useState<AgentOption[]>([]);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    required = false,
    options = [],
    dir = "ltr",
    placeholder = "",
    onChange,
    value,
  }: {
    label: string;
    name: keyof FormInputs;
    type?: string;
    required?: boolean;
    options?: { value: string; label: string }[];
    dir?: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
  }) => (
    <div className="mb-4">
      <label className="form-label fw-medium text-dark mb-2">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>
      {type === "select" ? (
        <select
          {...register(name, { required })}
          className="form-select premium-input"
          dir={dir}
          style={{
            border: "2px solid #e9ecef",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            background: "#ffffff",
          }}
        >
          <option value="">{placeholder || `${t("select")} ${label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...register(name, { required })}
          type={type}
          className="form-control premium-input"
          dir={dir}
          placeholder={placeholder}
          style={{
            border: "2px solid #e9ecef",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            background: "#ffffff",
          }}
          onChange={onChange}
          value={value}
        />
      )}
      {errors[name] && (
        <div className="error-message text-danger small mt-2 d-flex align-items-center">
          <div
            className="error-dot me-2"
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "#dc3545",
            }}
          ></div>
          {t("field_required")}
        </div>
      )}
    </div>
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview.url);
    }
    const file = files[0];
    const url = URL.createObjectURL(file);
    const id = `${Date.now()}-${Math.random()}`;
    setImagePreview({ file, url, id });
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview.url);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview.url);
      }
    };
  }, []);

  useEffect(() => {
    const fetchDropdownData = async () => {
      // const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) {
        showToast(t("auth_token_not_found"), "error");
        return;
      }
      try {
        const [typesResponse] = await Promise.all([
          getData(
            "types",
            {},
            new AxiosHeaders({ Authorization: `Bearer ${token}`, lang: locale })
          ),
          // getData(
          //   "areas",
          //   {},
          //   new AxiosHeaders({ Authorization: `Bearer ${token}`, lang: locale })
          // ), // REMOVED
          // getData("owner/agents", {}, new AxiosHeaders({ Authorization: `Bearer ${token}` }))
        ]);
        if (typesResponse.status) setPropertyTypes(typesResponse.data.data);
        // if (areasResponse.status) setAreas(areasResponse.data.data); // REMOVED
        // setAgents(agentsResponse);
      } catch (error) {
        console.error("Error fetching dropdown ", error);
        showToast(t("error_fetching_dropdown_data"), "error");
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    setValue("payment_method", "cash");
  }, [setValue]);

  // Auto-set payment method to cash when status is rent
  useEffect(() => {
    if (status === "rent") {
      setValue("payment_method", "cash");
    }
  }, [status, setValue]);

  const onSubmit = async (data: FormInputs) => {
    const formData = new FormData();
    // General fields
    formData.append("type_id", data.type_id);
    // formData.append("area_id", data.area_id); // REMOVED
    formData.append("price", data.price);
    formData.append("sqt", data.sqt);
    formData.append("bedroom", data.bedroom);
    formData.append("bathroom", data.bathroom);
    formData.append("status", data.status);
    formData.append("type", data.type);
    formData.append("immediate_delivery", data.immediate_delivery);
    formData.append("furnishing", data.furnishing);
    formData.append("payment_method", data.payment_method);

    // Conditional fields (installment)
    if (data.payment_method === "installment") {
      if (data.down_price) formData.append("down_price", data.down_price);
      if (data.paid_months) formData.append("paid_months", data.paid_months);
    }

    // Mortgage (optional)
    if (data.mortgage) {
      formData.append("mortgage", data.mortgage);
    }

    // New field - landing space
    if (data.landing_space) {
      formData.append("landing_space", data.landing_space);
    }

    // New field - starting day
    if (data.starting_day) {
      formData.append("starting_day", data.starting_day);
    }

    // Location
    if (locationData) {
      formData.append("location", locationData.description);
      if (locationData.areaId !== undefined && locationData.areaId !== null) {
        formData.append("area_id", String(locationData.areaId));
        formData.append("location_place_id", String(locationData.areaId));
      } else {
        formData.append("location_place_id", locationData.description);
      }
      if (locationData.coordinates) {
        formData.append(
          "location_lat",
          locationData.coordinates.lat.toString()
        );
        formData.append(
          "location_lng",
          locationData.coordinates.lng.toString()
        );
      }
    }

    // English
    formData.append("title[en]", data.title_en);
    formData.append("description[en]", descriptionEn);
    formData.append("keywords[en]", data.keywords_en);
    formData.append("slug[en]", data.slug_en);

    // Arabic
    formData.append("title[ar]", data.title_ar);
    formData.append("description[ar]", descriptionAr);
    formData.append("keywords[ar]", data.keywords_ar);

    // Cover image
    if (imagePreview && imagePreview.file) {
      formData.append("cover", imagePreview.file);
    }

    try {
      const response = await postData(
        "agent/property_listings",
        formData,
        new AxiosHeaders({ Authorization: `Bearer ${token}` })
      );
      showToast(t("property_added_successfully"), "success");
      // /ar/dashboard
      router.push(`/dashboard/edit-property/${response?.data?.id}`);
    } catch (error) {
      console.error("Failed to create property:", error);
      showToast(t("failed_to_add_property"), "error");
    }
  };

  const SectionHeader = ({
    title,
    icon,
    sectionKey,
    description,
  }: {
    title: string;
    icon: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
    description?: string;
  }) => (
    <div
      className="section-header d-flex justify-content-between align-items-center p-4   cursor-pointer border-0"
      onClick={() => toggleSection(sectionKey)}
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        transition: "all 0.3s ease",
        borderRadius: "0.75rem 0.75rem 0 0",
      }}
    >
      <div className="d-flex align-items-center gap-4">
        <div
          className="icon-container d-flex align-items-center justify-content-center me-3"
          style={{
            width: "48px",
            height: "48px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "transform 0.3s ease",
          }}
        >
          {icon}
        </div>
        <div>
          <h3 className="h5 mb-1 fw-semibold text-dark">{title}</h3>
          {description && (
            <p className="small text-muted mb-0 opacity-75">{description}</p>
          )}
        </div>
      </div>
      <div className="d-flex align-items-center">
        <div
          className="status-indicator me-3"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: expandedSections[sectionKey]
              ? "#198754"
              : "#6c757d",
            transition: "all 0.3s ease",
            boxShadow: expandedSections[sectionKey]
              ? "0 0 8px rgba(25,135,84,0.3)"
              : "none",
          }}
        ></div>
        <div
          className="chevron-icon"
          style={{
            transition: "transform 0.3s ease",
            transform: expandedSections[sectionKey]
              ? "rotate(180deg)"
              : "rotate(0deg)",
          }}
        >
          <ChevronDown className="w-5 h-5 text-muted" />
        </div>
      </div>
    </div>
  );

  // Formatted Number Input Component
  const FormattedNumberInput = ({
    label,
    name,
    required = false,
    placeholder = "",
  }: {
    label: string;
    name: keyof FormInputs;
    required?: boolean;
    placeholder?: string;
  }) => {
    const { field } = useController({ name, control });
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target;
      const cursorPosition = input.selectionStart || 0;
      const value = e.target.value;

      // Remove all non-digit characters
      const digits = value.replace(/\D/g, "");
      // Store the raw number value
      const numValue = digits ? Number(digits) : "";
      field.onChange(numValue);

      // Calculate new cursor position after formatting
      setTimeout(() => {
        if (inputRef.current && digits) {
          const formattedValue = Number(digits)
            .toLocaleString("en-US")
            .replace(/,/g, " ");
          const digitsBefore = value
            .slice(0, cursorPosition)
            .replace(/\D/g, "").length;
          let newPosition = 0;
          let digitCount = 0;
          for (let i = 0; i < formattedValue.length; i++) {
            if (formattedValue[i] !== " ") {
              digitCount++;
            }
            if (digitCount === digitsBefore) {
              newPosition = i + 1;
              break;
            }
          }
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    };

    const displayValue = field.value
      ? Number(field.value).toLocaleString("en-US").replace(/,/g, " ")
      : "";

    return (
      <div className="mb-4">
        <label className="form-label fw-medium text-dark mb-2">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="form-control premium-input"
          style={{
            border: "2px solid #e9ecef",
            borderRadius: "0.75rem",
            padding: "0.75rem 1rem",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            background: "#ffffff",
            direction: "ltr",
            textAlign: locale === "ar" ? "right" : "left",
            unicodeBidi: "plaintext",
          }}
          inputMode="numeric"
          pattern="[0-9 ]*"
        />
        {errors[name] && (
          <div className="error-message text-danger small mt-2 d-flex align-items-center">
            <div
              className="error-dot me-2"
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#dc3545",
              }}
            ></div>
            {t("field_required")}
          </div>
        )}
      </div>
    );
  };

  // Date Input Component
  const DateInput = ({
    label,
    name,
    required = false,
  }: {
    label: string;
    name: keyof FormInputs;
    required?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    // Get the field value from react-hook-form
    const fieldValue = watch(name);

    // Initialize selected date from form value
    useEffect(() => {
      if (fieldValue) {
        setSelectedDate(new Date(fieldValue));
      }
    }, [fieldValue]);

    // Close calendar when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          calendarRef.current &&
          !calendarRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDate = (date: Date): string => {
      return date.toISOString().split("T")[0]; // YYYY-MM-DD format
    };

    const formatDisplayDate = (date: Date): string => {
      return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const handleDateSelect = (date: Date) => {
      setSelectedDate(date);
      setValue(name, formatDate(date));
      setIsOpen(false);
    };

    const getDaysInMonth = (date: Date): Date[] => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const days: Date[] = [];

      // Add previous month's trailing days
      const firstDayOfWeek = firstDay.getDay();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push(new Date(year, month, -i));
      }

      // Add current month's days
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }

      // Add next month's leading days
      const totalDays = Math.ceil(days.length / 7) * 7;
      const remainingDays = totalDays - days.length;
      for (let day = 1; day <= remainingDays; day++) {
        days.push(new Date(year, month + 1, day));
      }

      return days;
    };

    const navigateMonth = (direction: "prev" | "next") => {
      setCurrentMonth((prev) => {
        const newMonth = new Date(prev);
        if (direction === "prev") {
          newMonth.setMonth(prev.getMonth() - 1);
        } else {
          newMonth.setMonth(prev.getMonth() + 1);
        }
        return newMonth;
      });
    };

    const isToday = (date: Date): boolean => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const isSelected = (date: Date): boolean => {
      return selectedDate
        ? date.toDateString() === selectedDate.toDateString()
        : false;
    };

    const isCurrentMonth = (date: Date): boolean => {
      return date.getMonth() === currentMonth.getMonth();
    };

    const monthNames =
      locale === "ar"
        ? [
            "يناير",
            "فبراير",
            "مارس",
            "أبريل",
            "مايو",
            "يونيو",
            "يوليو",
            "أغسطس",
            "سبتمبر",
            "أكتوبر",
            "نوفمبر",
            "ديسمبر",
          ]
        : [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

    const dayNames =
      locale === "ar"
        ? ["أح", "إث", "ثلا", "أر", "خم", "جم", "سب"]
        : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="mb-4" ref={calendarRef}>
        <label className="form-label fw-medium text-dark mb-2">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        {/* Date Input Field */}
        <div className="relative ">
          <input
            {...register(name, { required })}
            type="text"
            readOnly
            value={selectedDate ? formatDisplayDate(selectedDate) : ""}
            onClick={() => setIsOpen(!isOpen)}
            placeholder={t("select_date")}
            className="form-control premium-input"
            style={{
              border: "2px solid #e9ecef",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              fontSize: "0.95rem",
              transition: "all 0.3s ease",
              background: "#ffffff",
              paddingRight: "2.5rem",
            }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="position-absolute"
            style={{
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <Calendar className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div
            className=" relative mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-4 min-w-[300px] z-50"
            style={{
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              borderRadius: "0.75rem",
              border: "1px solid #e9ecef",
            }}
          >
            {/* Calendar Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                type="button"
                onClick={() => navigateMonth("prev")}
                className="btn p-2"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6c757d",
                  transition: "all 0.3s ease",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="h6 mb-0 fw-semibold text-dark">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={() => navigateMonth("next")}
                className="btn p-2"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6c757d",
                  transition: "all 0.3s ease",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day Names Header */}
            <div
              className="d-grid"
              style={{
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "0.25rem",
                marginBottom: "0.5rem",
              }}
            >
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs fw-medium text-muted py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div
              className="d-grid"
              style={{ gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}
            >
              {getDaysInMonth(currentMonth).map((date, index) => {
                const isCurrentMonthDay = isCurrentMonth(date);
                const isSelectedDay = isSelected(date);
                const isTodayDay = isToday(date);

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    className={`btn text-sm rounded-lg transition-all duration-200 ${
                      isSelectedDay
                        ? "bg-[#F26A3F] text-white"
                        : isCurrentMonthDay
                        ? "text-dark hover:bg-light"
                        : "text-muted"
                    } ${
                      isTodayDay && !isSelectedDay
                        ? "border border-[#F26A3F]"
                        : ""
                    }`}
                    disabled={!isCurrentMonthDay}
                    style={{
                      width: "2rem",
                      height: "2rem",
                      padding: "0",
                      fontSize: "0.875rem",
                      ...(isSelectedDay && {
                        boxShadow: "0 0 0 3px rgba(242, 106, 63, 0.25)",
                        transform: "scale(1.05)",
                      }),
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div
              className="d-flex justify-content-between mt-4 pt-4 border-top"
              style={{ borderColor: "#e9ecef" }}
            >
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  handleDateSelect(today);
                  setCurrentMonth(today);
                }}
                className="btn btn-link p-0"
                style={{
                  color: "#F26A3F",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                {t("today")}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-link p-0"
                style={{
                  color: "#6c757d",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                }}
              >
                {t("close")}
              </button>
            </div>
          </div>
        )}

        {errors[name] && (
          <div className="error-message text-danger small mt-2 d-flex align-items-center">
            <div
              className="error-dot me-2"
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#dc3545",
              }}
            ></div>
            {t("field_required")}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        .premium-input:focus {
          border-color: #0d6efd !important;
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1) !important;
          outline: none !important;
        }
        .section-header:hover {
          background: linear-gradient(
            135deg,
            #f1f3f4 0%,
            #e2e6ea 100%
          ) !important;
        }
        .section-header:hover .icon-container {
          transform: translateY(-2px) !important;
        }
        .section-content {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .form-section {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
        }
        .form-section:hover {
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        .upload-area {
          border: 2px dashed #dee2e6;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #fafbfc 0%, #f8f9fa 100%);
        }
        .upload-area:hover {
          border-color: #0d6efd;
          background: linear-gradient(135deg, #f0f7ff 0%, #e7f3ff 100%);
        }
        .btn-premium {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border: none;
          border-radius: 0.75rem;
          padding: 0.75rem 2rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(13, 110, 253, 0.2);
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
        }
        .btn-outline-premium {
          border: 2px solid #6c757d;
          border-radius: 0.75rem;
          padding: 0.75rem 2rem;
          font-weight: 600;
          transition: all 0.3s ease;
          background: transparent;
        }
        .btn-outline-premium:hover {
          background: #6c757d;
          color: white;
          transform: translateY(-2px);
        }
        .hero-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 1.5rem;
          padding: 3rem 2rem;
          margin-bottom: 3rem;
          position: relative;
          overflow: hidden;
        }
        .hero-section::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23000" opacity="0.02"/><circle cx="75" cy="75" r="1" fill="%23000" opacity="0.02"/><circle cx="50" cy="10" r="1" fill="%23000" opacity="0.02"/><circle cx="10" cy="90" r="1" fill="%23000" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          pointer-events: none;
        }
        .hero-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 30px rgba(13, 110, 253, 0.3);
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div className="min-vh-100">
        <div className="container py-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="form-section bg-white rounded-4 mb-4 ">
              <SectionHeader
                title={t("basic_information")}
                icon={<Home className="w-5 h-5 text-primary" />}
                sectionKey="basic"
                description={t("property_type_location_details")}
              />
              {expandedSections.basic && (
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                      <InputField
                        label={t("property_type")}
                        name="type_id"
                        type="select"
                        required
                        options={propertyTypes.map((type) => ({
                          value: type.id,
                          label: type.title || "",
                        }))}
                        placeholder={t("select_type")}
                      />
                    </div>
                    {/* The area_id field has been completely removed from this row */}
                    <div className="col-md-6 col-lg-4 ">
                      <label className="form-label fw-medium text-dark mb-2">
                        {t("location")}
                      </label>
                      <AreaLocationInput
                        onSelect={(selection) => setLocationData(selection)}
                        defaultValue={locationData?.description || ""}
                        placeholder={t("search_for_a_location")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
              <SectionHeader
                title={t("property_details")}
                icon={<FileText className="w-5 h-5 text-info" />}
                sectionKey="details"
                description={t("status_type_delivery_info")}
              />
              {expandedSections.details && (
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <div className="row g-4">
                    <div className="col-md-6 col-lg-4">
                      <InputField
                        label={t("status")}
                        name="status"
                        type="select"
                        required
                        options={[
                          { value: "rent", label: t("rent") },
                          { value: "sale", label: t("sale") },
                        ]}
                        placeholder={t("select_status")}
                      />
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <InputField
                        label={t("immediate_delivery")}
                        name="immediate_delivery"
                        type="select"
                        required
                        options={[
                          { value: "yes", label: t("yes") },
                          { value: "no", label: t("no") },
                        ]}
                        placeholder={t("select_option")}
                      />
                    </div>
                    {/* Only show starting date when immediate delivery is no */}
                    {immediateDelivery === "no" && (
                      <div className="col-md-6 col-lg-4">
                        <DateInput
                          label={t("starting_day")}
                          name="starting_day"
                          required
                        />
                      </div>
                    )}
                    <div className="col-md-6 col-lg-4">
                      <InputField
                        // values is ==>'all-furnished','unfurnished','partly-furnished'
                        label={t("furnishing")}
                        name="furnishing"
                        type="select"
                        required
                        options={[
                          { value: "all-furnished", label: t("furnished") },
                          { value: "unfurnished", label: t("unfurnished") },
                          {
                            value: "semi-furnished",
                            label: t("semi_furnished"),
                          },
                          {
                            value: "partly-furnished",
                            label: t("partly_furnished"),
                          },
                        ]}
                        placeholder={t("select_furnishing")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Information */}
            <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
              <SectionHeader
                title={t("pricing_financial_details")}
                icon={<DollarSign className="w-5 h-5 text-success" />}
                sectionKey="pricing"
                description={t("property_pricing_payment_info")}
              />
              {expandedSections.pricing && (
                <div className="p-4 row g-4">
                  <div className="col-12 col-md-6">
                    <FormattedNumberInput
                      label={t("price")}
                      name="price"
                      required
                      placeholder={t("enter_property_price")}
                    />
                  </div>
                  {/* Payment Method Toggle */}
                  <div className="col-12 col-md-6">
                    <div className="mb-3">
                      <label className="form-label fw-medium text-dark">
                        {t("payment_method")}
                        <span className="text-danger ms-1">*</span>
                      </label>
                      <div className="btn-group w-100 shadow-sm" role="group">
                        <button
                          type="button"
                          onClick={() => setValue("payment_method", "cash")}
                          className={`btn d-flex align-items-center justify-content-center gap-2 ${
                            paymentMethod === "cash"
                              ? "btn-primary text-white"
                              : "btn-outline-secondary"
                          }`}
                          style={
                            paymentMethod === "cash"
                              ? {
                                  backgroundColor: "#F26A3F",
                                  borderColor: "#F26A3F",
                                }
                              : {}
                          }
                        >
                          <Coins
                            className="w-4 h-4"
                            style={{ width: "1rem", height: "1rem" }}
                          />
                          {t("cash")}
                        </button>
                        {/* Only show installment option for sale status */}
                        {status === "sale" && (
                          <button
                            type="button"
                            onClick={() =>
                              setValue("payment_method", "installment")
                            }
                            className={`btn d-flex align-items-center justify-content-center gap-2 ${
                              paymentMethod === "installment"
                                ? "btn-primary text-white"
                                : "btn-outline-secondary"
                            }`}
                            style={
                              paymentMethod === "installment"
                                ? {
                                    backgroundColor: "#F26A3F",
                                    borderColor: "#F26A3F",
                                  }
                                : {}
                            }
                          >
                            <CreditCard
                              className="w-4 h-4"
                              style={{ width: "1rem", height: "1rem" }}
                            />
                            {t("installment")}
                          </button>
                        )}
                      </div>
                      {errors.payment_method && (
                        <div className="text-danger small d-flex align-items-center mt-1">
                          <span
                            className="bg-danger rounded-circle me-2"
                            style={{ width: "4px", height: "4px" }}
                          ></span>
                          {t("field_required")}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Down Payment & Paid Months (only if installment) */}
                  {paymentMethod === "installment" && (
                    <>
                      <div className="col-12 col-md-6">
                        <FormattedNumberInput
                          label={t("down_price")}
                          name="down_price"
                          required
                          placeholder={t("enter_down_payment_amount")}
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <InputField
                          label={t("number_of_months")}
                          name="paid_months"
                          type="number"
                          required
                          placeholder={t("enter_number_of_installment_months")}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Room Configuration */}
            <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
              <SectionHeader
                title={t("room_configuration")}
                icon={<Home className="w-5 h-5 text-warning" />}
                sectionKey="rooms"
                description={t("bedrooms_bathrooms_kitchen_details")}
              />
              {expandedSections.rooms && (
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <div className="row g-4">
                    <div className="col-md-6 col-lg-3">
                      <InputField
                        label={t("square_meters")}
                        name="sqt"
                        type="number"
                        required
                        placeholder={t("property_size")}
                      />
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <InputField
                        label={t("bedroom")}
                        name="bedroom"
                        type="number"
                        required
                        placeholder={t("number_of_bedrooms")}
                      />
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <InputField
                        label={t("bathroom")}
                        name="bathroom"
                        type="number"
                        required
                        placeholder={t("number_of_bathrooms")}
                      />
                    </div>
                    <div className="col-md-6 col-lg-3">
                      <InputField
                        label={t("landing_space")}
                        name="landing_space"
                        type="number"
                        required
                        placeholder={t("enter_landing_space")}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Arabic Content */}
            <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
              <SectionHeader
                title={t("arabic_content")}
                icon={<Globe className="w-5 h-5 text-success" />}
                sectionKey="arabic"
                description={t("arabic_title_description_seo")}
              />
              {expandedSections.arabic && (
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <InputField
                    label={t("title_ar")}
                    name="title_ar"
                    required
                    dir="rtl"
                    placeholder={t("title_arabic_placeholder")}
                  />
                  <InputField
                    label={t("keywords_ar")}
                    name="keywords_ar"
                    required
                    dir="rtl"
                    placeholder={t("keywords_arabic_placeholder")}
                  />
                  <div>
                    <label className="form-label fw-medium text-dark mb-2">
                      {t("description_ar")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                      className="form-control premium-input"
                      dir="rtl"
                      rows={6}
                      placeholder={t("description_ar")}
                      style={{
                        border: "2px solid #e9ecef",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                        background: "#ffffff",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* English Content */}
            <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
              <SectionHeader
                title={t("english_content")}
                icon={<Globe className="w-5 h-5 text-primary" />}
                sectionKey="english"
                description={t("english_title_description_seo")}
              />
              {expandedSections.english && (
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <div className="row g-4">
                    <div className="col-md-6">
                      <InputField
                        label={t("title_en")}
                        name="title_en"
                        required
                        placeholder={t("title_english_placeholder")}
                      />
                    </div>
                    <div className="col-md-6">
                      <InputField
                        label={t("slug_en")}
                        name="slug_en"
                        required
                        placeholder={t("slug_english_placeholder")}
                      />
                    </div>
                  </div>
                  <InputField
                    label={t("keywords_en")}
                    name="keywords_en"
                    required
                    placeholder={t("keywords_english_placeholder")}
                  />
                  <div>
                    <label className="form-label fw-medium text-dark mb-2">
                      {t("description_en")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                    <textarea
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      className="form-control premium-input"
                      rows={6}
                      placeholder={t("description_en")}
                      style={{
                        border: "2px solid #e9ecef",
                        borderRadius: "0.75rem",
                        padding: "0.75rem 1rem",
                        fontSize: "0.95rem",
                        transition: "all 0.3s ease",
                        background: "#ffffff",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Single Image Upload */}
            <div className="form-section bg-white rounded-4 mb-4 overflow-hidden">
              <SectionHeader
                title={t("property_image")}
                icon={<Camera className="w-5 h-5 text-danger" />}
                sectionKey="images"
                description={t("upload_high_quality_photo")}
              />
              {expandedSections.images && (
                <div
                  className="section-content p-4"
                  style={{ borderTop: "1px solid #f8f9fa" }}
                >
                  <div className="upload-area rounded-3 p-5">
                    {!imagePreview ? (
                      <div className="text-center">
                        <label
                          className="btn btn-outline-primary rounded-3 px-4 py-2"
                          style={{
                            border: "2px solid #0d6efd",
                            fontWeight: "600",
                            transition: "all 0.3s ease",
                          }}
                        >
                          {t("click_to_upload_image")}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageSelect(e.target.files)}
                            className="d-none"
                          />
                        </label>
                        <p className="small text-muted mt-3 mb-0">
                          {t("select_high_quality_image")}
                        </p>
                      </div>
                    ) : (
                      <div className="position-relative">
                        <div
                          className="image-container rounded-3 overflow-hidden"
                          style={{
                            maxHeight: "400px",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                          }}
                        >
                          <Image
                            width={800}
                            height={400}
                            src={imagePreview.url}
                            alt={t("property_preview")}
                            className="w-100 h-100 object-cover"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="position-absolute top-0 end-0 p-3">
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="btn btn-danger rounded-circle p-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              boxShadow: "0 4px 15px rgba(220,53,69,0.3)",
                              transition: "all 0.3s ease",
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-center small text-muted mt-3 mb-0">
                    {imagePreview
                      ? t("hover_over_image_to_change_or_remove")
                      : t("supported_formats_jpg_png_webp")}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-center gap-4 pt-5">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-outline-premium"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="btn btn-premium text-white d-flex align-items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {t("create_property")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreatePropertyPage;