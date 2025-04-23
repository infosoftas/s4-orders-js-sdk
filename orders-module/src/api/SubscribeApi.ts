import fetcher from '../utils/fetcher';
import { CreateSubscriberRequestType } from '../types/api';

type CreateSubscriberResponseType = {
    id: string;
};

type MapSubscriberToUserRequestType = {
    identityProviderId: string;
    userId: string;
};

type MapSubscriberToUserResponseType = {
    id: string;
};

export const createSubscriber = (
    body: CreateSubscriberRequestType
): Promise<CreateSubscriberResponseType> =>
    fetcher<CreateSubscriberResponseType, CreateSubscriberRequestType>({
        method: 'POST',
        url: '/subscriber',
        headers: {
            'S4-ORDERS-API-KEY':
                sessionStorage.getItem('sdk_api_key') || '',
        },
        body,
    }) as Promise<CreateSubscriberResponseType>;

export const mapSubscriberToUser = (
    id: string,
    body: MapSubscriberToUserRequestType
): Promise<MapSubscriberToUserResponseType> =>
    fetcher<MapSubscriberToUserResponseType, MapSubscriberToUserRequestType>({
        method: 'POST',
        url: `/subscriber/${id}/user`,
        headers: {
            'S4-ORDERS-API-KEY':
                sessionStorage.getItem('sdk_api_key') || '',
        },
        body,
    }) as Promise<MapSubscriberToUserResponseType>;
