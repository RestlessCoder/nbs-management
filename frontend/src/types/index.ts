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

export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    }
}

export type DynamicNavFilterProps = {
    resource: string;
    activeValue?: string;
    onSortChange?: (field: string) => void;
}
