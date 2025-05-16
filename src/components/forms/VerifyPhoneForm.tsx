"use client";
import { toast } from "react-toastify";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { postData } from "@/libs/server/backendServer";
import { useRouter } from "next/navigation";
import axios from "axios";

interface FormData {
  code: string;
}

const VerifyPhoneForm = ({
  phone,
  remember,
}: {
  phone: string | null;
  remember: boolean;
}) => {
  const router = useRouter();
  const schema = yup
    .object({
      code: yup.string().required().label("code"),
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
      const response = await postData(
        "verify-code-register",
        { ...data, phone },
        {
          "Content-Type": "multipart/form-data",
        }
      );

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

      toast("Phone number verified successfully", { position: "top-center" });
      reset();

      router.push("/");
      // Close the login modal after successful verification
      const closeModalBTN = document.getElementById("close-login-modal");
      if (closeModalBTN) {
        closeModalBTN.click();
      }

      // Navigate to home page after successful login
      window.location.href = "/";
    } catch (error) {
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-12">
          <div className="input-group-meta position-relative mb-25">
            <input type="number" {...register("code")} placeholder="..." />
            <p className="form_error">{errors.code?.message}</p>
          </div>
        </div>
        <div className="col-12">
          <button
            type="submit"
            className="btn-two w-100 text-uppercase d-block mt-20"
          >
            Verify
          </button>
        </div>
      </div>
    </form>
  );
};

export default VerifyPhoneForm;
