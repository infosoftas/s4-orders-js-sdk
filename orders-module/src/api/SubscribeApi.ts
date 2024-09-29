import { ApiResponseType } from 'Types/api';
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
        url: '/sdk/subscriber',
        body,
    }) as Promise<CreateSubscriberResponseType>;
