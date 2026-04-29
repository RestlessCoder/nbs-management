import axios from "axios";
import { useState } from "react";

const ResendVerification = ({
    endpoint = "http://localhost:3000/api/auth/resend-verification",
}) => {
    
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
        setLoading(true);

        try {
            const response = await axios.post(endpoint, {}, { withCredentials: true });
            
            console.log("Resend response:", response.data);
           
        } catch (error) {
            console.error("Error resending verification email:", error);
            alert("Failed to resend verification email. Please try again.");
            
        } finally {
            setLoading(false);
        }
    }
    

    return (
        <>
            <button
                onClick={handleClick}
                disabled={loading}
                className="resend-link"
            >

                {loading ? "Loading..." : "Resend Verification Email"}
            </button>
        </>
    )
}

export { ResendVerification };