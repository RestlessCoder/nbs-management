import bgRedImage from "@/assets/images/red-bg.png";
import brandLogo from "@/assets/images/brand-logo.svg";
import { GridIcon, ListIcon, BoltIcon, UsersIcon } from "../../assets/images";
import { useLogin } from "@refinedev/core";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { LoginSchema, type LoginFormValues } from "../../lib/validation";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from "react-router";

const LoginPage = () => {

    const { mutateAsync: login } = useLogin();
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [showTooltip, setShowTooltip] = useState(false);

    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
            setShowTooltip(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const location = useLocation();
    const registered = new URLSearchParams(location.search).get("registered");

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(LoginSchema),
        mode: "onChange", // Optional: validates as they type
    });

      
    // 3. The Submit Handler
    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);

        try {

            const result = await login({ 
                email: data.email, 
                password: data.password
            });

            if (result.success === false && result.error) setServerError(result.error.message);
        

            // console.log(result); 
        } finally {
            setIsLoading(false);
        }

    };

    useEffect(() => {       
        if (registered === "true") {
            setServerError("Registration successful! Please log in.");
        }
    }, [registered]);

    return (
        <main className="page-body">
            <section className="login-section">
                <div className="grid-container grid-container--width-viewport grid-container--no-padding-left-right">
                    <div className="block__container">
                        <div className="block__left" style={{ backgroundImage: `url(${bgRedImage})` }}>
                        <div className="block__content">
                            <div className="highlighted-text">
                            <h1>Why NBS Online?</h1>
                            <ul className="highlighted-text__items">
                                <li>
                                    <span className="icon-logo"><img src={GridIcon} alt="icon" /></span>
                                    <span className="text"><strong>Centralized Dashboard</strong> <br/> 
                                    Manage all your restaurant operations from a single, intuitive interface.</span>
                                </li>
                                <li>
                                    <span className="icon-logo"><img src={ListIcon} alt="icon" /></span>
                                    <span className="text"><strong>Detailed Reporting</strong> <br/>
                                        Track inventory, sales, and labor costs with automated daily logs.
                                    </span>
                                </li>
                                <li>
                                    <span className="icon-logo"><img src={BoltIcon} alt="icon" /></span>
                                    <span className="text"><strong>Real-Time Updates</strong>, <br/>
                                        Instant sync across all devices ensures your team stays fast and efficient
                                    </span>
                                </li>
                                <li>
                                    <span className="icon-logo"><img src={UsersIcon} alt="icon" /></span>
                                    <span className="text"><strong>Users Icon: Team Management</strong><br/>
                                        Manage your team effectively with role-based access and permissions.
                                    </span>
                                </li>
                            </ul>
                            </div>
                        </div>
                        </div>
                        <div className="block__right">
                        <div className="block__content block__content--lg-padding">
                            <div className="login">
                            <div className="logo">
                                <img src={brandLogo} alt="brand logo" />
                            </div>

                            <div className="login__field">
                          
                                {serverError != null && (
                                    <div style={{ color: '#ff0000' }}>
                                        {serverError}
                                    </div>
                                )}
                                <form 
                                    className="login__field" 
                                    onSubmit={handleSubmit(onSubmit)}
                                >                              
                                    <label className="generic-label" htmlFor="email">Email</label>
                                    <input  
                                        id="email"
                                        type="email"
                                        className="generic-input email"
                                        placeholder="Enter Email"
                                        {...register("email")}
                                    />
                                    {errors.email && <span className="error-text">{errors.email.message}</span>}
                                    <label className="generic-label" htmlFor="password">Password</label>
                                    <div className="password">
                                        <input  
                                            id="password"
                                            className="generic-input"
                                            placeholder="Enter Password"
                                            type={showPassword ? "text" : "password"}
                                            {...register("password")}
                                        />
                                        <span 
                                            className="toggle-password" 
                                            onClick={togglePasswordVisibility}
                                            style={{ cursor: 'pointer' }}
                                        >
                                        <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                                        </span>
                                    </div>
                                    {errors.password && <span className="error-text">{errors.password.message}</span>}
                                    <button 
                                        type="submit"
                                        className="btn btn--primary sign-in" disabled={isLoading}>
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </button>
                                </form>
                                <div ref={tooltipRef} style={{ position: 'relative', display: 'inline-block', paddingTop: '1.325rem' }}>
                                    <span
                                        style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline dotted', fontSize: '1rem', fontWeight: '400' }}
                                        onClick={() => setShowTooltip(!showTooltip)}
                                    >
                                        View for Demo credentials
                                    </span>

                                    {showTooltip && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '125%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            backgroundColor: '#1a1a1a',
                                            color: '#fff',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '8px',
                                            whiteSpace: 'nowrap',
                                            zIndex: 10,
                                            fontSize: '0.85rem',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                        }}>
                                        <strong>Email:</strong> admin@hotmail.com <br />
                                        <strong>Password:</strong> AdminPass123 <br />
                                        <span style={{ color: '#aaa', fontSize: '0.78rem' }}>
                                            Admin only — create new users & resets passwords.
                                        </span>
                                        <div style={{
                                            position: 'absolute',
                                            top: '-6px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '6px solid transparent',
                                            borderRight: '6px solid transparent',
                                            borderBottom: '6px solid #1a1a1a'
                                        }} />
                                        </div>
                                    )}
                                </div>
                                
            
                                <div className="forget-login" style={{ marginTop: '1.15rem' }}>Forgot your log in?<a href="">Contact adminstrator.</a></div>
                            </div>
                            
                            <div className="copyright-login">
                                <div className="nbs-logo">
                                <img src={brandLogo} alt="brand logo" />
                                </div>
                                <p>&#169; {new Date().getFullYear()} www.nbsni.co.uk</p>
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

export default LoginPage