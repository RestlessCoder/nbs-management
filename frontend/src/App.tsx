import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Outlet, 
  Navigate
} from "react-router";
import './App.css'

import DashboardPage from "./pages/DashboardPage.tsx";
import AssetsList from "./resources/assets/list.tsx";
import JobsList from "./resources/jobs/list.tsx";
import SitesList from "./resources/sites/list.tsx";
import UsersList from "./resources/users/list.tsx";

import SidebarNav from "./components/SidebarNav.tsx";
import TopSearchBar from "./components/TopSearchBar.tsx";

import { Refine, Authenticated } from "@refinedev/core";
import routerProvider, { 
  UnsavedChangesNotifier, 
  DocumentTitleHandler 
} from "@refinedev/react-router";

import { dataProvider } from "./providers/data.ts";
import { authProvider } from "./providers/auth.ts";

import LoginPage from "./pages/Login.tsx";
import RegisterPage from "./pages/Register.tsx";

const AppLayout = () => {
  return (
    <main className="page-body">
        <div className="block-container">
          <SidebarNav />
          <div className="main-body-right">
            <TopSearchBar />
            <Outlet />
          </div>
        </div>
    </main>
  )
};
function App() {

  return (
    <BrowserRouter>
    <Refine
          dataProvider={dataProvider}
          routerProvider={routerProvider}
          authProvider={authProvider}
            resources={[
              {
                name: "dashboard",
                list: "/",
                meta: { 
                  label: "Dashboard", 
                  icon: <svg className="dashbord-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
                          <g transform="translate(-40 -18)"><path d="M34.5,12.5h-19a3,3,0,0,0-3,3v19a3,3,0,0,0,3,3h19a3,3,0,0,0,3-3v-19A3,3,0,0,0,34.5,12.5ZM15.5,35a.5.5,0,0,1-.5-.5V23.75h6.25V35ZM35,34.5a.5.5,0,0,1-.5.5H23.75V23.75H35ZM15,21.25V15.5a.5.5,0,0,1,.5-.5h19a.5.5,0,0,1,.5.5v5.75Z"
                              transform="translate(27.5 5.5)" fill="#fff" className="dashbord-icon" /></g>
                        </svg>
              }
              },
              {
                name: "jobs",
                list: "/jobs",
                meta: { 
                  label: "Jobs", 
                  icon: <svg className="dashbord-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 20 25">
                          <g transform="translate(-12.5 -12.5)"><path d="M29.5,15h-2V13.75a1.25,1.25,0,0,0-2.5,0V15H20V13.75a1.25,1.25,0,0,0-2.5,0V15h-2a3,3,0,0,0-3,3V34.5a3,3,0,0,0,3,3h14a3,3,0,0,0,3-3V18A3,3,0,0,0,29.5,15ZM30,34.5a.5.5,0,0,1-.5.5h-14a.5.5,0,0,1-.5-.5V18a.5.5,0,0,1,.5-.5h2v1.25a1.25,1.25,0,0,0,2.5,0V17.5h5v1.25a1.25,1.25,0,0,0,2.5,0V17.5h2a.5.5,0,0,1,.5.5Z"
                          fill="#fff" className="dashbord-icon" /><path d="M26.246,22.5h-7.5a1.25,1.25,0,0,0,0,2.5h7.5a1.25,1.25,0,1,0,0-2.5Z" fill="#fff" className="dashbord-icon"/><path d="M23.749,27.5h-5a1.25,1.25,0,0,0,0,2.5h5a1.25,1.25,0,0,0,0-2.5Z" fill="#fff" className="dashbord-icon"/></g>
                        </svg>
                }
              }, {
                name: "assets",
                list: "/assets",
                meta: { 
                  label: "Assets", 
                  icon: <svg className="dashbord-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="24.999" viewBox="0 0 25 24.999"><path d="M26.75,55.5a1.25,1.25,0,0,1-1.237-1.427l1.046-7.323H16.75a1.25,1.25,0,0,1-.925-2.091l12.491-13.75a1.25,1.25,0,0,1,2.163,1.017l-1.04,7.324H39.25a1.25,1.25,0,0,1,.925,2.091l-12.5,13.75A1.252,1.252,0,0,1,26.75,55.5ZM19.574,44.25H28a1.25,1.25,0,0,1,1.237,1.427l-.674,4.72,7.861-8.647H28a1.25,1.25,0,0,1-1.237-1.426l.67-4.724Z"
                        transform="translate(-15.5 -30.501)" fill="#fff" className="dashbord-icon"/>
                        </svg>
                }
              }, {
                name: "sites",
                list: "/sites",
                meta: { 
                  label: "Sites", 
                  icon: <svg className="dashbord-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25"><g transform="translate(-12.5 -12.5)"><path d="M25,15.008A7.5,7.5,0,0,1,32.492,22.5v.858a7.443,7.443,0,0,1-2.195,5.3l-5.3,5.3-5.3-5.3a7.443,7.443,0,0,1-2.195-5.3V22.5A7.5,7.5,0,0,1,25,15.008M25,12.5h0a10,10,0,0,0-10,10v.858a10,10,0,0,0,2.929,7.071L25,37.5l7.071-7.071A10,10,0,0,0,35,23.358V22.5a10,10,0,0,0-10-10Z" fill="#fff" className="dashbord-icon"/>
                          <path d="M25,20a2.5,2.5,0,1,1-2.5,2.5A2.5,2.5,0,0,1,25,20m0-2.5a5,5,0,1,0,5,5,5,5,0,0,0-5-5Z" fill="#fff" className="dashbord-icon" /><path d="M18.965,35H13.75a1.25,1.25,0,0,0,0,2.5h7.715Z" fill="#fff" className="dashbord-icon" /><path d="M36.25,35H31.035l-2.5,2.5H36.25a1.25,1.25,0,0,0,0-2.5Z" fill="#fff" className="dashbord-icon"/></g>
                        </svg>
                }
              }, {
                name: "users",
                list: "/users",
                meta: { 
                  label: "Users", 
                  icon: <svg className="dashbord-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="22.5" viewBox="0 0 25 22.5"><g transform="translate(-12.5 -15)"><path d="M21.25,27.5A6.25,6.25,0,1,0,15,21.25,6.257,6.257,0,0,0,21.25,27.5Zm0-10a3.75,3.75,0,1,1-3.75,3.75A3.755,3.755,0,0,1,21.25,17.5Z" fill="#fff" className="dashbord-icon"/>
                          <path d="M25.75,28.75h-9A4.254,4.254,0,0,0,12.5,33v3.25a1.25,1.25,0,0,0,2.5,0V33a1.752,1.752,0,0,1,1.75-1.75h9A1.752,1.752,0,0,1,27.5,33v3.25a1.25,1.25,0,0,0,2.5,0V33A4.254,4.254,0,0,0,25.75,28.75Z" fill="#fff" className="dashbord-icon"/><path d="M28.75,17.5a3.75,3.75,0,0,1,0,7.5,1.25,1.25,0,0,0,0,2.5,6.25,6.25,0,0,0,0-12.5,1.25,1.25,0,0,0,0,2.5Z" fill="#fff" className="dashbord-icon"/><path d="M33.25,28.75a1.25,1.25,0,0,0,0,2.5A1.752,1.752,0,0,1,35,33v3.25a1.25,1.25,0,0,0,2.5,0V33A4.254,4.254,0,0,0,33.25,28.75Z" fill="#fff" className="dashbord-icon"/>
                        </g></svg>
                }
              }
            ]}
        >
        <Routes>
            <Route element={
                <Authenticated 
                    redirectOnFail="/login"
                    key={""}
                >
                    <AppLayout />
                </Authenticated>
              }
            > 
              
              {/* Protected Routes */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/assets" element={<AssetsList/>} />
              <Route path="/sites" element={<SitesList />} />
              <Route path="/users" element={<UsersList />} />
            </Route>
            
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <Authenticated fallback={<LoginPage />} key={""}>
                  <Navigate to="/" />
                </Authenticated>
             }
            />

            {/* Protected Routes for Admin */}
            <Route
              path="/register"
              element={
                <Authenticated fallback={<RegisterPage />} key={""}>
                  <Navigate to="/" />
                </Authenticated>
             }
            />
              
            <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>      
        <UnsavedChangesNotifier />
        <DocumentTitleHandler />
      </Refine>
    </BrowserRouter>
  )
}

export default App
