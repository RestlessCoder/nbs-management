import { useTable, useParsed, useGetIdentity, useMany, Link, CanAccess } from "@refinedev/core"
import { useEffect, useMemo, useState } from "react";
import { ResendVerification } from "../../components/ResendVerification";
import DeleteModal from "../../components/DeleteModal";
import axios from "axios";
import { type User } from "../../types";
import EditModal from "../../components/EditModal";

const UserList = () => {      
    const { data: user } = useGetIdentity();
    const { params } = useParsed();
    const searchFromUrl = params?.search;
    const [tableLoading, setTableLoading] = useState(true);

    const [showDelete, setShowDelete] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const openDelete = (user : User) => { setSelectedUser(user); setShowDelete(true); }
    const closeDelete = () => { setSelectedUser(null); setShowDelete(false); }

    const openEdit = () => { setShowEdit(true); }
    const closeEdit = () => { setShowEdit(false); }
    
    const handleDelete = async (id: number) => {
        console.log("Attempting to delete user with ID:", id);
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_BASE_URL}/users/${id}`, 
                { withCredentials: true }
            );

            setShowDelete(false);
            closeDelete();

            // Refetch the user list after deletion
            refetch();
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

    /* TODO - Edit user functionality */ 
    const handleEdit = async (id: number) => {
        try {
            setShowEdit(false);
            closeEdit();
        } catch (err) {
            console.error("Error editing user:", err);
        }
    }

    const { 
        result: { data: userData, total },
        tableQuery: { isError , isLoading, error, refetch },
        currentPage,
        setCurrentPage,
        pageSize,
        setFilters
    } = useTable({
        resource: "users",
        pagination: {
            mode: "server",
            currentPage: 1,
            pageSize: 10,
        },
        filters: {
            permanent: [
                {
                    field: "role",
                    operator: "ne",
                    value: "ADMIN",
                }
            ],
        },
    });
    
    const siteIds = useMemo(() => {
        const ids = userData?.map((user) => user.siteId) ?? [];
        return [...new Set(ids)]; // Removes duplicates
    }, [userData]);
    
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
    }, [sitesData]);         // SEARCH SYNC FROM URL TopBar component
    
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

     // 1. Calculate the real page count
    const totalCount = total ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // 2. Create an array [1, 2, 3...] for the buttons
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const allUsers = useMemo(() => {
        if (!userData) return [];
        
        // Client-side fallback: Filter out any admins that the server forgot to hide
        let list = userData.filter(u => u.role !== "ADMIN");

        // Move me to top logic
        const myIndex = list.findIndex((u) => u.id === user?.id);
        if (myIndex > -1) {
            const [me] = list.splice(myIndex, 1);
            list.unshift(me);
        }
        
        return list;
    }, [userData, user]);

    useEffect(() => {
        // If the API is loading, we are definitely loading
        if (isLoading) {
            setTableLoading(true);
        } else {
            // 2. Once API finishes, wait 2.5 seconds before hiding skeleton
            const timer = setTimeout(() => {
                setTableLoading(false);
            }, 2500); // Change this number to adjust delay (in ms)

            return () => clearTimeout(timer);
        }
    }, [isLoading]);

 
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

    useEffect(() => {
         // If there's an error, we want to stop the loading skeleton immediately
        if (isError) {
            setTableLoading(false);
        }

    }
    , [isError]);

    return (
        <>
            <div className="body-dashboard generic-padding bg--whiteSmoke">
                <section className="jobs-section table-container">
                    <div className="grid-x grid-padding-x">
                        <div className="cell small-12 msmall-6 medium-6 large-8 mb--20">
                            <ul className="navigation__items">
                                <li className="is-active"><a href="">All Users</a></li>
                            </ul>
                        </div>
                        <CanAccess
                            resource="users"
                            action="create"
                            >
                            <div className="cell small-12 msmall-6 medium-6 large-4 text-right mb--20 text-left--xsmall">
                                <Link 
                                    to="/register" 
                                    className="btn new-users btn--primary"
                                    target="_blank" rel="noopener noreferrer"
                                >
                                    New User
                                </Link>
                            </div>
                        </CanAccess>
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

                            {
                                user?.isVerified === true && 

                                <div className="users-table">
                                    <table className="users-table__content">
                                        <thead className="users-table__header">
                                            <tr className="users-table__row">
                                                <th className="users-table__cell">User</th>
                                                <th className="users-table__cell">Site(s)</th>
                                                <CanAccess
                                                    resource="users"
                                                    action="edit"
                                                    params={{ id: user?.id }}
                                                    >
                                                    <th className="users-table__cell">Action</th>
                                                </CanAccess>
                                            </tr>
                                        </thead>
                                        <tbody className="users-table__body">

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
                                                    </tr>

                                                ))
                                                ) : (
                                                    allUsers.map((user) => {

                                                        const site = allSite.find((s) => s.data.id === user.siteId);

                                                        return (
                                                            
                                                            <tr key={user.id}>                           
                                                                <td className="users-table__cell user">
                                                                    <span className="user-image">
                                                                        <img 
                                                                            src={user?.gender === "GUY" ? 
                                                                                `src/assets/images/user-man.svg` : 
                                                                                `src/assets/images/user-girl.svg`}
                                                                            alt={user?.gender && user.gender.toLowerCase() || "user"} />
                                                                    </span>
                                                                    <span className="user-name">{user.name}</span>
                                                                </td>
                                                                <td className="users-table__cell site">
                                                                <span className="box-shadow-block">
                                                                    <span className="text">{site?.data.name}</span>
                                                                    <CanAccess
                                                                        resource="users"
                                                                        action="delete"
                                                                        >
                                                                        <button 
                                                                            className="button-circle-icon button-trash"
                                                                            onClick={() => openDelete(user as User)}
                                                                        >
                                                                            <i className="fas fa-trash-alt"></i>
                                                                        </button>
                            
                                                                    </CanAccess>
                                                                </span>
                                                                </td>
                                                        
                                                                <td className="users-table__cell action">
                                                                    <CanAccess
                                                                        resource="users"
                                                                        action="edit"
                                                                    >   
                                                                        <button className="button-circle-icon button-add">
                                                                            <Link to={`/register`} target="_blank" rel="noopener noreferrer">
                                                                                <i className="fas fa-plus"></i>
                                                                            </Link>
                                                                        </button>
                                                                    </CanAccess>
                                                                    <CanAccess
                                                                        resource="users"
                                                                        action="edit"
                                                                        params={{ id: user.id }}
                                                                        >
                                                                        <button 
                                                                            className="button-circle-icon button-edit"
                                                                            onClick={() => openEdit()}
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
                            }
                        </div>
                    </div>
                </section>
            </div>
                            
            <EditModal 
                show={showEdit}
                entity={selectedUser as User}
                fields={[
                    { name: "name", label: "Name", type: "text" },
                    { name: "image", label: "Role", type: "select", options: [
                        { value: "GUY", label: "GUY" },
                        { value: "GIRL", label: "GIRL" },
                    ]},
                    { name: "siteId", label: "Site", type: "select", options: allSite.map(s => ({ value: String(s.data.id), label: s.data.name })) },
                ]}
                onCancel={() => setShowEdit(false)}
                onConfirm={handleEdit}            
            />
            
            <DeleteModal 
                show={showDelete} 
                entity={selectedUser as User} 
                onCancel={() => setShowDelete(false)} 
                onConfirm={handleDelete} 
            />
        </>
    )
}

export default UserList