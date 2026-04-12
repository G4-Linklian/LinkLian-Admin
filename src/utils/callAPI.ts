// utils/apiClient.ts

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
    method: RequestMethod;
    body?: any[];
    from: string;
}

// Helper function to build query string from object
function buildQueryString(params: Record<string, any>): string {
    const query = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    return query ? `?${query}` : '';
}

export async function fetchDataApi(
    method: string, 
    endpoint: string, 
    body: Record<string, any> | FormData = {}
): Promise<any> {
    const urls = process.env.NEXT_PUBLIC_BASE_URL;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;


    if (!urls) {
        throw new Error('BACKEND_PATH environment variable is not set');
    }

    try {
        let url = `${urls}${basePath}/${endpoint}`;
        
        // For GET requests, convert body to query parameters
        const isFormData = body instanceof FormData;

        if (method === 'GET' && !isFormData && Object.keys(body).length > 0) {
            url += buildQueryString(body as Record<string, any>);
        }

        const headers: Record<string, string> = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const requestBody = method === 'GET'
            ? undefined
            : isFormData
                ? body
                : JSON.stringify(body);

        const response = await fetch(url, {
            method,
            headers,
            body: requestBody,
        });

        const text = await response.text();
        try {
            const data = JSON.parse(text);
            return data;
        } catch (err) {
            console.error("Server response is not JSON:", text);
            throw new Error(`Invalid JSON: ${text}`);
        }
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
