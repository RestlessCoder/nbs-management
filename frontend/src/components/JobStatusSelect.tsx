import { formatEnum } from "../utils";
import { type JobStatusSelectProps } from "../types";

const JobStatusSelect = ({ 
    job, 
    statusOptions, 
    onChange,
    canEdit
}: JobStatusSelectProps) => {

    const getStatusClass = (status: string) => {
        switch(status.toLowerCase()) {
            case "contract_on_site": 
            return "option--teal";
            case "holding_tank":
            return "option--darkorange";
            case "contract_visit_arranged":
            return "option--mediumseagreen";
            case "closed_not_as_reported":
            return "option--darkviolet"; 
            case "closed_visited_not_as_reported":
            return "option--darkslateblue"; 
            case "contractor_finished":
            return "option--slategray"; 
            case "logged_with_nbs":
            return "option--crimson"; 
            case "complete_as_reported":
            return "option--dodgerblue"; 
            case "complete_not_as_reported":
            return "option--darkslateblue"; 
            case "job_approved":
            return "option--orange"; 
            default: 
            return "";
        }
    };

  return (
    <select 
      id="status-select" 
      name="status"
      className={`custom-select ${getStatusClass(String(job.status))}`} // color applied to select itself
      defaultValue={job.status}
      onChange={(e) => onChange?.(e.target.value)} 
      disabled={!canEdit}
    >   
      {statusOptions.map((status) => (
        <option
          key={String(status)}
          value={String(status)}
          className={getStatusClass(String(status))} // color applied to each option
        >
          {formatEnum(String(status))}
        </option>
      ))}
    </select>
  );
}

export default JobStatusSelect;