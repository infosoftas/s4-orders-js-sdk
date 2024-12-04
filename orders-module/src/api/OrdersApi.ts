import { CreateSubscriberRequestType } from '../types/api';
import { AgreementsType } from '../types/order';
import fetcher from '../utils/fetcher';

type RequestOrderStartType = {
    subscriberId?: string;
    subscriptionPlan?: {
        organizationId?: string;
        templateSubscriptionPlanId?: string;
    };
    paymentAgreement: AgreementsType;
    invoiceContact?: CreateSubscriberRequestType;
    orderReference?: string;
};

type OrderResponseType = {
    terminalRedirectUrl: string;
    id: string;
};

export const orderStart = (
    body: RequestOrderStartType
): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, RequestOrderStartType>({
        method: 'POST',
        url: '/order',
        headers: {
            'S4-ORDERS-API-KEY':
                sessionStorage.getItem('sdk_api_key') ||
                process.env.API_KEY ||
                '',
        },
        body,
    }) as Promise<OrderResponseType>;

export const orderComplete = (id: string): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, null>({
        method: 'POST',
        url: `/order/${id}/complete`,
        headers: {
            'S4-ORDERS-API-KEY':
                sessionStorage.getItem('sdk_api_key') ||
                process.env.API_KEY ||
                '',
        },
        body: null,
    }) as Promise<OrderResponseType>;

export const orderDelete = (id: string): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, null>({
        method: 'DELETE',
        url: `/order/${id}`,
        headers: {
            'S4-ORDERS-API-KEY':
                sessionStorage.getItem('sdk_api_key') ||
                process.env.API_KEY ||
                '',
        },
        body: null,
    }) as Promise<OrderResponseType>;
