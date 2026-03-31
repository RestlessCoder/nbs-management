import { createDataProvider, type CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "../constants"
import type { ListResponse } from "../types";

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

          buildQueryParams: async ({ pagination, filters, sorters }) => {

            const { currentPage = 1, pageSize = 10 } = pagination ?? {};

            const searchFilter = filters?.find((f) => "field" in f && f.field === "search");

            const activeSorter = sorters?.[0];

            const activeFilters = filters?.reduce((acc, filter) => {
                if ("field" in filter && filter.value !== undefined && filter.value !== null) {
                    return { ...acc, [filter.field]: filter.value };
                }
                return acc;
            }, {}) ?? {};

            return {
                page: currentPage,
                limit: pageSize,
                search: searchFilter && "value" in searchFilter ? searchFilter.value : "",
                _sort: activeSorter?.field,
                _order: activeSorter?.order,
                ...activeFilters,
            };
        },

    
        mapResponse: async (response) => {
            const clonedResponse = response.clone(); 
            const payload: ListResponse = await clonedResponse.json();

            return payload.data ?? []   
        },

        getTotalCount: async (response) => {
            const clonedResponse = response.clone(); 
            const payload: ListResponse = await clonedResponse.json();

            return payload.pagination?.totalItems ?? payload.data?.length ?? 0;
        }
    }
}

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider }