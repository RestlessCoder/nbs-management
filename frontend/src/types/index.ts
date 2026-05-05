export type Assets = {
    id: number;
    name: string;
    type: string;
    site: string;
    siteId: number;
    manufacturer: string;
    year: number;
    quickFixes: number;
    createdAt: string;
    updatedAt: string;
}

export type Sites = {
    id: number;
    name: string;
    code: string;
    location: string;
    entity: string;
    category: string;
    createdAt: string;
    budget: number;
    isFavorite: boolean;
    updatedAt: string;
}

export type Jobs = {
    id: number;
    siteId: number;
    site: string;
    assetId: number;
    asset: string;
    reference: string;
    description: string;   
    cost: number;
    status: "string";
    quickFixes: number;
}

export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    }
}

export type User = {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "USER";
    siteId: number;
    gender: "GUY" | "GIRL";
    isVerified: boolean;
}

export type DeleteModalProps = {
    show: boolean;
    entity: EntityType | null;
    onCancel: () => void;
    onConfirm: (id: number) => void;
}

export type FieldConfig = {
    name: string;
    label: string;
    type: "text" | "select";
    options?: { value: string; label: string }[]; // For select fields
}

export type EditModalProps = {
    show: boolean;
    entity: EntityType | null;
    fields: FieldConfig[];
    onCancel: () => void;
    onConfirm: (updatedEntity: any) => void;
}

export type ListViewBlockProps = {
    jobData: Jobs[];
    allSite: any;
    allAssets: any;
    statusOptions: any;
    deleteJob: (job: Jobs) => void;
}   

export type DynamicNavFilterProps = {
    resource: string;
    activeValue?: string;
    onSortChange?: (field: string) => void;
}

export type JobStatusSelectProps = {
    job: any;
    statusOptions: object[];
    onChange?: (newStatus: string) => void;
    canEdit: boolean;
}

type EntityType = Assets | User | Sites | Jobs;
