

import React, { useEffect, useState } from "react";
import { useParsed, useGo } from "@refinedev/core";
import { capitalizeString } from "../utils";

const TopSearchBar = () => {

  const { params } = useParsed(); // read current query params
  const go = useGo();             // function to navigate

  const currentResource = window.location.pathname.replace("/", ""); 

  console.log(params)
  console.log(currentResource)
  
  const [searchQuery, setSearchQuery] = useState(params?.search || "");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
       go({
        to: `${currentResource}`,
        query: {
          ...params,
          search: searchQuery || undefined,
        },
        type: "replace", // THIS replaces URL instead of pushing
      });
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="top-dashboard-bar">
        <div className="searchform-wrapper">
            <div className="searchform">
                <input 
                   className="searchform__input" 
                   type="text" 
                   placeholder={`Search ${capitalizeString(currentResource)|| ""}`} 
                   value={searchQuery}
                   onChange={handleSearch} 
                />
                <button className="searchform__button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </button>
            </div>
        </div>
        <div className="user-details">
            <div className="user-details__image">
                <img src="src/assets/images/user-boy.svg" alt="user boy" />
            </div>
            <span className="user-details__name">Tony McNahon</span>
        </div>
    </div>

    )
}

export default TopSearchBar