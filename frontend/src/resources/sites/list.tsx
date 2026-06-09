import { useTable, useParsed,  useGetIdentity, useList, CanAccess, useUpdate } from "@refinedev/core";
import type { Sites } from "../../types";
import { formatNumber } from "../../utils"
import { useEffect, useMemo, useState, type ChangeEvent } from "react"
import { ResendVerification } from "../../components/ResendVerification";
import EditModal from "../../components/EditModal";
import { FALLBACK_LOCATIONS } from "../../constants";
import { FavoriteButton } from "../../components/FavoriteButton";

const SitesList = () => {   
    const { data: user } = useGetIdentity();
    const { params } = useParsed();
    const { mutateAsync } = useUpdate();

    const searchFromUrl = params?.search;
    const [filterValue, setFilterValue] = useState("");
    const [tableLoading, setTableLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    const [showEdit, setShowEdit] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Sites | null>(null);
    const [lastEditedSiteId, setLastEditedSiteId] = useState<number | null>(null);
    const [showFavourites, setShowFavourites] = useState(false);
    
    const [errorMessage, setErrorMessage] = useState<string>("");

    const openEdit = (site: Sites) => { setSelectedSite(site); setShowEdit(true); }
    const closeEdit = () => { setSelectedSite(null); setShowEdit(false); }
    

    const handleEdit = async (id: number, data: Partial<Sites>) => {
        try {

            await mutateAsync({
                resource: "sites",
                id,
                values: data,
                meta: { withCredentials: true }, // optional if your dataProvider supports it
            });
    
            setShowEdit(false);
            closeEdit();
            setLastEditedSiteId(id);
            refetch();
            refetchFavourites();
        } catch (err) {
            console.error("Error editing site:", err);

            const errorMessage = JSON.parse((err as any)?.message || "{}")?.error || "Error editing site. Please try again.";
            setErrorMessage(errorMessage);
        }
    }
    
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
        meta: { favourited: showFavourites },
    });

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

    // All favourites
    const { 
        result: { data: favouritesData },
        query: { refetch: refetchFavourites }
    } = useList({
        resource: "sites/favourites",
        pagination: { mode: "off" }, 
    });


    // 1. Calculate the real page count
    const totalCount = total ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // 2. Create an array [1, 2, 3...] for the buttons
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    

    const allSites = useMemo(() => {
           if (!siteData || !favouritesData) return [];
           
            const list = showFavourites ? [...(favouritesData ?? [])] : [...siteData];

            // Move me to top logic
            return list.sort((a, b) => {
                if (a.id === lastEditedSiteId) return -1;
                if (b.id === lastEditedSiteId) return 1;
                return a.name.localeCompare(b.name); // or your default sort
                
        });
    }, [siteData, favouritesData, lastEditedSiteId, showFavourites]);

    // Get all locations
    const { 
        result: { data: siteLocationData }
    } = useList({
        resource: "sites",
        pagination: { mode: "off" }, 
        queryOptions: {
            select: (result) => {
                // 1. Get unique locations
                const uniqueLocation = [...new Set(result.data.map((a) => a.location).filter(Boolean))];
                
                // 2. Return the shape Refine expects
                return {
                    data: uniqueLocation.sort((a, b) => a - b),
                    total: uniqueLocation.length,
                };
            },
        },
    });
    
    const dynamicLocations = siteLocationData ?? [];

    // Merge dynamic DB values with fallback list
    const allLocations = Array.from(new Set([
        ...FALLBACK_LOCATIONS,
        ...dynamicLocations,
    ]));
    
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
        <>
            <div className="body-dashboard generic-padding bg--whiteSmoke">
                <section className="sites-section table-container"> 
                    <div className="grid-x grid-padding-x">
                        <div className="cell small-12 medium-8 large-9 mb--20">
                            <ul className="navigation__items">
                                <li className={activeTab === "all" ? "is-active" : ""}>
                                    <a href="#" onClick={(e) => { 
                                        e.preventDefault(); 
                                        setActiveTab("all");                                       
                                        setFilters([], "replace"); 
                                        setShowFavourites(false);

                                        setCurrentPage(1);
                                        refetch();
                                    }}>
                                        All Sites
                                    </a>
                                </li>
                                <li className={activeTab === "favourites" ? "is-active" : ""}>
                                    <a href="" onClick={(e) => { 
                                        e.preventDefault(); 
                                        setShowFavourites(true);
                                        setActiveTab("favourites");
                                    }}>
                                        My Favourites
                                    </a>
                                </li>
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
                                        <option value="">Filter Budget</option>
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
                                showFavourites && (favouritesData?.length === 0) &&
                                    <p style={{ marginLeft: '0.65rem', marginTop: '1rem' }}>No favourites found. Try adding some!</p>
                                
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
                                                            <td className="sites-table__cell site-name">
                                                                <span className="custom-name">{site.name}</span>
                                                                {site.id === lastEditedSiteId && (
                                                                    <span className="edited-badge" style={{ display: "inline-block", marginLeft: "0" }}>
                                                                        Just Edited
                                                                    </span>
                                                                )}    
                                                            </td>
                                                            <td className="sites-table__cell location">{site.location}</td>
                                                            <td className="sites-table__cell finance">{site.entity}</td>
                                                            <td className="sites-table__cell category">
                                                                <span className={`block ${colourStrClass}`}>
                                                                    {site.category.toLowerCase() === "colourless" ? "" : site.category}
                                                                </span>
                                                            </td>
                                                            <td className="sites-table__cell budget">&#163;{formatNumber(site.budget)}</td>
                                                            <td className="sites-table__cell action">
                                                                <FavoriteButton 
                                                                    siteId={site?.id as number} 
                                                                    initialFavorite={site?.isFavorited} 
                                                                    onToggled={refetchFavourites}
                                                                />
                                                                <CanAccess
                                                                    resource="sites"
                                                                    action="edit"
                                                                    params={{ id: site.id }}
                                                                    >
                                                                    <button 
                                                                        className="button-circle-icon button-edit"
                                                                        onClick={() => openEdit(site as Sites)}
                                                                    >
                                                                        <i className="far fa-edit icon"></i>
                                                                    </button>
                                                                </CanAccess>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )
                                        }
                                    </tbody>
                                </table>

                                                        
                                {!tableLoading && totalCount > pageSize && !showFavourites && 
                            
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

            <EditModal 
                mode="SITE"
                show={showEdit}
                entity={selectedSite as Sites}
                fields={[
                    { name: "name", label: "Site Name", type: "text" },
                    {
                        name: "entity", label:"Finance Entity", type: "select", options: [
                            { value: "KFC UK Ltd", label: "KFC UK Ltd" },
                            { value: "KFC Scotland Ltd", label: "KFC Scotland Ltd" },
                            { value: "KFC Wales Ltd", label: "KFC Wales Ltd" },
                            { value: "SOCSCO Ltd", label: "	SOCSCO Ltd" },
                    ]},
                    { 
                        name: "location", 
                        label: "Location", 
                        type: "select", 
                        options: allLocations.map(location => ({ 
                            value: String(location), label: location 
                        }))
                    },
                    { name: "budget", label: "Budget", type: "number" },
                    { name: "category", label: "Category", type: "select", options: [
                        { value: "Gold", label: "Gold" },
                        { value: "Silver", label: "Silver" },
                        { value: "Bronze", label: "Bronze" },
                        { value: "Colourless", label: "Colourless" },
                    ]},
                ]}
                error={errorMessage}
                onCancel={() => setShowEdit(false)}
                onConfirm={handleEdit} 
            />
        </>
    )
}

export default SitesList