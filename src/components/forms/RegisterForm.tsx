"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";

import OpenEye from "@/assets/images/icon/icon_68.svg";
import { postData } from "@/libs/server/backendServer";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

const RegisterForm = ({
  setPhone,
  setActiveTab,
  setRemember,
}: {
  setPhone: (phone: string | null) => void;
  setActiveTab: (index: number) => void;
  setRemember: (remember: boolean) => void;
}) => {
  const schema = yup
    .object({
      name: yup.string().required().label("Name"),
      email: yup.string().required().email().label("Email"),
      phone: yup.string().required().label("Phone"),
      password: yup.string().required().label("Password"),
      password_confirmation: yup
        .string()
        .required()
        .oneOf([yup.ref("password")], "Passwords must match")
        .label("Confirm Password"),
    })
    .required();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });
  const onSubmit = async (data: FormData) => {
    try {
      const response = await postData("register-api", data, {
        "Content-Type": "multipart/form-data",
      });
      setPhone(data.phone);
      setActiveTab(3);
      toast("Registration successfully", { position: "top-center" });
      reset();
      return response.data;
    } catch (error) {
      toast.error("Registration failed", { position: "top-center" });
      throw error;
    }
  };

  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [isConfirmPasswordVisible, setConfirmPasswordVisibility] =
    useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisibility(!isConfirmPasswordVisible);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>Name*</label>
            <input type="text" {...register("name")} placeholder="Zubayer " />
            <p className="form_error">{errors.name?.message}</p>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>Email*</label>
            <input
              type="email"
              {...register("email")}
              placeholder="Youremail@gmail.com"
            />
            <p className="form_error">{errors.email?.message}</p>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>phone*</label>
            <input
              type="number"
              {...register("phone")}
              placeholder="01012345678"
            />
            <p className="form_error">{errors.phone?.message}</p>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-20">
            <label>Password*</label>
            <input
              type={isPasswordVisible ? "text" : "password"}
              {...register("password")}
              placeholder="Enter Password"
              className="pass_log_id"
            />
            <span className="placeholder_icon">
              <span
                className={`passVicon ${isPasswordVisible ? "eye-slash" : ""}`}
              >
                <Image
                  onClick={togglePasswordVisibility}
                  src={OpenEye}
                  alt=""
                />
              </span>
            </span>
            <p className="form_error">{errors.password?.message}</p>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta position-relative mb-20">
            <label>Confirm Password*</label>
            <input
              type={isConfirmPasswordVisible ? "text" : "password"}
              {...register("password_confirmation")}
              placeholder="Confirm Password"
              className="pass_log_id"
            />
            <span className="placeholder_icon">
              <span
                className={`passVicon ${
                  isConfirmPasswordVisible ? "eye-slash" : ""
                }`}
              >
                <Image
                  onClick={toggleConfirmPasswordVisibility}
                  src={OpenEye}
                  alt=""
                />
              </span>
            </span>
            <p className="form_error">
              {errors.password_confirmation?.message}
            </p>
          </div>
        </div>
        <div className="col-12">
          <div className="agreement-checkbox d-flex justify-content-between align-items-center">
            <div>
              <input type="checkbox" id="remember2" onChange={(e) => setRemember(e.target.checked)} />
              <label htmlFor="remember2">
                By hitting the &quot;Register&quot; button, you agree to the{" "}
                <Link href="#">Terms conditions</Link> &{" "}
                <Link href="#">Privacy Policy</Link>
              </label>
            </div>
          </div>
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn-two w-100 text-uppercase d-block mt-20"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
