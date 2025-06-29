import Image from "next/image";
import Link from "next/link";
import LoginForm from "@/components/forms/LoginForm";
import { useState } from "react";

import loginIcon_1 from "@/assets/images/icon/google.png";
import RegisterForm from "@/components/forms/RegisterForm";
import VerifyPhoneForm from "@/components/forms/VerifyPhoneForm";

const tab_title: string[] = ["Login", "Signup"];

const LoginModal = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [phone, setPhone] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
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
              {activeTab === 3 ? (
                <div className="form-wrapper m-auto">
                  <div className="tab-content mt-30">
                    <div
                      className={`tab-pane fade
                   show active`}
                    >
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
                  <ul className="nav nav-tabs w-100">
                    {tab_title.map((tab, index) => (
                      <li
                        key={index}
                        onClick={() => handleTabClick(index)}
                        className="nav-item"
                      >
                        <button
                          className={`nav-link ${
                            activeTab === index ? "active" : ""
                          }`}
                        >
                          {tab}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="tab-content mt-30">
                    <div
                      className={`tab-pane fade ${
                        activeTab === 0 ? "show active" : ""
                      }`}
                    >
                      <div className="text-center mb-20">
                        <h2>Welcome Back!</h2>
                        <p className="fs-20 color-dark">
                          Still don&apos;t have an account?{" "}
                          <Link href="#">Sign up</Link>
                        </p>
                      </div>
                      <LoginForm />
                    </div>

                    <div
                      className={`tab-pane fade ${
                        activeTab === 1 ? "show active" : ""
                      }`}
                    >
                      <div className="text-center mb-20">
                        <h2>Register</h2>
                        <p className="fs-20 color-dark">
                          Already have an account? <Link href="#">Login</Link>
                        </p>
                      </div>
                      <RegisterForm
                        setPhone={setPhone}
                        setActiveTab={setActiveTab}
                        setRemember={setRemember}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center mt-30 mb-10">
                    <div className="line"></div>
                    <span className="pe-3 ps-3 fs-6">OR</span>
                    <div className="line"></div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6  mx-auto">
                      <Link
                        href="#"
                        className="social-use-btn d-flex align-items-center justify-content-center tran3s w-100 mt-10"
                      >
                        <Image src={loginIcon_1} alt="" />
                        <span className="ps-3">Signup with Google</span>
                      </Link>
                    </div>
                    {/* <div className="col-sm-6">
                      <Link
                        href="#"
                        className="social-use-btn d-flex align-items-center justify-content-center tran3s w-100 mt-10"
                      >
                        <Image src={loginIcon_2} alt="" />
                        <span className="ps-3">Signup with Facebook</span>
                      </Link>
                    </div> */}
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
