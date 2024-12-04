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

export type CreateSubscriberRequestType = {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    addressLines?: string[];
    zip?: string;
    careOf?: string;
    buyerReference?: string;
};
