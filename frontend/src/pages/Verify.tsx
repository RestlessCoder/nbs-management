import { useNotification, useGetIdentity } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ResendVerification } from "../components/ResendVerification";

import axios from "axios";
import { set } from "zod";

const VerifyPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { open } = useNotification();
    const { data: user, refetch } = useGetIdentity();
    const [status, setStatus] = useState<"success" | "error">();

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            open?.({ type: "error", message: "No token provided" });
            return;
        }

        axios.get("http://localhost:3000/api/auth/verify-email", { 
            params: { token }, 
            withCredentials: true 
        })
            .then(res => {
                    if (res.data.user?.isVerified) {
                        // Refresh identity so useGetIdentity sees updated JWT
                        refetch?.();
                        console.log("Verification successful:", res.data);
                    }
                    setStatus("success");
                    open?.({ type: "success", message: res.data.message });
            })
            .catch(() => {
                setStatus("error");
                open?.({ type: "error", message: "Verification failed" });
            });
    }, [searchParams, refetch, open]);

    console.log("User data in VerifyPage:", user);

    return (
        <div className="verify-container">
            <div className="verify-card">

                {status === "error" || user?.isVerified === false ? (
                    <>
                            <div className="icon error">✖</div>
                            <h1>Email hasn't been verified</h1>
                            <ResendVerification />
                        </>
                    ) : status === "success" || user?.isVerified ? (
                        <>
                            <div className="icon success">✔</div>    
                            <h1>Email Already Verified</h1>
                            <p>Your email is already verified. Go to dashboard</p>
                        </>
                ) : null}
                
                <button 
                    className="btn btn--primary sign-in" 
                    onClick={() => navigate("/")}>
                    Go to Dashboard   
                </button>
            </div>
        </div>
    )
}

export default VerifyPage;