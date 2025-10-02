"use client"
import { toast } from 'react-toastify';

import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { validatePhoneNumber } from "@/utils/phoneValidation";

interface FormData {
  email: string;
  phone: string;
  message: string;
}

const schema = yup
  .object({
    phone: yup
      .string()
      .required("Phone number is required")
      .test(
        "phone-validation",
        "Please enter a valid phone number",
        function (value) {
          if (!value) return false;
          const validation = validatePhoneNumber(value, true);
          return validation.isValid;
        }
      ),
    email: yup.string().required().email().label("Email"),
    message: yup.string().required().label("Message"),
  })
  .required();

const AgencyFormTwo = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const onSubmit = (data: FormData) => {
    const notify = () =>
      toast("Review submit successfully", { position: "top-center" });
    notify();
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="input-box-three mb-25">
        <div className="label">Your Email*</div>
        <input
          type="email"
          {...register("email")}
          placeholder="Enter mail address"
          className="type-input rounded-0"
        />
        <p className="form_error">{errors.email?.message}</p>
      </div>
      <div className="input-box-three mb-25">
        <div className="label">Your Phone*</div>
        <input
          type="tel"
          {...register("phone")}
          placeholder="01234567890"
          className="type-input rounded-0"
        />
        <p className="form_error">{errors.phone?.message}</p>
      </div>
      <div className="input-box-three mb-15">
        <div className="label">Message*</div>
        <textarea
          {...register("message")}
          placeholder="Hello, I am interested in [Califronia Apartments]"
          className="rounded-0"
        ></textarea>
        <p className="form_error">{errors.message?.message}</p>
      </div>
      <button type="submit" className="btn-nine text-uppercase w-100 mb-20">
        INQUIry
      </button>
    </form>
  );
};

export default AgencyFormTwo
