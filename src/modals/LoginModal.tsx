import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";
import { useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import loginIcon_1 from "@/assets/images/icon/google.png";
import VerifyPhoneForm from "@/components/forms/VerifyPhoneForm";

const LoginModal = () => {
  const locale = useLocale();
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const [showVerifyPhone, setShowVerifyPhone] = useState(false);

  const closeModal = () => {
    const closeModalBTN = document.getElementById("close-login-modal");
    if (closeModalBTN) {
      closeModalBTN.click();
    }
  };

  const handleSignupClick = (e: React.MouseEvent<HTMLAnchorElement>) => {

    e.preventDefault();
    closeModal();
    
    // Small delay to ensure modal closes before navigation
    setTimeout(() => {
      router.push(`/${locale}/signup-agent`);
    }, 150);
  };

  return (
    <>
      <div
        className="modal fade"
        id="loginModal"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-fullscreen modal-dialog-centered">
          <div className="container">
            <div className="user-data-form modal-content">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                id="close-login-modal"
              ></button>

              {showVerifyPhone ? (
                <div className="form-wrapper m-auto">
                  <div className="tab-content mt-30">
                    <div className="tab-pane fade show active">
                      <div className="text-center mb-20">
                        <h2>Verify your phone Number</h2>
                        <p className="fs-20 color-dark">
                          Please enter the verification code sent to your phone
                          number: {phone}
                        </p>
                      </div>
                      <VerifyPhoneForm remember={remember} phone={phone} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-wrapper m-auto">
                  <div className="tab-content mt-30">
                    <div className="tab-pane fade show active">
                      <div className="text-center mb-20">
                        <h2>Welcome Back!</h2>
                        <p className="fs-20 color-dark">
                          Still don&apos;t have an account?{" "}
                          <Link href={`/${locale}/signup-agent`} onClick={handleSignupClick}>
                            Sign up
                          </Link>
                        </p>
                      </div>
                      <LoginForm />
                    </div>
                  </div>

                  <div className="d-flex align-items-center mt-30 mb-10">
                    <div className="line"></div>
                    <span className="pe-3 ps-3 fs-6">OR</span>
                    <div className="line"></div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6 mx-auto">
                      <Link
                        href="#"
                        className="social-use-btn d-flex align-items-center justify-content-center tran3s w-100 mt-10"
                      >
                        <Image src={loginIcon_1} alt="" />
                        <span className="ps-3">Signup with Google</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;