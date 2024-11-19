import { HttpStatusCode } from '../enums/api';

export interface ApiResponseType<T> {
    status: HttpStatusCode;
    text: string;
    error: string;
    code: HttpStatusCode;
    timestamp: string;
    data: T;
    query: string;
    url: string;
}
