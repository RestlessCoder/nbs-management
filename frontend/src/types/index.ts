export type ListResponse<T = unknown> = {
    data?: T[];
    pagination?: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    }
}
