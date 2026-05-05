import type { DeleteModalProps } from "../types";

const DeleteModal = ({ 
    show, 
    entity, 
    onCancel, 
    onConfirm 
}: DeleteModalProps) => {

    if (!show  || !entity ) return null;

    const displayName = 'name' in entity ? entity.name : entity.reference;

    return (
         <div className="modal">
            <div className="modal-content">
                <h3>Confirm Deletion</h3>
                <p>
                    Are you sure you want to delete{" "}
                    <span className="username">                        
                        {displayName}
                    </span>?
                </p>
                <div className="actions">
                <button onClick={onCancel} className="cancel-btn">
                    Cancel
                </button>
                <button 
                    className="confirm-btn"
                    onClick={() => onConfirm(entity.id)} 
                >
                    Yes, Delete
                </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal;