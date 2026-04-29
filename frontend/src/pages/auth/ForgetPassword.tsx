import { Link, useForgotPassword, } from "@refinedev/core";
import brandLogo from "../../assets/images/brand-logo.svg"; 
import { useState } from "react";

const ForgotPasswordPage = () => {
    
    const { mutateAsync: forgotPasswordMutate } = useForgotPassword();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(false);
    const [serverMessage, setServerMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const result = await forgotPasswordMutate({email}); 
            
            if(result.success === true ) {
                setStatus(true);
                setServerMessage("Password reset email sent! Please check your inbox.");
            }
            if(result.success === false && result.error) {
                setStatus(false);
                setServerMessage(result.error.message); 
            }
        } finally {
            setIsLoading(false);
        }
        
    }

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
                                    <h1 className="login__title">Forgot Password</h1>
                                </div>
                                {   
                                    serverMessage &&  (
                                        <div style={{ color: `${status ? '#28a745' : '#ff0000'}`, textAlign: 'center'}}>
                                            {serverMessage}
                                        </div>
                                    ) 
                                }
                                <div className="login__field">
                                     <form
                                        onSubmit={onSubmit}
                                    >   
                                        <label className="generic-label" htmlFor="email">Enter your email</label>
                                        <input 
                                            className="generic-input email"
                                            type="email" 
                                            id="email" 
                                            placeholder="Enter your email" 
                                            onChange={(e) => setEmail(e.target.value)}
                                            required 
                                        />
                                        <button
                                            className="btn btn--primary sign-in centered"
                                            disabled={isLoading}
                                            type="submit"
                                            >Submit
                                        </button>
                                    </form>

                                    <div className="forget-login text-center mt--24">
                                        <Link className="link" to="/login">Back to home</Link>
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

export default ForgotPasswordPage;