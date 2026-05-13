import { CanAccess } from "@refinedev/core";
import type { Assets, ListViewBlockProps , Sites } from "../types";
import JobStatusSelect from "./JobStatusSelect";
import { isWithinLast24Hours } from "../utils";

const ListViewBlock = ({
    jobData, 
    allSite, 
    allAssets, 
    statusOptions, 
    lastEditedJobId,
    editJob,
    deleteJob 
}: ListViewBlockProps) => {

    //console.log("ListViewBlock data:", jobData);
    
    return (
        <>
            {
                jobData.map((job) => {

                    const site = allSite.find((s : { data: Sites }) => s.data?.id === job.siteId);
                    const asset = allAssets.find((a : { data: Assets }) => a.data?.id === job.assetId);

                    const isRecentlyCreated = isWithinLast24Hours(String(job.createdAt));

                    return (
                        <div className="job-block" key={job.id}>

                            <div className="job-block__top">
                                <span className="block">{job.reference}</span>
                                <span className="buttons">
                                <CanAccess
                                    resource="jobs"
                                    action="delete"
                                >
                                    <button 
                                        className="button-circle-icon button-trash" 
                                        onClick={() => deleteJob(job)}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                    <button 
                                        className="button-circle-icon button-edit" 
                                        onClick={() => editJob(job)}>
                                        <i className="far fa-edit icon"></i>
                                    </button>
                                </CanAccess>
                            </span>
                            </div>
                            <div className="job-block__middle">
                                <ul>
                                    <li>
                                       <strong>{asset?.data?.name}</strong>{" "}{site?.data?.code}{" "}<span className="custom-name">{site?.data?.location}</span>
                                        {job.id === lastEditedJobId && (
                                            <span className="edited-badge" style={{ display: "inline-block", marginLeft: "0" }}>
                                                Just Edited
                                            </span>
                                        )}    
                                        {isRecentlyCreated && (
                                            <span className="new-badge" style={{ display: "inline-block" }}>
                                                New
                                            </span>
                                        )}
                                        
                                    </li>
                                    <li>{job.description}</li>
                                </ul>
                            </div>  
                            <div className="job-block__bottom">
                                <p className="cost">&#163;{job.cost}</p>
                                <div className="status-form-select block">
                                   
                                    <JobStatusSelect
                                        job={job}
                                        statusOptions={statusOptions}
                                        canEdit={false}
                                    />
                                  
                                </div>
                            </div>
                        </div>
                        
                    )
                })
            }
        </>
    );
}

export default ListViewBlock;