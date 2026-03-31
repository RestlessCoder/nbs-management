import { createDataProvider, type CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "../constants"
import type { ListResponse } from "../types";

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

          buildQueryParams: async ({ pagination }) => {

            const { currentPage = 1, pageSize = 10 } = pagination ?? {};

            return {
                page: currentPage,
                limit: pageSize,
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