import { useState } from "react";
import { treeifyError, z, ZodObject } from "zod";
import type { EditModalProps } from "../types";

const EditModal = ({ 
    mode,
    show, 
    entity,
    fields,
    onCancel, 
    onConfirm 
}: EditModalProps) => {

    if (!show  || !entity ) return null;

    const [formData, setFormData] = useState<Record<string, any>>(
        entity ? { ...entity } : {}
    );

    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

    // Build schema dynamically from fields
    const schemaShape: Record<string, any> = {};
    fields.forEach(field => {
        if (field.type === "text") {
            schemaShape[field.name] = z.string().min(1, `${field.label} is required`);
        }
        if (field.type === "select" && field.options) {
            schemaShape[field.name] = z.preprocess(
            (val) => {
                if (val === "") return null;        
                if (!isNaN(Number(val))) return Number(val); 
                return val;                        
            },
            z.union([
                z.string().min(1, { message: `${field.label} is required` }),
                z.number({ message: `${field.label} is required` })
            ])
            .nullable()
            .refine(
                (val) =>
                    val !== null &&
                    field.options!.some((opt) => opt.value === String(val)),
                { message: `${field.label} is required` }
            ));
        }
    });

    const dynamicSchema: ZodObject<any> = z.object(schemaShape);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        const result = dynamicSchema.safeParse(formData);

        if (!result.success) {
            const tree = treeifyError(result.error);
     
            const errors: Record<string, string[]> = {};
            if (tree.properties) {
                for (const key in tree.properties) {
                    const node = tree.properties[key];
                    if (node?.errors && node.errors.length > 0) {
                        errors[key] = node.errors;
                    }
                }
            }

            setValidationErrors(errors);
            return;
        }
        onConfirm(entity.id, result.data);
    };

    const displayName = 'name' in entity ? entity.name : entity.reference;
    
    return (
          <div className={`modal ${show ? "show" : ""}`}>
            <div className="modal-content modal-content--edit"> 
                {
                    displayName && <h4>Editing: {displayName}</h4>
                }

                <form onSubmit={(e) => e.preventDefault()}>
                    {
                        mode === "USER" && (
                            fields.map((field) => {
                            
                                if (field.type === "select") {
                                    return (
                                        <div key={field.name}>
                                            <label 
                                                className="generic-label"
                                                htmlFor={field.name}
                                            >
                                                {field.label}
                                            </label>
                                            <select 
                                                id={field.name}
                                                className="generic-select"
                                                name={field.name}
                                                value={formData[field.name] || ""}
                                                onChange={handleChange}
                                            >   
                                                <option value="">Select {field.label}</option>
                                                {field.options?.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {validationErrors[field.name] && (
                                                <p className="error-text">{validationErrors[field.name][0]}</p>
                                            )}
                                        </div>
                                    )
                                } else if (field.type === "text") {
                                    return (
                                        <div key={field.name}>
                                            <label 
                                                htmlFor={field.name}
                                                className="generic-label"
                                            >
                                                {field.label}
                                            </label>
                                            <input 
                                                id={field.name}
                                                className="generic-input generic-input--edit"
                                                type="text"
                                                name={field.name}
                                                value={formData[field.name] || ""}
                                                onChange={handleChange}
                                            />
                                            {validationErrors[field.name] && (
                                                <p className="error-text">{validationErrors[field.name][0]}</p>
                                            )}
                                        </div>
                                    )
                                }
                            })
                        )

                    }
                    <button 
                        className="btn btn--primary btn--report-custom mt--32"
                        onClick={handleSubmit}
                        type="button"
                        >
                        Submit
                    </button>
                </form>
                    

                <button
                    onClick={() => onCancel()} 
                    className="close-button" data-close aria-label="Close modal" 
                    type="button">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    )
}

export default EditModal;