import type { ListViewBlockProps } from "../types";
import JobStatusSelect from "./JobStatusSelect";

const ListViewBlock = ({
    jobData, 
    allSite, 
    allAssets, 
    statusOptions, 
    deleteJob 
}: ListViewBlockProps) => {

    console.log("ListViewBlock data:", jobData);
    
    return (
        <>
            {
                jobData.map((job) => {

                    const site = allSite.find((s: { data: { id: number; }; }) => s.data?.id === job.siteId);
                    const asset = allAssets.find((a: { data: { id: number; }; }) => a.data?.id === job.assetId);

                    return (
                        <div className="job-block" key={job.id}>
                            <div className="job-block__top">
                                <span className="block">{job.reference}</span>
                            <span className="buttons">
                                <button 
                                    className="button-circle-icon button-trash" 
                                    onClick={() => deleteJob(job)}
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                                <button className="button-circle-icon button-edit">
                                    <i className="far fa-edit icon"></i>
                                </button>
                            </span>
                            </div>
                            <div className="job-block__middle">
                                <ul>
                                    <li>
                                        <strong>{asset?.data.name}</strong>{" "}{site?.data.code}{" "}{site?.data.location}
                                    </li>
                                    <li>{job.description}</li>
                                </ul>
                            </div>  
                            <div className="job-block__bottom">
                                <p className="cost">&#163;{job.cost}</p>
                                <div className="status-form-select block">
                                    <form action="" id="status">
                                        <JobStatusSelect
                                            job={job}
                                            statusOptions={statusOptions}
                                            onChange={() => {}}
                                            canEdit={false}
                                        />
                                    </form>
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