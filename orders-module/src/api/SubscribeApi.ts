import fetcher from 'Utils/fetcher';

type CreateSubscriberRequestType = {
    name?: string;
    phoneNumber?: string;
};

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
            'S4-ORDERS-API-KEY': process.env.API_KEY || '',
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
            'S4-ORDERS-API-KEY': process.env.API_KEY || '',
        },
        body,
    }) as Promise<MapSubscriberToUserResponseType>;
