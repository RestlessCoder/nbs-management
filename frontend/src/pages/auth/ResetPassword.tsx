import { useState } from "react";
import { Link, useUpdatePassword } from "@refinedev/core";
import { ForgotPasswordSchema,  type ForgotPasswordFormValues } from "../../lib/validation";
import { zodResolver } from "@hookform/resolvers/zod/dist/zod.js";
import { useForm } from "@refinedev/react-hook-form";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import brandLogo from "../../assets/images/brand-logo.svg";
import { Navigate, useLocation } from "react-router";



const ResetPasswordPage = () => {

    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    
    const { mutateAsync: updatePassword } = useUpdatePassword();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState(false);
    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [password, setPassword] = useState("");

    if (!token) return <Navigate to="/forgot-password" replace />;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ForgotPasswordSchema),
        mode: "onChange", // Optional: validates as they type
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true);
;
        try {
            const result = await updatePassword({ 
                token: token || "",
                newPassword: data.newPassword,
                confirmNewPassword: data.confirmNewPassword
            });

             if(result.success === true ) {
                setStatus(true);
                setServerMessage("Password updated successfully. Please log in with your new password.");
            }
            if(result.success === false && result.error) {
                setStatus(false);
                setServerMessage(result.error.message); 
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
         <main className="page-body">
            <section className="login-section register">
                <div className="grid-container grid-container--width-viewport grid-container--no-padding-left-right">
                    <div className="block__container">
                        <div className="block__right">
                            <div className="block__content block__content--lg-padding">
                                <div className="login">
                                    <div className="logo">
                                        <img src={brandLogo} alt="brand logo" />
                                    </div>

                                    <div className="login__field">
                                        {   
                                            serverMessage &&  (
                                                <div style={{ color: `${status ? '#28a745' : '#ff0000'}`, textAlign: 'center'}}>
                                                    {serverMessage} 
                                                    { status && <span> Please <Link className="link" to="/login">log in</Link> with your new password.</span>}
                                                </div>
                                            ) 
                                        }
                                        <form 
                                            className="login__field" 
                                            onSubmit={handleSubmit(onSubmit)}>

                                                <label className="generic-label" htmlFor="newPassword">New Password</label>
                                                <div className="password">
                                                    <input
                                                        id="newPassword"
                                                        className="generic-input"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="New Password"
                                                        {...register("newPassword")}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                    />
                                                    <span 
                                                        className="toggle-password" 
                                                        onClick={togglePasswordVisibility}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                                    </span>
                                                </div>
                                                {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}

                                                <label className="generic-label" htmlFor="confirmNewPassword">Confirm New Password</label>
                                                <input  
                                                    id="confirmNewPassword"
                                                    className="generic-input email"
                                                    placeholder="Enter Confirm New Password"
                                                    type="password"
                                                    {...register("confirmNewPassword")}
                                                />
                                                {errors.confirmNewPassword && <span className="error-text">{errors.confirmNewPassword.message}</span>}
                                                
                                                <button 
                                                    type="submit"
                                                    className="btn btn--primary sign-in" disabled={isLoading}>
                                                    {isLoading ? "Submitting..." : "Submit"}
                                                </button>

                                        </form>
                                        <div className="forget-login text-center mt--24">
                                            Resend reset password email? 
                                            <Link className="link" to="/forgot-password">Click Here</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default ResetPasswordPage;