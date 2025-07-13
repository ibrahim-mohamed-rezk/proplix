"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

const ScheduleForm = ({ property }: { property?: any }) => {
  const t = useTranslations("endUser");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: t("message") + " " + property?.title,
  });
  console.log("property", property);

  return (
    <form onSubmit={(e) => e.preventDefault()}> 
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
        />
      </div>
      <div className="input-box-three mb-25">
        <div className="label">Your Phone*</div>
        <input
          type="tel"
          placeholder="Your phone number"
          className="type-input"
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          value={formData.phone}
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
      <button className="btn-nine text-uppercase rounded-3 w-100 mb-10">
        INQUIry
      </button>
    </form>
  );
};

export default ScheduleForm;
