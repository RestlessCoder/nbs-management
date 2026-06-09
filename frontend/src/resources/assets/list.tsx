import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { type Assets } from "../../types";
import { DynamicNavFilter } from "../../components/DynamicNavFilter.tsx";
import { CanAccess, useList, useMany, useParsed, useTable, useUpdate } from "@refinedev/core";
import { formatEnum } from "../../utils/index.ts";

import EditModal from "../../components/EditModal";
import DeleteModal from "../../components/DeleteModal.tsx";
import axios from "axios";
import { FALLBACK_ASSET_TYPES, FALLBACK_YEARS } from "../../constants/index.tsx";

const AssetsList = () => {     
    const { params } = useParsed();
    const { mutateAsync } = useUpdate();
    const searchFromUrl = params?.search;
    const [filterValue, setFilterValue] = useState("");
    const [tableLoading, setTableLoading] = useState(true);
    const [userHasInteracted, setUserHasInteracted] = useState(false);

    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Assets | null>(null);
    const [lastEditedAssetId, setLastEditedAssetId] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState<string>("");
    
    const openDelete = (asset: Assets) => { setSelectedAsset(asset); setShowDelete(true); }
    const closeDelete = () => { setSelectedAsset(null); setShowDelete(false); }

    const openEdit = (asset: Assets) => { setSelectedAsset(asset); setShowEdit(true); }
    const closeEdit = () => { setSelectedAsset(null); setShowEdit(false); }

    const handleEdit = async (id: number, data: Partial<Assets>) => {
        try {

            await mutateAsync({
                resource: "assets",
                id,
                values: data,
                meta: { withCredentials: true }, // optional if your dataProvider supports it
            });
    
            setShowEdit(false);
            closeEdit();
            setLastEditedAssetId(id);
            refetch();
        } catch (err) {
            console.error("Error editing asset:", err);

            const errorMessage = JSON.parse((err as any)?.message || "{}")?.error || "Error editing asset. Please try again.";

            setErrorMessage(errorMessage);
        }
    }
    
    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}/assets/${id}`, 
                { withCredentials: true }
            );

            setShowDelete(false);
            closeDelete();

            // Refetch the asset list after deletion
            refetch();
        } catch (err) {
            const errorMessage = JSON.parse((err as any)?.message || "{}")?.error || "Error deleting asset. Please try again.";
            setErrorMessage(errorMessage);
        }
    };

    const { 
        result: { data: assetsData, total },
        tableQuery: { isError , isLoading, error, refetch },
        currentPage,
        setCurrentPage,
        pageSize,
        setSorters, 
        sorters,
        filters,
        setFilters,
    } = useTable<Assets>({
        resource: "assets",
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
    })

    // Identify which field is currently sorted to highlight the tab
    const currentSortField = sorters?.[0]?.field as any;

    const handleSortAction = (field: string) => {
        // Determine order: Years usually look better Newest -> Oldest (desc)
        // Strings (Type/Name) usually look better A -> Z (asc)
        const order = (field === "year" || field === "createdAt") ? "desc" : "asc";

        //console.log(field)
        setSorters([{ field, order }]);
    };

    const siteIds = useMemo(() => {
        const ids = assetsData?.map((asset) => asset.siteId) ?? [];
        return [...new Set(ids)]; // Removes duplicates
    }, [assetsData]);

    // Get all years value in assets db
    const { 
        result: { data: assetYearsData }
    } = useList({
        resource: "assets",
        pagination: { mode: "off" }, 
        queryOptions: {
            select: (result) => {
                // 1. Get unique years
                const uniqueYears = [...new Set(result.data.map((a) => a.year).filter(Boolean))];
                
                // 2. Return the shape Refine expects
                return {
                    data: uniqueYears.sort((a, b) => a - b),
                    total: uniqueYears.length,
                };
            },
        },
    });

    const dynamicYears = assetYearsData ?? [];

    const { result: { data: optionsAssetsData } } = useList({
        resource: "assets",
        pagination: { mode: "off" }, 
    });

    const uniqueYears = useMemo(() => {
        const years = optionsAssetsData?.map((a) => a.year).filter(Boolean) ?? [];
        // merge with fallback and deduplicate
        return [...new Set([...years, ...FALLBACK_YEARS])].sort((a, b) => a - b);
    }, [optionsAssetsData]);

    console.log("optionsAssetsData", optionsAssetsData);
    const uniqueTypes = useMemo(() => {
    const types = optionsAssetsData?.map((a) => a.type.toUpperCase()).filter(Boolean) ?? [];
        const fallbackTypes = FALLBACK_ASSET_TYPES.map(t => t.toUpperCase());
        
        // merge with fallback and deduplicate
        return [...new Set([...types, ...fallbackTypes])].sort((a, b) => a.localeCompare(b));
    }, [optionsAssetsData]);

    const allYears = uniqueYears;
    const allTypes = uniqueTypes;

    console.log("all types", allTypes);
    
    const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
            setFilterValue(value);

            setFilters([
                {
                    field: "year",
                    operator: "eq",
                    value: value === "all" ? undefined : value,
                },
            ], "replace"); // "replace" ensures we don't stack multiple year filters
    };

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
    

    // 1. Calculate the real page count
    const totalCount = total ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // 2. Create an array [1, 2, 3...] for the buttons
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    

    const allAssets = useMemo(() => {
        if (!assetsData) return [];
        
        const list = [...assetsData];

        return list.sort((a, b) => {
            if (a.id === lastEditedAssetId) return -1;
            if (b.id === lastEditedAssetId) return 1;
            return a.name.localeCompare(b.name); // or your default sort
        });
    }, [assetsData, lastEditedAssetId]);

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

    // SEARCH SYNC FROM URL
    useEffect(() => {
        setFilters(
            [
                {
                field: "search",
                operator: "contains",
                value: searchFromUrl || undefined,
                },
            ],"merge"
        );

        setCurrentPage(1); // reset page when searching
    }, [searchFromUrl]);

    

    //console.log(assetsData)

    return (
        <>
            <div className="body-dashboard generic-padding bg--whiteSmoke">
                <section className="jobs-section table-container">
                    <div className="grid-x grid-padding-x">
                        <div className="cell small-12 medium-8 large-8 xlarge-9 mb--20">
                            <DynamicNavFilter 
                                resource="assets"
                                activeValue={currentSortField} 
                                onSortChange={(field) => handleSortAction(field || "")}
                            />
                        </div>
                        <div className="cell small-12 medium-4 large-4 xlarge-3 text-right mb--20">
                            <div className="filter-form-select">
                                <form id="filter">
                                    <select 
                                        className="filter-select filter-select--min-width150" 
                                        name="filter"
                                        value={filterValue}
                                        onChange={handleYearChange}
                                    >
                                        <option value="all">All</option>
                                            {dynamicYears.map((year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
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
                                <div className="assets-table">
                                    
                                    <table className="assets-table__content">
                                        <thead className="assets-table__header">
                                            <tr className="assets-table__row">
                                                <th className="assets-table__cell">Asset Name</th>
                                                <th className="assets-table__cell">Asset Type</th>
                                                <th className="assets-table__cell">Site</th>
                                                <th className="assets-table__cell">Manufacturer</th>
                                                <th className="assets-table__cell">Year</th>
                                                <th className="assets-table__cell">Quick Fixes</th>
                                                <CanAccess
                                                    resource="assets"
                                                    action="delete"
                                                >
                                                    <th className="assets-table__cell">Actions</th>
                                                </CanAccess>                                           
                                            </tr>
                                        </thead>
                                        <tbody className="assets-table__body">
                                            
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
                                                    allAssets.map((asset) => {

                                                        const site = allSite.find((s) => s.data.id === asset.siteId);
                                                        
                                                        //console.log("Found " , site?.data.code)
                                                        //console.log("This is site", allSite.map((item) => item.data.id))
                                                        return (
                                                            <tr key={asset.id}>
                                                                <td className="assets-table__cell asset-name">
                                                                     <span className="custom-name">{asset.name}</span>
                                                                    {asset.id === lastEditedAssetId && (
                                                                        <span className="edited-badge">
                                                                            Just Edited
                                                                        </span>
                                                                    )}    
                                                                </td>
                                                                <td className="assets-table__cell asset-type">{formatEnum(asset.type)}</td>
                                                                <td className="assets-table__cell asset-site">
                                                                    {`${site?.data.code} ${site?.data.location}` || `Site #${asset.siteId}`}
                                                                </td>
                                                                <td className="assets-table__cell asset-manufacturer">{asset.manufacturer}</td>
                                                                <td className="assets-table__cell asset-year">{asset.year}</td>
                                                                <td className="assets-table__cell asset-fixes">
                                                                    <span className="block">{asset.quickFixes}</span>
                                                                </td>
                                                                <td className="assets-table__cell asset-action">
                                                                    <CanAccess
                                                                        resource="assets"
                                                                        action="delete"
                                                                        >
                                                                        <button 
                                                                            className="button-circle-icon button-trash"
                                                                            onClick={() => openDelete(asset as Assets)}
                                                                        >
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </button>
                            
                                                                    </CanAccess>
                                                                    <CanAccess
                                                                        resource="assets"
                                                                        action="edit"
                                                                        params={{ id: asset.id }}
                                                                        >
                                                                        <button 
                                                                            className="button-circle-icon button-edit"
                                                                            onClick={() => openEdit(asset as Assets)}
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

            <EditModal 
                mode="ASSET"
                show={showEdit}
                entity={selectedAsset as Assets}
                fields={[
                    { name: "name", label: "Asset Name", type: "text" },
                    {
                        name: "type", 
                        label:"Asset Type", 
                        type: "select", 
                        options: 
                            allTypes.map(type => ({ 
                                value: String(type), label: type 
                        }))
                    },
                    {
                        name: "siteId", 
                        label: "Site", 
                        type: "select", 
                        options: 
                            allSite.map(site => ({ 
                                value: String(site.data.id), label: `${site.data.code} ${site.data.location}` 
                            }))
                    },
                    { name: "manufacturer", label: "Manufacturer", type: "text" },
                    { name: "year", label: "Year", type: "select", options: allYears.map(year => ({ value: String(year), label: String(year) })) },
                    { name: "quickFixes", label: "Quick Fixes", type: "number" },             
                ]}
                error={errorMessage}
                onCancel={() => setShowEdit(false)}
                onConfirm={handleEdit} 
            />

            <DeleteModal 
                show={showDelete}
                entity={selectedAsset as Assets} 
                onCancel={() => setShowDelete(false)} 
                onConfirm={handleDelete} 
            />
        </>


    )
}

export default AssetsList