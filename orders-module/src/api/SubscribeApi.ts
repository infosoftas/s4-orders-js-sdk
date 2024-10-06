import fetcher from 'Utils/fetcher';

type CreateSubscriberRequestType = {
    name?: string;
    phoneNumber?: string;
};

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
            'S4-ORDERS-API-KEY': process.env.API_KEY || '',
        },
        body,
    }) as Promise<CreateSubscriberResponseType>;
