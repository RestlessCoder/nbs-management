import { useState } from "react";
import { treeifyError, z, ZodObject } from "zod";
import type { EditModalProps } from "../types";
import { formatEnum, getOptionClass } from "../utils";

const EditModal = ({ 
    mode,
    show, 
    entity,
    fields,
    error,
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
        } else if (field.type === "number" && field.name !== "quickFixes") {
            schemaShape[field.name] = z.preprocess(
                (val) => {
                    if (val === "" || val === undefined || val === null) return null;
                    if (!isNaN(Number(val))) return Number(val);
                    return val;
                },
                z.number().nullable().refine((val) => val !== null, { message: `${field.label} is required` })
            );
        }
        if (field.type === "select" && field.options) {
           schemaShape[field.name] = z.preprocess(
                (val) => {
                    if (val === "" || val === undefined || val === null) return null;

                    if (!isNaN(Number(val))) return Number(val);

                    return val;
                },
                    z.union([
                    z.string(),
                    z.number()
                ])
                .nullable()
                .refine(
                    (val) =>
                        val !== null &&
                        field.options!.some((opt) => opt.value === String(val)),
                    { message: `${field.label} is required` }
                )
            );
        }
        if (field.name === "quickFixes") {
            schemaShape[field.name] = z.preprocess(
            (val) => val === "" ? null : Number(val),
                z.number({ message: "Quick Fixes must be a number" })
                .int("Must be an integer")
                .min(0, "Number cannot be negative")
                .max(5, "Max number is 5")
                .nullable()
            ) as unknown as z.ZodNullable<z.ZodNumber>
        }
    });

    const dynamicSchema: ZodObject<any> = z.object(schemaShape);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    const renderSelect = (field : any) => (
        <div className="grid-x grid-padding-x">  
            <div className="cell small-12"> 
                <label htmlFor={field.name} className="generic-label generic-label--edit">
                    {field.label}
                </label>
                <select
                    id={field.name}
                    className={`generic-select ${field.name === "status" && `custom-select ${getOptionClass(formData[field.name])}`}`}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                >
                <option value={""}>Select {field.label}</option>
                {field.options?.map((option: { value: string; label: string; colorOptions?: string }, i: number) => (
                    <option 
                        key={option.value + i} 
                        className={field.name === "status" ? option.colorOptions : ""}
                        value={option.value}>
                        {field.name === "type"  || field.name === "status" ? formatEnum(option.label) : option.label}
                    </option>
                ))}
                </select>
                {validationErrors[field.name] && (
                    <p className="error-text">{validationErrors[field.name][0]}</p>
                )}
            </div>
        </div>
    );

    const renderInput = (field : any) => (
        <div className="grid-x grid-padding-x">
            <div className="cell small-12">
                <label htmlFor={field.name} className="generic-label generic-label--edit">
                    {field.label}
                </label>
                <input
                    id={field.name}
                    className="generic-input generic-input--edit"
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] ?? 0}
                    onChange={handleChange}
                />
                {validationErrors[field.name] && (
                    <p className="error-text">{validationErrors[field.name][0]}</p>
                )}
            </div>
        </div>
    );

    return (
          <div className={`modal ${show ? "show" : ""}`}>
            <div className="modal-content modal-content--edit"> 
                <div className="grid-x grid-padding-x">
                    <div className="cell small-12">
                        {
                            displayName && <h4>Editing: {displayName}</h4>
                        }
                        {  
                            error && 
                                <p className="error-text" style={{ marginBottom: "0" }}>
                                    {error}
                                </p>
                        }
                    </div>
                </div>
                <form onSubmit={(e) => e.preventDefault()}>
                    {
                        fields.map((field) => {
                            if (field.type === "select" && field.name !== "year") {
                                return <div key={field.name}>{renderSelect(field)}</div>;
                            } else if (field.type === "text" || field.type === "number" && field.name !== "quickFixes") {
                                return <div key={field.name}>{renderInput(field)}</div>;
                            } else if (field.type === "textarea") {
                                return (
                                    <div className="grid-x grid-padding-x">
                                        <div className="cell small-12">                                       
                                            <label htmlFor={field.name} className="generic-label generic-label--edit">Description</label>
                                            <textarea 
                                                className="generic-textarea" 
                                                id={field.name}
                                                name={field.name}
                                                value={formData[field.name] ?? 0}
                                                onChange={handleChange}
                                            ></textarea>     
                                            {validationErrors[field.name] && (
                                                <p className="error-text">{validationErrors[field.name][0]}</p>
                                            )}                               
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })
                    }
                    {
                        (fields.some(f => f.name === "year") || fields.some(f => f.name === "quickFixes")) && (
                            <div className="grid-x grid-padding-x">
                                {fields.find(f => f.name === "year") && (
                                    <div className="cell small-6">
                                        {renderSelect(fields.find(f => f.name === "year"))}
                                    </div>
                                )}
                                {fields.find(f => f.name === "quickFixes") && (
                                    <div className="cell small-6">
                                        {renderInput(fields.find(f => f.name === "quickFixes"))}
                                    </div>
                                    
                               )}
                            </div>
                        )
                    }
                    <div className="grid-x grid-padding-x">
                        <div className="cell small-12">
                            <button 
                                className="btn btn--primary btn--report-custom mt--32"
                                onClick={handleSubmit}
                                type="button"
                                >
                                Submit
                            </button>
                        </div>
                    </div>
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