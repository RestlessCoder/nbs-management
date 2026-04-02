import bgRedImage from "../assets/images/red-bg.png";
import brandLogo from "../assets/images/brand-logo.svg";
import { GridIcon, ListIcon, BoltIcon, UsersIcon } from "../assets/images";
import { useLogin } from "@refinedev/core";
import { useState } from "react";

const LoginPage = () => {
    const { mutate: login, isLoading } = useLogin();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        login({ email, password });
    };

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
                                <form 
                                    className="login__field" 
                                    onSubmit={handleSubmit}>
                                
                                    <label className="generic-label" htmlFor="email">Email</label>
                                    <input  
                                        id="email"
                                        type="email"
                                        className="generic-input email"
                                        placeholder="Enter Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <label className="generic-label" htmlFor="password">Password</label>
                                    <div className="password">
                                        <input  
                                            id="password"
                                            className="generic-input"
                                            placeholder="Enter Password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <span 
                                            className="toggle-password" 
                                            onClick={togglePasswordVisibility}
                                            style={{ cursor: 'pointer' }}
                                        >
                                        <i className={`toggle-password-icon fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </span>
                                    </div>
                                    <button 
                                        className="btn btn--primary sign-in" disabled={isLoading}>
                                        {isLoading ? "Signing in..." : "Sign In"}
                                    </button>
                                </form>
                
                                <div className="forget-login">Forgot your log in?<a href="">Contact adminstrator.</a></div>
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