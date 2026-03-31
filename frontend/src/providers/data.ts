import { createDataProvider, type CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "../constants"
import type { ListResponse } from "../types";

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

    
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