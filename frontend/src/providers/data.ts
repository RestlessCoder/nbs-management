import { createDataProvider, type CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "../constants"
import type { ListResponse } from "../types";

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

        buildQueryParams: async ({ pagination, filters, sorters }) => {

            const { currentPage = 1, pageSize = 10 } = pagination ?? {};

            const query: Record<string, any> = {
                page: currentPage,
                limit: pageSize,
            };

            // Flatten filters into simple query params
            filters?.forEach((filter) => {
                if ("field" in filter && filter.value !== undefined && filter.value !== null) {
                    query[filter.field] = filter.value;
                }
            });

            // Handle sorting
            if (sorters && sorters.length > 0) {
                query._sort = sorters[0].field;
                query._order = sorters[0].order;
            }

           return query;
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



const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
    credentials: "include", 
});

export { dataProvider }