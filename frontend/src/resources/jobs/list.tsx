import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { CanAccess, useGetIdentity, useList, useMany, useParsed, useTable } from "@refinedev/core";
import type { Jobs } from "../../types";
import { ResendVerification } from "../../components/ResendVerification";
import JobStatusSelect from "../../components/JobStatusSelect";

import DeleteModal from "../../components/DeleteModal.tsx";
import axios from "axios";
import ListViewBlock from "../../components/ListViewBlock.tsx";

const JobsList = () => {     

    const { params } = useParsed();
    const searchFromUrl = params?.search;

    const { data: user } = useGetIdentity();
    const [filterValue, setFilterValue] = useState("");
    const [tableLoading, setTableLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [message, setMessage] = useState("");
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    const [listView, setListView] = useState(true);

    const [showDelete, setShowDelete] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Jobs | null>(null);
        
    const openDelete = (job: Jobs) => { setSelectedJob(job); setShowDelete(true); }
    const closeDelete = () => { setSelectedJob(null); setShowDelete(false); }

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}/jobs/${id}`, 
                { withCredentials: true }
            );

            setShowDelete(false);
            closeDelete();

            // Refetch the job list after deletion
            refetch();
        } catch (err) {
            console.error("Error deleting job:", err);
        }
    };

    const { 
        result: { data: jobData, total },
        tableQuery: { isError , isLoading, error, refetch },
        currentPage,
        setCurrentPage,
        pageSize,
        setSorters, 
        sorters,
        filters,
        setFilters,
    } = useTable<Jobs>({
        resource: "jobs",
        pagination: {
            mode: "server",
            currentPage: 1,
            pageSize: 12,
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

    // Cache siteIds to avoid unnecessary re-renders and API calls when jobData changes
    const siteIds = useMemo(() => {
        const ids = jobData?.map((job) => job.siteId);
        return [...new Set(ids)]; // Removes duplicates
    }, [jobData]);
    // Relation DB Site 
    const { 
        result: { data: sitesData }
    } = useMany({
        resource: "sites", 
        ids: siteIds,
        queryOptions: {
            enabled: siteIds.length > 0, 
        },
    });
    // Use useMemo to ensure allSite updates exactly when the query finishes
    const allSite = useMemo(() => {
        return sitesData ?? [];
    }, [sitesData]);

     // Cache assetsIds to avoid unnecessary re-renders and API calls when jobData changes
    const assetIds = useMemo(() => {
        const ids = jobData?.map((job) => job.assetId);
        return [...new Set(ids)]; // Removes duplicates
    }, [jobData]);
    // Relation DB Asset 
    const { 
        result: { data: assetsData }
    } = useMany({
        resource: "assets", 
        ids: assetIds,
        queryOptions: {
            enabled: assetIds.length > 0, 
        },
    });
    // Use useMemo to ensure allAssets updates exactly when the query finishes
    const allAssets = useMemo(() => {
        return assetsData ?? [];
    }, [assetsData]);


    const handleCostChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFilterValue(value);

        if (value === "low") {
            setSorters([{ field: "cost", order: "asc" }]);
        } else if (value === "high") {
            setSorters([{ field: "cost", order: "desc" }]);
        } else {    
            setSorters([]); // reset sorting
        }
    };

    const handleNewJobsFilter = () => {

        setFilters([
            {
                field: "recent",
                operator: "eq",
                value: "true",
            },
        ]);
        
        // Apply ascending sort
        setSorters([
            {
                field: "createdAt",
                order: "desc",
            },
        ]);
                
        setCurrentPage(1);
        refetch();
         
        setMessage("Show Recent New Jobs (last 2 weeks)");
    };
        
    // 1. Calculate the real page count
    const totalCount = total ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // 2. Create an array [1, 2, 3...] for the buttons
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
    const allJobs = jobData ?? [];

    // First load to keep the URL params clean
    useEffect(() => {
        const isNotInitialState = currentPage > 1 || filters.length > 0 || sorters.length > 0;

        if (isNotInitialState) {
            setUserHasInteracted(true);
        }
    }, [currentPage, filters, sorters]);

    useEffect(() => {
        // If the API is loading, we are definitely loading
        if (isLoading) {
            setTableLoading(true);
        } else {
            // 2. Once API finishes, wait 2 seconds before hiding skeleton
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

    //Get all Status Options value in JOBS db
    const { 
        result: { data: statusOptionsData }
    } = useList({
        resource: "jobs/status-options",
        pagination: { mode: "off" }, 
        queryOptions: {
            select: (result) => {
                // 1. Get unique status options
                const statusOptions = [...new Set(result.data.map((a) => a).filter(Boolean))];

                // 2. Sort status options in ascending order
                return {
                    data: statusOptions.sort((a, b) => String(a).localeCompare(String(b))),
                    total: statusOptions.length,
                };
            },
        },
    });
    
    const statusOptions = statusOptionsData ?? [];

    
    return (
        <>
            <div className="body-dashboard generic-padding bg--whiteSmoke">
                <section className="jobs-section table-container">
                    <div className="grid-x grid-padding-x">
                        <div className="cell small-12 medium-12 large-6 xlarge-7 xxlarge-8 mb--20">
                            <ul className="navigation__items">
                                <li className={activeTab === "all" ? "is-active" : ""}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab("all");                                       
                                            setFilters([], "replace"); 

                                            setCurrentPage(1);
                                            refetch();
                                        }}
                                    >
                                    All Jobs
                                    </a>
                                </li>
                                <li className={activeTab === "quick" ? "is-active" : ""}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab("quick");
                                    }}
                                    >
                                        Quick Fixes
                                    </a>
                                </li>
                                <li className={activeTab === "new" ? "is-active" : ""}>
                                    <a
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setActiveTab("new");
                                            handleNewJobsFilter();
                                        }}
                                    >
                                        New Jobs
                                    </a>
                                </li>
                            </ul>
                        </div>  
                        <div className="cell small-12 msmall-5 medium-6 large-3 xlarge-2 xxlarge-2 text-left--medium text-right mb--20">
                            <div className="filter-buttons">
                                <button className={`filter-buttons__row ${listView ? 'active' : ''}`} onClick={() => setListView(true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                        <g transform="translate(-1450 -177)">
                                            <rect width="12" height="4" transform="translate(1458 177)" fill="#e4e8ee"/>
                                            <rect width="12" height="4" transform="translate(1458 193)" fill="#e4e8ee"/><rect width="4" height="4" transform="translate(1450 177)" fill="#e4e8ee"/>
                                            <rect width="4" height="4" transform="translate(1450 185)" fill="#e4e8ee"/><rect width="12" height="4" transform="translate(1458 185)" fill="#e4e8ee"/>
                                            <rect width="4" height="4" transform="translate(1450 193)" fill="#e4e8ee"/><rect width="4" height="4" transform="translate(1466 193)" fill="#e4e8ee"/>
                                        </g>
                                    </svg>
                                </button>
                                <button className={`filter-buttons__column ${!listView ? 'active' : ''}`} onClick={() => setListView(false)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                    <g transform="translate(-1503 -177)"><rect width="8" height="8" transform="translate(1503 177)" fill="#e4e8ee"/>
                                        <rect width="8" height="8" transform="translate(1515 177)" fill="#e4e8ee"/>
                                        <rect width="8" height="8" transform="translate(1503 189)" fill="#e4e8ee"/>
                                        <rect width="8" height="8" transform="translate(1515 189)" fill="#e4e8ee"/>
                                    </g></svg>
                                </button>
                            </div>
                        </div>
                        <div className="cell small-12 msmall-7 medium-6 large-3 xlarge-3 xxlarge-2 text-right mb--20">
                            <div className="filter-form-select">
                                <form id="filter">
                                    <select 
                                        className="filter-select filter-select--min-width195" 
                                        name="filter"
                                        value={filterValue}
                                        onChange={handleCostChange}
                                    >
                                        <option value="all" selected>Filter Cost</option>
                                        <option key="low" value="low">
                                            Cost: Low to High
                                        </option>
                                        <option key="high" value="high">
                                            Cost: High to Low
                                        </option>
                                    </select>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="grid-x grid-padding-x">
                        {isError && (
                                <div className="error-badge-container">
                                    <div className="error-badge">
                                        <p>Warning: Could not load site information. {error?.message}</p>
                                        <button className="btn-retry" onClick={() => refetch()}>Retry Connection</button>
                                    </div>
                                </div>
                        )}

                        {   
                            message && activeTab === "new" && (
                                <div className="cell small-12">
                                    <div style={{marginLeft: "0.65rem", marginTop: "0.5rem"}}>
                                        {
                                            message.length === 0 ?<p>No new Jobs in the last 7 days</p> : <p>{message}</p>
                                        }
                                    </div>
                                </div>
                          
                            )
                        }

                        
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
                            
                        <div className="cell small-12">
                            <div className="jobs-table">
                                {listView ? (
                                    <table className="jobs-table__content">
                                        <thead className="jobs-table__header">
                                            <tr className="jobs-table__row">
                                                <th className="jobs-table__cell">Reference</th>
                                                <th className="jobs-table__cell">Asset & Site</th>
                                                <th className="jobs-table__cell">Description</th>
                                                <th className="jobs-table__cell">Est. Cost</th>
                                                <th className="jobs-table__cell">Status</th>
                                                <th className="jobs-table__cell">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="jobs-table__body">
                                            
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
                                                    allJobs?.map((job) => {

                                                        const site = allSite.find((s) => s.data?.id === job.siteId);
                                                        const asset = allAssets.find((a) => a.data?.id === job.assetId);
                                            
                                                        return (    

                                                            <tr key={job.id}>
                                                                <td className="jobs-table__cell job-reference"><span className="block">{job.reference}</span></td>
                                                                <td className="jobs-table__cell job-asset"><strong>{asset?.data.name}</strong>{" "}{site?.data.code}{" "}{site?.data.location}</td>
                                                                <td className="jobs-table__cell job-description">{job.description}</td>
                                                                <td className="jobs-table__cell job-cost">&#163;{job.cost}</td>
                                                                <td className="jobs-table__cell job-status">
                                                                    <div className="status-form-select">
                                                                        <form action="" id="status">
                                                                            <JobStatusSelect
                                                                                job={job}
                                                                                statusOptions={statusOptions}
                                                                                onChange={() => {}}
                                                                                canEdit={false}
                                                                            />
                                                                        </form>
                                                                    </div>
                                                                </td>
                                                                <td className="jobs-table__cell job-action">
                                                                    <CanAccess
                                                                            resource="jobs"
                                                                            action="delete"
                                                                        >
                                                                        <button 
                                                                            className="button-circle-icon button-trash"
                                                                            onClick={() => openDelete(job as Jobs)}
                                                                        >
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </button>
                            
                                                                    </CanAccess>
                                                                    {/* TODO list Edit Button */}
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
                                ) : (
                                    <div className="job-block-container">
                                        <ListViewBlock 
                                            jobData={allJobs as Jobs[]}
                                            allSite={allSite}
                                            allAssets={allAssets}
                                            statusOptions={statusOptions}
                                            deleteJob={openDelete}
                                        />
                                    </div>
                                )}
                                

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
                        </div>

                    </div>
                </section>
            </div>
          <DeleteModal 
                show={showDelete} 
                entity={selectedJob as Jobs} 
                onCancel={() => setShowDelete(false)} 
                onConfirm={handleDelete} 
            />
        </>
    )
}

export default JobsList