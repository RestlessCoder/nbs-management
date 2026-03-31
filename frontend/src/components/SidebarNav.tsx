import { useMenu } from "@refinedev/core";
import { Link } from "react-router";
import { useState } from "react";

const SidebarNav = () => {
    const { menuItems, selectedKey } = useMenu();
    const [isLightMode, setIsLightMode] = useState(false);

    const toggleLightMode = () => {
        setIsLightMode(!isLightMode);
    }

    return (
        <>
            <div className="main-sidebar-left" style={isLightMode ? { backgroundColor: "#fff" } : { backgroundColor: "#B1142C" }}>
                <div className={`sidebar-dashboard ${isLightMode ? "light" : ""}`}>
                    <div className="main-logo">
                        <img className="main-logo-image" 
                            src={isLightMode ? "src/assets/images/brand-logo.svg" : "src/assets/images/white-brand-logo.svg"} 
                        alt="brand logo white" />
                    </div>
                    <span className="border-inbetween"></span>
                    <div className="report-button">
                        <a 
                            className={`btn ${isLightMode ? "btn--primary" : "btn--black"} report`} 
                            data-open="report-fault">
                            Report a Fault
                        </a>
                    </div>
                    <nav className={`dashboard-buttons pb--64 ${isLightMode ? "light" : ""}`}>
                        <ul>
                        {
                            menuItems.map((item) => (
                                <li key={item.key} className={item.key === selectedKey ? "active" : ""}>
                                    <Link to={item.route ?? "/"}
                                    >
                                        {item.meta?.icon !== undefined && item.meta.icon}   
                                        {item.meta?.label}
                                    </Link>
                                </li>
                            ))                 
                        }
                        </ul>
                    </nav>

                    <div 
                        className={`toggle-button ${isLightMode ? "light" : ""}`} 
                    >
                        <label className="switch">
                            <input 
                                className="toggle-checkbox" type="checkbox" 
                                checked={isLightMode}
                                onChange={toggleLightMode}
                            />
                            <span className="slider-input round"></span>
                        </label>
                        <span><svg className="contrast-logo" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><g transform="translate(-100 -845)"><path className="contrast-logo" d="M25,17.5A7.5,7.5,0,1,0,32.5,25,7.5,7.5,0,0,0,25,17.5ZM25,30a5,5,0,0,1,0-10Z" transform="translate(82.5 827.5)" fill="#fff"/></g></svg></span>
                        <p className="copyright-sidebar mt--12">&#169; <strong>{new Date().getFullYear()}</strong> www.nbsni.co.uk</p>
                    </div>

                    <span className="border-inbetween border-inbetween--sm-padding"></span>

                    <div className="logout-button">
                        <span className="logout">
                        <svg className="logout-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="25.002" viewBox="0 0 25 25.002"><path d="M21.251,35h-4.5A1.752,1.752,0,0,1,15,33.251V16.75A1.752,1.752,0,0,1,16.75,15h4.5a1.25,1.25,0,1,0,0-2.5h-4.5a4.255,4.255,0,0,0-4.25,4.25v16.5a4.255,4.255,0,0,0,4.25,4.25h4.5a1.25,1.25,0,1,0,0-2.5Z" transform="translate(-12.5 -12.5)" fill="#fff" className="logout-icon"/>
                            <path className="logout-icon" d="M37.405,25.478a1.251,1.251,0,0,0-.271-1.362l-6.249-6.25a1.25,1.25,0,1,0-1.768,1.768l4.116,4.116H21.25a1.25,1.25,0,0,0,0,2.5H33.233l-4.116,4.116a1.25,1.25,0,0,0,1.768,1.768l6.249-6.25A1.246,1.246,0,0,0,37.405,25.478Z" transform="translate(-12.5 -12.5)" fill="#fff" />
                        </svg>Logout</span>
                        <span className="brand-logo">
                            <img 
                                className="brand-logo-image" 
                                src={isLightMode ? "src/assets/images/nbs-logo.svg" : "src/assets/images/nbs-white-logo.svg"} 
                                alt="brand logo" />
                        </span>
                    </div>
                </div>
            </div>
        </>
        
    )   
}

export default SidebarNav