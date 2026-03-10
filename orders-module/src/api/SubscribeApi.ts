import fetcher from '../utils/fetcher';
import { CreateSubscriberRequestType } from '../types/api';

type CreateSubscriberResponseType = {
    id: string;
};

export const createSubscriber = (
    body: CreateSubscriberRequestType
): Promise<CreateSubscriberResponseType> =>
    fetcher<CreateSubscriberResponseType, CreateSubscriberRequestType>({
        method: 'POST',
        url: '/subscriber',
        headers: {
            'S4-ORDERS-API-KEY': sessionStorage.getItem('sdk_api_key') || '',
        },
        body,
    }) as Promise<CreateSubscriberResponseType>;
