import { Link, useList } from "@refinedev/core";
import { useEffect, useState } from "react";
import { formatNumberUK } from "../utils";
import StatusCardBlock from "../components/StatusCardBlock";

const DashboardPage = () => {

  const [dataLoading, setDataLoading] = useState(true);
  const [selectedSiteId, setSelectedSiteId] = useState("all");
  
  // Get all site name value in assets db
  const { 
      result: { data: siteNameData }
  } = useList({
      resource: "sites/names",
      pagination: { mode: "off" }, 
      queryOptions: {
          select: (result) => {
              // 1. Get unique sites
              const sites = [...new Set(result.data.map((a) => a).filter(Boolean))];

              // 2. Sort sites in ascending order
              return {
                  data: sites.sort((a, b) => String(a).localeCompare(String(b))),
                  total: sites.length,
              };
          },
      },
  });
    
  const allSitesName = siteNameData ?? [];

  // Get all sites with assets and jobs
  const { 
    result: { data: groupedSitesData },
    query: { isLoading },
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

  useEffect(() => {
    // If the API is loading, we are definitely loading
    if (isLoading) {
        setDataLoading(true);
    } else {
        // 2. Once API finishes, wait 2 seconds before hiding skeleton
        const timer = setTimeout(() => {
            setDataLoading(false);
        }, 2000); // Change this number to adjust delay (in ms)

        return () => clearTimeout(timer);
    }
}, [isLoading]);

  // Filter sites based on dropdown selection
  const filteredSites = selectedSiteId === "all"
    ? groupedSitesData
    : groupedSitesData.filter(site => site.id === Number(selectedSiteId));

  // Calculate totals for summary boxes
  const siteTotals = filteredSites.reduce((acc, site) => {
    acc.totalAssets += site.assets.length;
    acc.totalJobs += site.jobs.length;
    acc.budget += site.budget || 0;
    acc.cost += site.jobs.reduce((sum: number, job: { cost: number; }) => sum + (job.cost || 0), 0);
    
    return acc;
  }, { totalAssets: 0, totalJobs: 0, budget: 0, cost: 0 });

  const balance = siteTotals.budget - siteTotals.cost;

  return (
    <div className="body-dashboard generic-padding bg--whiteSmoke">
      <div className="grid-x grid-padding-x">
        <div className="cell small-12 medium-12 xmedium-7 large-5 mb--24">
            <form action="" id="site">
                <select 
                  className="site-select" 
                  id="siteId"
                  name="siteId"
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                >
                  <option value="all">All Sites</option>
                  {allSitesName.map((site) => (
                      <option key={site.id} value={site.id}>
                          {site.name}
                      </option>
                  ))}
              </select>
            </form>          
        </div> 
      </div>

      <div className="grid-x grid-padding-x">
          <div className="cell small-12 medium-6 xmedium-6 large-4 xlarge-3 mb--24">
            <div className="box-container white">
              <div className="box-container__top">
                  <div className="update-details">
                    <span className="number">
                      {dataLoading ? (
                          <span className="skeleton-line skeleton-line--short"></span>
                      ) : (
                          siteTotals.totalJobs
                      )}                      
                    </span>
                    <span className="logo">
                      <img src="./src/assets/images/icons/list-red-icon.svg" alt="icon" />
                    </span>  
                  </div>
                  <p className="description">Ongoing Jobs</p>
              </div>
              <span className="box-container-border-inbetween"></span>
              <div className="box-container__bottom">
                <div className="links">
                  <Link 
                    className="view-jobs" 
                    to="/jobs">View Jobs 
                    <i className="fa fa-chevron-right icon"></i></Link>
                </div>
              </div>
            </div>
          </div>

          <div className="cell small-12 medium-6 xmedium-6 large-4 xlarge-3 mb--24">
            <div className="box-container white">
              <div className="box-container__top">
                  <div className="update-details">
                    <span className="number">20</span>
                    <span className="logo">
                      <img src="./src/assets/images/icons/time-red-icon.svg" alt="icon" />
                    </span>  
                  </div>
                  <p className="description">Quick Fixes</p>
              </div>
              <span className="box-container-border-inbetween"></span>
              <div className="box-container__bottom">
                <div className="links">
                  <a href="">View Quick Fixes<i className="fa fa-chevron-right icon"></i></a>
                </div>
              </div>
            </div>
          </div>

          <div className="cell small-12 medium-6 xmedium-6 large-4 xlarge-3 mb--24">
            <div className="box-container white">
              <div className="box-container__top">
                  <div className="update-details">
                    <span className="number">
                      {dataLoading ? (
                        <span className="skeleton-line skeleton-line--short"></span>
                      ) : (
                        siteTotals.totalAssets
                      )}
                    </span>
                    <span className="logo">
                      <img src="./src/assets/images/icons/bolt-red-icon.svg" alt="icon" />
                    </span>  
                  </div>
                  <p className="description">Assets</p>
              </div>
              <span className="box-container-border-inbetween"></span>
              <div className="box-container__bottom">
                <div className="links">
                  <Link to="/assets">View Assets<i className="fa fa-chevron-right icon"></i></Link>
                </div>
              </div>
            </div>
          </div>

          <div className="cell small-12 medium-6 xmedium-6 large-4 xlarge-3 mb--24">
            <div className="box-container current-balance">
              <ul className="current-balance__lists">
                <li><span className="title">Current Balance</span></li>
                <li>
                  <div className="balance-details">
                    <span className="sub-title">Budget</span>
                      {dataLoading ? (
                        <span className="skeleton-line skeleton-line--short"></span>
                      ) : (
                        <span className="number">&#163;{formatNumberUK(siteTotals.budget)}</span>
                      )}
                    
                  </div>
                </li>
                <li>
                  <div className="balance-details">
                    <span className="sub-title">Spend</span>
                    {dataLoading ? (
                        <span className="skeleton-line skeleton-line--short"></span>
                      ) : (
                        <span className="number">&#163;{formatNumberUK(siteTotals.cost)}</span>
                      )}
                  </div>
                </li>
                <li>
                  <div className="balance-details">
                    <span className="sub-title">Balance</span>
                    <span className="number">
                      {dataLoading ? (
                        <span className="skeleton-line skeleton-line--short"></span>
                      ) : (
                        <strong>&#163;{formatNumberUK(balance)}</strong>
                      )}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <StatusCardBlock 
          sitesData={filteredSites}
          isLoading={dataLoading}
        />

      </div>
  )
}                                           

export default DashboardPage