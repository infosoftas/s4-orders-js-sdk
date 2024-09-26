import { ApiResponseType } from 'Types/api';
import fetcher from 'Utils/fetcher';

type RequestOrderStartType = {
    templatePackageId?: string;
    subscriberId?: string;
    tenantId?: string;
    organizationId?: string;
    redirectUrl?: string;
    phoneNumber?: string;
};

type RequestOrderCompleteType = {
    orderId: string;
    agreementId: string;
};

type OrderResponseType = {
    url: string;
};

export const orderStart = (
    body: RequestOrderStartType
): Promise<ApiResponseType<OrderResponseType>> =>
    fetcher<OrderResponseType, RequestOrderStartType>({
        method: 'POST',
        url: '/sdk/orderstart',
        body,
    });

export const orderComplete = (
    body: RequestOrderCompleteType
): Promise<ApiResponseType<OrderResponseType>> =>
    fetcher<OrderResponseType, RequestOrderCompleteType>({
        method: 'POST',
        url: '/sdk/ordercomplete',
        body,
    });

export const paymentTypes = (): Promise<ApiResponseType<OrderResponseType>> =>
    fetcher<OrderResponseType>({
        method: 'GET',
        url: '/sdk/paymenttypes',
    });
