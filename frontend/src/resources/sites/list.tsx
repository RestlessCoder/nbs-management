import { useTable, useParsed,  useGetIdentity } from "@refinedev/core";
import { type Sites } from "../../types";
import { formatNumber } from "../../utils"
import { useEffect, useState, type ChangeEvent } from "react"
import { ResendVerification } from "../../components/ResendVerification";

const SitesList = () => {   
    const { data: user } = useGetIdentity();
    const { params } = useParsed();
    const searchFromUrl = params?.search;
    const [filterValue, setFilterValue] = useState("");
    const [tableLoading, setTableLoading] = useState(true);
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    const { 
        result: { data: siteData, total  },
        tableQuery: { isError , isLoading, error, refetch },
        currentPage,
        setCurrentPage,
        pageSize,
        filters,
        sorters,
        setSorters,
        setFilters,
    } = useTable<Sites>({
        resource: "sites",
        pagination: {
            mode: "server",
            currentPage: 1,
            pageSize: 10,
        },
        // REMOVE initial sorters and filters to keep URL clean
        sorters: {
            initial: []
        },
        filters: {
            initial: []
        },
        syncWithLocation: userHasInteracted,
    });

    // Identify which field is currently sorted to highlight the tab
    const currentSortField = sorters?.[0]?.field as any;

    const handleSortAction = (field: string) => {
        const order = (field === "year" || field === "createdAt") ? "desc" : "asc";

        setSorters([{ field, order }]);
    };

     const handleBudgetChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilterValue(value);

        if (value === "low") {
            setSorters([{ field: "budget", order: "asc" }]);
        } else if (value === "high") {
            setSorters([{ field: "budget", order: "desc" }]);
        } else {
            setSorters([]); // reset sorting
        }
    };


    // 1. Calculate the real page count
    const totalCount = total ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // 2. Create an array [1, 2, 3...] for the buttons
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const allSites = siteData ?? [];
    
    useEffect(() => {
        // If the API is loading, we are definitely loading
        if (isLoading) {
            setTableLoading(true);
        } else {
            // 2. Once API finishes, wait 2.5 seconds before hiding skeleton
            const timer = setTimeout(() => {
                setTableLoading(false);
            }, 2500); // Change this number to adjust delay (in ms)

            return () => clearTimeout(timer);
        }
    }, [isLoading]);
    
    // First load to keep the URL params clean
    useEffect(() => {
        const isNotInitialState = currentPage > 1 || filters.length > 0 || sorters.length > 0;

        if (isNotInitialState) {
            setUserHasInteracted(true);
        }
    }, [currentPage, filters, sorters]);

     // SEARCH SYNC FROM URL TopBar component
    useEffect(() => {
        setFilters(
        [
            {
                field: "search",
                operator: "contains",
                value: searchFromUrl || undefined,
            },
        ],
        "merge"
        );

        setCurrentPage(1); // reset page when searching
    }, [searchFromUrl]);

    useEffect(() => {
         // If there's an error, we want to stop the loading skeleton immediately
        if (isError) {
            setTableLoading(false);
        }

        //console.error("Error fetching sites:", error);
    }
    , [isError]);

    return (
        <div className="body-dashboard generic-padding bg--whiteSmoke">
            <section className="sites-section table-container"> 
                <div className="grid-x grid-padding-x">
                    <div className="cell small-12 medium-8 large-9 mb--20">
                        <ul className="navigation__items">
                             <li className={!currentSortField ? "is-active" : ""}>
                                <a href="#" onClick={(e) => { 
                                    e.preventDefault(); 
                                    handleSortAction("id"); 
                                }}>
                                    All Sites
                                </a>
                            </li>
                            {/* To Do - Favourite functionality */}
                            <li><a href="">My Favourites</a></li>
                        </ul>                    
                    </div>
                    <div className="cell small-12 medium-4 large-3 text-right mb--20">
                        <div className="filter-form-select">
                             <form id="filter">
                                <select 
                                    className="filter-select filter-select--min-width195" 
                                    name="filter"
                                    value={filterValue}
                                    onChange={handleBudgetChange}
                                >
                                    <option value="all" selected>Filter Budget</option>
                                    <option key="low" value="low">
                                        Budget: Low to High
                                    </option>
                                    <option key="high" value="high">
                                        Budget: High to Low
                                    </option>
                                </select>
                            </form>
                        </div>           
                    </div>
                </div> 
                <div className="grid-x grid-padding-x">
                    <div className="cell small-12">
                        {isError && (
                                <div className="error-badge-container">
                                    <div className="error-badge">
                                        <p>Warning: Could not load site information. {error?.message}</p>
                                        <button className="btn-retry" onClick={() => refetch()}>Retry Connection</button>
                                    </div>
                                </div>
                        )}

                        {
                            user?.isVerified === false && (
                                <div className="error-badge-container">
                                    <div className="error-badge">   
                                        <p>
                                            Your email is not verified. Please check your inbox for the verification email. 
                                            <ResendVerification />
                                        </p>
                                    </div>
                                </div>
                            )
                        }
                        
                        {
                            user?.isVerified === true && 
                            <div className="sites-table">
                                <table className="sites-table__content">
                                    <thead className="sites-table__header">
                                        <tr className="sites-table__row">
                                        <th className="sites-table__cell">Site No.</th>
                                        <th className="sites-table__cell">Site Name</th>
                                        <th className="sites-table__cell">Location</th>
                                        <th className="sites-table__cell">Finance Entity</th>
                                        <th className="sites-table__cell">Category</th>
                                        <th className="sites-table__cell">Montly Budget</th>
                                        <th className="sites-table__cell">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="sites-table__body">

                                      {
                                        tableLoading ? (
                                            [...Array(pageSize)].map((_, i) => (
                                            <tr key={`skel-${i}`}>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                                <td><div className="skeleton-line" style={{ width: '100%' }}></div></td>
                                            </tr>
                                        ))
                                    ) : (
                                    
                                        allSites.map((site) => {

                                            let colourStrClass = "";

                                            switch(site.category.toLowerCase()) {
                                                case "gold": 
                                                    colourStrClass = "block--gold";
                                                    break;
                                                case "silver":
                                                    colourStrClass = "block--silver";
                                                    break;
                                                case "bronze":
                                                    colourStrClass = "block--bronze"; 
                                                    break;
                                                default: 
                                                    colourStrClass = "";
                                            }

                                                return (
                                                    <tr key={site.id}>
                                                        <td className="sites-table__cell site-number">
                                                            <span className="block">{site.code}</span>
                                                        </td>
                                                        <td className="sites-table__cell site-name">{site.name}</td>
                                                        <td className="sites-table__cell location">{site.location}</td>
                                                        <td className="sites-table__cell finance">{site.entity}</td>
                                                        <td className="sites-table__cell category">
                                                            <span className={`block ${colourStrClass}`}>
                                                                {site.category.toLowerCase() === "colourless" ? "" : site.category}
                                                            </span>
                                                        </td>
                                                        <td className="sites-table__cell budget">&#163;{formatNumber(site.budget)}</td>
                                                        <td className="sites-table__cell action">
                                                            {/* To Do List Favourite --> */}
                                                            <button className="button-circle-icon button-favourite liked">
                                                                <i className="far fa-heart"></i>
                                                            </button>
                                                            {/* To Do List Edit --> */}
                                                            <button className="button-circle-icon button-edit">
                                                                <i className="far fa-edit icon"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )
                                    }
                                </tbody>
                            </table>

                                                    
                            {!tableLoading && totalCount > pageSize && 
                        
                                <nav className="pagination-container">
                                    {/* Previous Button */}
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                                        </svg>
                                    </button>

                                    {/* Page Numbers */}
                                    <div className="pagination-numbers">
                                        {pages.map((page) => {
                                            // Logic to show only current, first, last, and neighbors
                                            if (
                                                page === 1 || 
                                                page === totalPages || 
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`pag-num ${currentPage === page ? 'active' : ''}`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                        }
                                            // Show dots
                                            if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <span key={page} className="pag-dots">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    {/* Next Button */}
                                    <button 
                                        className="pagination-btn"
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage == totalPages}   
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                                        </svg>
                                    </button>
                                </nav>
                            }
                        </div>
                        }
                    </div>
                </div>
            </section>
        </div>
    )
}

export default SitesList