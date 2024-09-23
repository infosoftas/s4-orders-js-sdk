import { HttpStatusCode } from 'Enums/api';

export interface ApiResponseType<T> {
    status: HttpStatusCode;
    text: string;
    error: string;
    code: HttpStatusCode;
    timestamp: string;
    data: T;
    query: string;
}
