import type { StatusCardBlockProps } from "../types";
import { formatEnum, getBackgroundClass } from "../utils";
import { statusOrderData } from "../constants";

const StatusCardBlock = ({ 
    sitesData, 
    isLoading 
}: StatusCardBlockProps) => {
    
    const siteStatusCounts = sitesData.reduce((acc, site) => {
        site.jobs.forEach((job) => {
            const { status, cost } = job;

            // Initialize object for this status if not present
            if (!acc[status]) {
                acc[status] = { count: 0, cost: 0 };
            }

            // Update count and cost for this status
            acc[status].count += 1;
            acc[status].cost += cost;
        });

        return acc;
    }, {} as Record<string, { count: number; cost: number }>);

    const orderedStatusData = Object.entries(siteStatusCounts).sort(
       ([a], [b]) => {
            const indexA = statusOrderData.indexOf(a);
            const indexB = statusOrderData.indexOf(b);

            // If not found, push to the end
            const safeIndexA = indexA === -1 ? Number.MAX_VALUE : indexA;
            const safeIndexB = indexB === -1 ? Number.MAX_VALUE : indexB;

            return safeIndexA - safeIndexB;
        }
    );
    console.log("Site Status Counts:", statusOrderData);

    console.log("Ordered Status Data:", orderedStatusData);

    return (
        <section className="box-container-section">
            <div className="grid-x grid-padding-x">
                <div className="cell small-12">
                <ul>
      
                    {orderedStatusData.map(([status, { count, cost }]) => (
                        <li key={status}>
                            <div className={`box-container-colour ${getBackgroundClass(status)}`}>
                                <h3 className="box-container-colour__number">
                                    {isLoading ? (
                                            <span className="skeleton-line skeleton-line--short skeleton-line--light centered"></span>
                                        ) : (
                                            count
                                        )}
                                    </h3>
                                    <p className="box-container-colour__description">
                                        {formatEnum(status)}
                                    </p>
                                    <p className="box-container-colour__price">
                                        {isLoading ? (
                                            <span className="skeleton-line skeleton-line--short skeleton-line--light centered"></span>
                                        ) : (
                                             <>&#163;{cost}</>
                                        )}
                                    </p>
                                </div>
                            </li>
                       ))
                    }
                </ul>
                </div>  
            </div>         
        </section>    
    )

}

export default StatusCardBlock;