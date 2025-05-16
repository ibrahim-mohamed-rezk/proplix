"use client";

import { useEffect } from "react";
import { animationCreate } from "@/utils/utils";
import ScrollToTop from "@/components/common/ScrollToTop";
import { ToastContainer } from "react-toastify";

if (typeof window !== "undefined") {
    require("bootstrap/dist/js/bootstrap");
}

const Wrapper = ({ children }: any) => {
    useEffect(() => {
        // animation
        const timer = setTimeout(() => {
            animationCreate();
        }, 100);

        return () => clearTimeout(timer);
    }, []);


    return <>
        {children}
        <ScrollToTop />
        <ToastContainer 
            position="top-center"
            hideProgressBar={true}
            theme="dark"
        />
    </>;
}

export default Wrapper
