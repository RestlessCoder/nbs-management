import axios from "axios";
import { useNotification, useGetIdentity } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ResendVerification } from "../../components/ResendVerification";

const VerifyPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { open } = useNotification();
    const { data: user, refetch } = useGetIdentity();
    const [status, setStatus] = useState<"success" | "error">();
    const [serverMessage, setServerMessage] = useState<string>();


    useEffect(() => {

        const token = searchParams.get("token");

        if (!token) {
            open?.({ type: "error", message: "No token provided" });
            return;
        }

        axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL}/auth/verify-email`, { 
            params: { token }, 
            withCredentials: true 
        }).then(res => {
                if (res.data.user?.isVerified) {
                    // Refresh identity so useGetIdentity sees updated JWT
                    refetch?.();
                    setStatus("success");
                }
                open?.({ type: "success", message: res.data.message });
        })
        .catch((err) => {
            setStatus("error");
            setServerMessage(err.response?.data?.message);
            open?.({ type: "error", message: "Verification failed" });
        });
    }, [user, searchParams, refetch, open]);


    return (
        <div className="verify-container">
            <div className="verify-card">
                {!user?.isVerified && status === "error" || !user?.isVerified ? (
                    <>      
                            <div className="icon error">✖</div>
                            <h1>Email hasn't been verified</h1>
                            {serverMessage && <p style={{ lineHeight: 1.2, marginBottom: '0.65rem' }}>{serverMessage}</p>}
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