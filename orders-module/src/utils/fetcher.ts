import { BASE_API, HttpStatusCode } from 'Enums/api';
import { ApiResponseType } from 'Types/api';

export type Method =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH';

type Fetcher<T> = {
    url: string;
    params?: Record<string, string | string[]>;
    method?: Method;
    headers?: HeadersInit;
    body?: T;
};

function createHeader<T>(options: Fetcher<T>): Fetcher<T> {
    const accessToken = localStorage.get('authTokenKey') || '';

    const headers = new Headers({
        accept: 'application/json',
        ...(accessToken && {
            Authorization: `Bearer ${accessToken}`,
        }),
        ...options.headers,
    });

    if (!(options.body instanceof FormData)) {
        headers.append('Content-Type', 'application/json');
    }

    return { method: 'GET', ...options, headers };
}

async function fetcher<ResponseType, BodyType = void>(
    options: Fetcher<BodyType>
): Promise<ApiResponseType<ResponseType>> {
    const { url, method, headers, body, params } = createHeader(options);

    const endpoint = new URL(`${BASE_API}${url}`);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((v) => endpoint.searchParams.append(key, v));
                return;
            }
            endpoint.searchParams.append(key, value);
        });
    }

    return new Promise<ApiResponseType<ResponseType>>((resolve, reject) => {
        return fetch(endpoint.toString(), {
            method,
            headers,
            body: body instanceof FormData ? body : JSON.stringify(body),
        })
            .then(async (response) => {
                if (response.status === HttpStatusCode.UNAUTHORIZED) {
                    localStorage.removeItem('authTokenKey');
                } else {
                    const data = await response?.json();

                    if (response.ok) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                }
            })
            .catch((error) => {
                reject(error?.response);
            });
    });
}

export default fetcher;
