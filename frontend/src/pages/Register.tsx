import brandLogo from "../assets/images/brand-logo.svg";
import { Link, useList, useRegister } from "@refinedev/core";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { RegisterSchema, type RegisterFormValues } from "../lib/validation";


const RegisterPage = () => {

    const { mutateAsync: registerUser } = useRegister();

    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(RegisterSchema),
        mode: "onChange", // Optional: validates as they type
    });

    // 3. The Submit Handler
    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);

        console.log("Form Data:", data); // Debug: Check form data before submission

        try {

            const result = await registerUser({
                email: data.email,
                password: data.password,
                name: data.fullName,
                siteId: Number(data.site),
                gender: data.gender,
                role: "USER",
            });

            if (result.success === false && result.error) setServerError(result.error.message);        

             console.log(result); 
        } catch (error: any) {
            console.error("Registration Error:", error);
            setServerError(error.message || "An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }

    };


    // Get all site value in assets db
    const { 
        result: { data: siteData }
    } = useList({
        resource: "sites",
        pagination: { mode: "off" }, 
        queryOptions: {
            select: (result) => {
                // 1. Get unique sites
                const sites = [...new Set(result.data.map((a) => a).filter(Boolean))];

                // 2. Sort sites in ascending order
                return {
                    data: sites.sort((a, b) => String(a).localeCompare(String(b))),
                    total: sites.length,
                };
            },
        },
    });
    
    const dynamicSites = siteData ?? [];

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
                          
                                {serverError != null && (
                                    <div style={{ color: '#ff0000' }}>
                                        {serverError}
                                    </div>
                                )}
                                <form 
                                    className="login__field" 
                                    onSubmit={handleSubmit(onSubmit)}
                                >

                                    <label className="generic-label" htmlFor="fullName">Full Name</label>
                                    <input  
                                        id="fullName"
                                        type="text"
                                        className="generic-input email"
                                        placeholder="Full Name"
                                        {...register("fullName")}
                                    />
                                    {errors.fullName && <span className="error-text">{errors.fullName.message}</span>}
                                                          
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
                                    <input  
                                        id="password"
                                        className="generic-input email"
                                        placeholder="Enter Password"
                                        type="password"
                                        {...register("password")}
                                    />
                                    
                                    {errors.password && <span className="error-text">{errors.password.message}</span>}

                                    <label className="generic-label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input  
                                        id="confirmPassword"
                                        className="generic-input email"
                                        placeholder="Enter Confirm Password"
                                        type="password"
                                        {...register("confirmPassword")}
                                    />
                                    {errors.confirmPassword && <span className="error-text">{errors.confirmPassword.message}</span>}
                                    
                                    <label className="generic-label" htmlFor="site">Site</label>
                                    <select 
                                        className="generic-input email" 
                                        id="site"
                                        {...register("site")}
                                    >
                                        <option value="">Select Site</option>
                                        {dynamicSites.map((site) => (
                                            <option key={site.id} value={site.id}>
                                                {site.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.site && <span className="error-text">{errors.site.message}</span>}

                                   <span className="generic-label">Gender</span>  
                                   <div className="radio-group">  
                                               
                                        <label className="cursor-pointer">
                                            <input
                                                type="radio"
                                                value="GUY"
                                                {...register("gender")}
                                            />
                                            <span>GUY</span>
                                        </label>

                                        <label className="cursor-pointer">
                                            <input
                                                type="radio"
                                                value="GIRL"
                                                {...register("gender")}
                                            />
                                            <span>GIRL</span>
                                    </label>
                                    {errors.gender && <span className="error-text">{errors.gender.message}</span>}
                                </div>
                                    <button 
                                        type="submit"
                                        className="btn btn--primary sign-in" disabled={isLoading}>
                                        {isLoading ? "Registering..." : "Register"}
                                    </button>
                                </form>
                
                                <div className="forget-login">Already registered? <Link to="/login">Login here</Link></div>
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

export default RegisterPage