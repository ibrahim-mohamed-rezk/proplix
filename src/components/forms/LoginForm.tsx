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
import axios from "axios";

interface FormData {
  login: string;
  password: string;
}

const LoginForm = () => {
  const [remember, setRemember] = useState<boolean>(false);
  const schema = yup
    .object({
      login: yup
        .string()
        .required()
        .test(
          "login",
          "Please enter a valid email or phone number",
          (value) => {
            // Check if it's a valid email
            const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
            // Check if it's a valid phone number (simple validation)
            const phoneRegex = /^\d{10,15}$/;
            return emailRegex.test(value) || phoneRegex.test(value);
          }
        )
        .label("Email or Phone"),
      password: yup.string().required().label("Password"),
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
      // Determine if input is email or phone
      const isEmail = data.login.includes("@");

      const response = await postData("login-api", data, {
        "Content-Type": "multipart/form-data",
      });

      await axios.post(
        "/api/auth/login",
        {
          token: response.token,
          user: JSON.stringify(response.data),
          remember,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      reset();
      toast("Login successfully", { position: "top-center" });

      const closeModalBTN = document.getElementById("close-login-modal");
      if (closeModalBTN) {
        closeModalBTN.click();
      }
       reset();
      // Navigate to home page after successful login
      window.location.href = "/"; 
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      throw error;
    }
  };

  const [isPasswordVisible, setPasswordVisibility] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <label>Email or Phone*</label>
            <input
              type="text"
              {...register("login")}
              placeholder="Email or Phone number"
            />
            <p className="form_error">{errors.login?.message}</p>
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
          <div className="agreement-checkbox d-flex justify-content-between align-items-center">
            <div>
              <input
                type="checkbox"
                id="remember"
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Keep me logged in</label>
            </div>
            <Link href="#">Forget Password?</Link>
          </div>
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn-two w-100 text-uppercase d-block mt-20"
          >
            Login
          </button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
