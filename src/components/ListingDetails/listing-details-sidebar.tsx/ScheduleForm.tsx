"use client";

import { postData } from "@/libs/server/backendServer";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-toastify";

const ScheduleForm = ({ property }: { property?: any }) => {
  const t = useTranslations("endUser");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: t("message") + " " + property?.title,
    property_id: property?.id,
  });

  const handleSubmit = async () => {
    try {
      await postData("contact-form", formData, {
        "Content-Type": "application/json",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: t("message") + " " + property?.title,
        property_id: property?.id,
      });
      toast.success("Message sent successfully");
    } catch (error: any) {
      toast.error(error.response.data.msg || "An error occurred");
    }
  };

  return (
    <div>
      <div className="input-box-three mb-25">
        <div className="label">Your Name*</div>
        <input
          type="text"
          placeholder="Your full name"
          className="type-input"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          value={formData.name}
        />
      </div>
      <div className="input-box-three mb-25">
        <div className="label">Your Email*</div>
        <input
          type="email"
          placeholder="Enter mail address"
          className="type-input"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          value={formData.email}
          required
        />
      </div>
      <div className="input-box-three mb-25">
        <div className="label">Your Phone*</div>
        <input
          type="number"
          placeholder="Your phone number"
          className="type-input"
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          value={formData.phone}
          required
        />
      </div>
      <div className="input-box-three mb-15">
        <div className="label">Message*</div>
        <textarea
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          value={formData.message}
        >{`${formData.message}`}</textarea>
      </div>
      <button
        onClick={handleSubmit}
        className="btn-nine text-uppercase rounded-3 w-100 mb-10"
      >
        INQUIry
      </button>
    </div>
  );
};

export default ScheduleForm;
