import { formatEnum, getOptionClass } from "../utils";
import { type JobStatusSelectProps } from "../types";

const JobStatusSelect = ({ 
    job, 
    statusOptions, 
    onChange,
    canEdit
}: JobStatusSelectProps) => {

  return (
    <select 
      name="status"
      className={`custom-select custom-select--status ${getOptionClass(String(job.status))}`} // color applied to select itself
      value={job.status}
      onChange={(e) => onChange?.(e.target.value)} 
      disabled={!canEdit}
    >   
      {statusOptions.map((status) => (
        <option
          key={String(status)}
          value={String(status)}
          className={getOptionClass(String(status))} // color applied to each option
        >
          {formatEnum(String(status))}
        </option>
      ))}
    </select>
  );
}

export default JobStatusSelect;