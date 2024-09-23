export enum HttpStatusCode {
    UNAUTHORIZED = 401,
}

export const BASE_API = process.env.CDN_API_URL ?? '/';
