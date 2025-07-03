"use client";
import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslations } from "next-intl";

interface FormData {
  user_name: string;
  user_email: string;
  message: string;
}

const schema = yup
  .object({
    user_name: yup.string().required().label("Name"),
    user_email: yup.string().required().email().label("Email"),
    message: yup.string().required().label("Message"),
  })
  .required();

const ContactForm = () => {
  const t = useTranslations("endUser.contact");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: yupResolver(schema) });

  const form = useRef<HTMLFormElement>(null);

  const sendEmail = (data: FormData) => {
    if (form.current) {
      emailjs
        .sendForm(
          "service_070078r",
          "template_lojvsvb",
          form.current,
          "mtLgOuG25NnIwGeKm"
        )
        .then(
          (result) => {
            const notify = () =>
              toast("Message sent successfully", { position: "top-center" });
            notify();
            reset();
            console.log(result.text);
          },
          (error) => {
            console.log(error.text);
          }
        );
    } else {
      console.error("Form reference is null");
    }
  };

  return (
    <form ref={form} onSubmit={handleSubmit(sendEmail)}>
      <h3>{t("sendMessageTitle", { defaultValue: "Send Message" })}</h3>
      <div className="messages"></div>
      <div className="row controls">
        <div className="col-12">
          <div className="input-group-meta form-group mb-30">
            <label htmlFor="user_name">
              {t("nameLabel", { defaultValue: "Name*" })}
            </label>
            <input
              type="text"
              {...register("user_name")}
              name="user_name"
              placeholder={t("namePlaceholder", { defaultValue: "Your Name*" })}
            />
            <p className="form_error">
              {errors.user_name?.message &&
                t("nameError", { defaultValue: errors.user_name.message })}
            </p>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta form-group mb-40">
            <label htmlFor="user_email">
              {t("emailLabel", { defaultValue: "Email*" })}
            </label>
            <input
              type="email"
              {...register("user_email")}
              placeholder={t("emailPlaceholder", {
                defaultValue: "Email Address*",
              })}
              name="user_email"
            />
            <p className="form_error">
              {errors.user_email?.message &&
                t("emailError", { defaultValue: errors.user_email.message })}
            </p>
          </div>
        </div>
        <div className="col-12">
          <div className="input-group-meta form-group mb-35">
            <textarea
              {...register("message")}
              placeholder={t("messagePlaceholder", {
                defaultValue: "Your message*",
              })}
            ></textarea>
            <p className="form_error">
              {errors.message?.message &&
                t("messageError", { defaultValue: errors.message.message })}
            </p>
          </div>
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn-nine text-uppercase rounded-3 fw-normal w-100"
          >
            {t("sendButton", { defaultValue: "Send Message" })}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
