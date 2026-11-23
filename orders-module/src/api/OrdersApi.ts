import type { CreateSubscriberRequestType } from '../types/api';
import type { AgreementsType, OrderStatusResponseType } from '../types/order';
import fetcher, { getSdkApiKey } from '../utils/fetcher';

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

type OrderCompleteRequestType = {
    userId: string;
    identityProviderId: string;
};

type OrderResponseType = {
    terminalRedirectUrl: string | null;
    id: string | null;
};

export const orderStart = (
    body: RequestOrderStartType
): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, RequestOrderStartType>({
        method: 'POST',
        url: '/order',
        headers: {
            'S4-ORDERS-API-KEY': getSdkApiKey(),
        },
        body,
    }) as Promise<OrderResponseType>;

export const orderComplete = (
    id: string,
    body?: OrderCompleteRequestType,
    signal?: AbortSignal
): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, OrderCompleteRequestType | null>({
        method: 'POST',
        url: `/order/${id}/complete`,
        headers: {
            'S4-ORDERS-API-KEY': getSdkApiKey(),
        },
        body: body || null,
        signal,
    }) as Promise<OrderResponseType>;

export const getOrderStatus = (
    id: string,
    signal: AbortSignal
): Promise<OrderStatusResponseType> =>
    fetcher<OrderStatusResponseType>({
        url: `/order/${encodeURIComponent(id)}`,
        headers: {
            'S4-ORDERS-API-KEY': getSdkApiKey(),
        },
        signal,
        cache: 'no-store',
    }) as Promise<OrderStatusResponseType>;

export const orderDelete = (
    id: string,
    api?: { apiKey: string; apiUrl: string }
): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, null>({
        method: 'DELETE',
        url: `/order/${encodeURIComponent(id)}`,
        baseUrl: api?.apiUrl,
        headers: {
            'S4-ORDERS-API-KEY': api?.apiKey || getSdkApiKey(),
        },
        body: null,
    }) as Promise<OrderResponseType>;

// Cancels the order and its payment, without needing `init`.
export const cancelOrder = async ({
    apiKey,
    apiUrl,
    orderId,
}: {
    apiKey: string;
    apiUrl: string;
    orderId: string;
}): Promise<void> => {
    await orderDelete(orderId, { apiKey, apiUrl });
};
