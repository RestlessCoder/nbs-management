import { useTable } from "@refinedev/core";
import { type DynamicNavFilterProps } from "../types";
import { capitalizeString } from "../utils";
import { IGNORED_FIELDS } from "../constants";

const DynamicNavFilter = ({ 
    resource, 
    activeValue,
    onSortChange
}: DynamicNavFilterProps) => {

    const { result: { data: listData } } = useTable({
        resource: resource
    })

    // 1. Ensure listData exists and has at least one record
    const firstRecord = listData?.[0] || {};

    // 2. Get keys and filter out non-database or complex fields
    const dbColumnsFilters = Object.keys(firstRecord)
        .filter(key =>
            !IGNORED_FIELDS.includes(key) &&          
            firstRecord[key] !== null &&                
            typeof firstRecord[key] !== "object"        
        )

    //console.log(dbColumnsFilters)
    

    return (
        <ul className="navigation__items">
            <li className={!activeValue ? "is-active" : ""}>
                <a href="#" onClick={(e) => { 
                    e.preventDefault(); 
                    onSortChange?.("id"); 
                }}>
                    All {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </a>
            </li>
            {dbColumnsFilters.map((item) => (
                
                <li key={item}>
                     <a href="#"
                        onClick={(e) => {
                            e.preventDefault(); 
                            onSortChange?.(item);
                        }}>
                        By {capitalizeString(item)}
                     </a>
                </li>
            ))}
        </ul>
        
    )
}

export { DynamicNavFilter };