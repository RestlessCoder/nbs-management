import { useList, useCreate, useGetIdentity } from "@refinedev/core";
import type { Assets, Sites, ReportFaultFormProps } from "../types";
import { formatEnum } from "../utils";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "@refinedev/react-hook-form";
import { ResendVerification } from "./ResendVerification";
import { ReportFaultSchema, type ReportFaultFormValues } from "../lib/validation";

const ReportFaultForm = ({
    show,
    onClose,
}: ReportFaultFormProps) => { 
 
    const { mutate } = useCreate();
    const { data: user } = useGetIdentity();
    const [success, setSuccess] = useState(false);

    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
    const [selectedAssetType, setSelectedAssetType] = useState<string>("");
    const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
    const [quickFixes, setQuickFixes] = useState<number | null>(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(ReportFaultSchema),
        mode: "onChange", // Optional: validates as they type
    });

    // Get all sites with assets and jobs
    const { 
        result: { data: groupedSitesData },
    } = useList({
        resource: "dashboard/grouped-sites",
        pagination: { mode: "off" },
        queryOptions: {
            select: (result) => {
                const grouped = result.data.reduce((acc, site) => {
                    acc[site.name] = {
                        ...site,
                        assets: site.assets || [],
                        jobs: site.jobs || [],
                        budget: site.budget || 0,
                    };
                    return acc;
                }, {});
                return {
                    ...result,
                    data: Object.values(grouped),
                };
            },
        },
    });

    const allGroupedSitesData = groupedSitesData ?? [];

    // Collect all asset types into a Set to remove duplicates
    const uniqueAssetTypes = new Set(
        allGroupedSitesData.flatMap((site) =>
            site.assets.map((asset: Assets) => asset.type)
        )
    );

    const filteredAssets = allGroupedSitesData
        .flatMap((site) =>
            site.assets
            .filter((asset: Assets) => asset.type === selectedAssetType)
            .map((asset: Assets) => ({
                id: asset.id,
                name: asset.name,
            }))
        );

    // Remove duplicates by names
    const uniqueFilteredAssets = [
        ...new Map(filteredAssets.map((asset) => [asset.id, asset])).values(),
    ];

    // Collect all locations into a Set to remove duplicates
    const uniqueLocations = new Set(
        allGroupedSitesData.flatMap((site) =>
            site.location ? [site.location] : []
        ) 
    );

    const filteredSites = allGroupedSitesData
        .filter((site: Sites) => site.location === selectedLocation)
        .map((site: Sites) => ({
            id: site.id,
            name: site.name
        }));
    
        
    const onSubmit = async (data: ReportFaultFormValues) => {
        mutate(
            {
                resource: "jobs/add-job",
                values: data,
                successNotification: () => ({
                    message: "Job reported successfully",
                    type: "success",
                }),
            },
            {
                onSuccess: () => setSuccess(true),
            }
        );
    };

    if (!show) return null;
    
    return (
        
        <div className="modal report">
            <div className="modal-content modal-content--report-fault"> 
                
            {
                user?.isVerified === false ? (
                    
                    <p className="success-text text-center">
                        To submit a report, your email needs to be verified. Please check your inbox for the verification email. 
                        <ResendVerification />
                    </p>
                        
                ) : (
                    <>
                        {success ? (
                            <div className="success-message centered">
                                <div className="success-icon">✔</div>
                                <h3 className="success-title">Job reported successfully!</h3>
                                <p className="success-text">
                                    Your report has been submitted and recorded.
                                </p>
                                <button
                                className="btn sign-in btn--primary"
                                onClick={() => {
                                    window.location.href = "/";
                                }}
                                >
                                Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ marginLeft:"0.95rem" }}>Report Fault</h3>
                                
                                <form onSubmit={handleSubmit(onSubmit)} className="report-form">
                                    <div className="grid-x grid-padding-x">
                                        <div className="cell small-12 mb--16">
                                        <label className="report-label">Site
                                            <select 
                                                id="site" 
                                                {...register("siteId", { valueAsNumber: true })}
                                                value={selectedSiteId || ""}
                                                onChange={(e) => {
                                                    setSelectedSiteId(Number(e.target.value));
                                                    register("siteId").onChange(e);
                                                }}
                                                disabled={!selectedLocation}
                                            >   
                                                <option value="" disabled>Please Select</option>
                                                {filteredSites.map((site) => (
                                                    <option key={site.id} value={site.id}>
                                                        {site.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        {errors.siteId && <span className="error-report-text">{errors.siteId.message}</span>}
                                        </div>
                                    </div>
                                
                                    <div className="grid-x grid-padding-x">
                                        <div className="cell small-12 medium-6 mb--16">
                                        <label className="report-label">Location
                                            <select 
                                                id="location" 
                                                {...register("location")}
                                                value={selectedLocation}
                                                onChange={(e) => { 
                                                    setSelectedLocation(e.target.value)
                                                    setSelectedSiteId(0);
                                                    register("location").onChange(e);
                                                }}
                                            >
                                            <option value="" disabled>Please Select</option>
                                            {
                                                Array.from(uniqueLocations).map((location) => (
                                                    <option 
                                                        key={location} 
                                                        value={location}
                                                    >
                                                        {location}
                                                    </option>
                                                ))
                                            }
                                            </select>
                                        </label>
                                        {errors.location && <span className="error-report-text">{errors.location.message}</span>}
                                        </div>
                                        <div className="cell small-12 medium-6 mb--16">
                                            <label className="report-label">Asset Type
                                                <select 
                                                    id="assets-type" 
                                                    {...register("assetType")}   
                                                    value={selectedAssetType}
                                                    onChange={(e) => {
                                                        setSelectedAssetType(e.target.value);
                                                        setSelectedAssetId(0);
                                                        register("assetType").onChange(e);
                                                    }} 
                                                >
                                                    <option value="" disabled>Please Select</option>
                                                    {
                                                        Array.from(uniqueAssetTypes).map((type) => (
                                                            <option 
                                                                key={type} 
                                                                value={type}
                                                            >
                                                                {formatEnum(type)}
                                                            </option>
                                                        )) 
                                                                    
                                                    }
                                                </select>
                                            </label>
                                            {errors.assetType && <span className="error-report-text">{errors.assetType.message}</span>}
                                        </div>
                                    </div>
                                    <div className="grid-x grid-padding-x">
                                        <div className="cell small-12 medium-8 mb--16">
                                            <label className="report-label">Asset
                                                <select 
                                                    id="asset" 
                                                    {...register("assetId", { valueAsNumber: true })}
                                                    value={selectedAssetId || ""}
                                                    onChange={(e) => { 
                                                        setSelectedAssetId(Number(e.target.value))
                                                        register("assetId").onChange(e)
                                                    }}
                                                    disabled={!selectedAssetType}
                                                >
                                                <option value="" disabled>Please Select</option>
                                                {
                                                uniqueFilteredAssets.map((asset) => (
                                                        <option key={asset.id} value={asset.id}>
                                                            {formatEnum(asset.name)}
                                                        </option>
                                                    ))                                        
                                                }
                                                </select>
                                            </label>
                                            {errors.assetId && <span className="error-report-text">{errors.assetId.message}</span>}
                                        </div>
                                        <div className="cell small-12 medium-4 mb--16">
                                            <label className="report-label">Quick Fixes</label>
                                            <input 
                                                className="generic-input generic-input--fixes" 
                                                type="number" 
                                                id="quick-fixes" 
                                                {...register("quickFixes", { valueAsNumber: true })} 
                                                value={quickFixes ?? ""}
                                                min={0}
                                                max={5}
                                                step={1}
                                                onInput={(e) => {
                                                    // Strip leading zeros
                                                    const target = e.target as HTMLInputElement;
                                                    if (target.value.startsWith("0") && target.value.length > 1) {
                                                    target.value = String(Number(target.value));
                                                    }
                                                }}                          
                                                onChange={(e) => {
                                                    setQuickFixes(Number(e.target.value))
                                                    register("quickFixes").onChange(e)
                                                }}  
                                            />
                                            {errors.quickFixes && <span className="error-report-text">{errors.quickFixes.message}</span>}
                                        </div>
                                        <div className="cell small-12 mb--16">
                                            <label className="report-label">Description</label>
                                            <textarea 
                                                className="generic-textarea" 
                                                id="description" 
                                                {...register("description")} 
                                                placeholder="Description of the fault" 
                                            ></textarea>
                                            {errors.description && <span className="error-report-text">{errors.description.message}</span>}
                                        </div>
                                        <div className="cell small-12">
                                            <button className="btn btn--primary btn--report-custom">Report Fault</button>
                                        </div>
                                    </div>
                                </form>
                            </>
                        )}
                    </>
                )
                
            }
                <button
                    onClick={() => onClose()} 
                    className="close-button" data-close aria-label="Close modal" 
                    type="button">
                    <  span aria-hidden="true">&times;</span>
                </button>
            </div>
            
        </div>
        
    )   
}

export default ReportFaultForm;