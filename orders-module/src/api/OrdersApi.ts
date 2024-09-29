import { ApiResponseType } from 'Types/api';
import { AgreementsType } from 'Types/order';
import fetcher from 'Utils/fetcher';

type RequestOrderStartType = {
    templatePackageId?: string;
    subscriberId?: string;
    tenantId?: string;
    organizationId?: string;
    redirectUrl?: string;
    phoneNumber?: string;
};

type RequestOrderStartV2Type = RequestOrderStartType & {
    agreementParameters: AgreementsType;
};

type RequestOrderCompleteType = {
    orderId: string;
    agreementId: string;
};

type OrderResponseType = {
    url: string;
};

type OrderV2ResponseType = {
    terminalRedirectUrl: string;
};

export const orderStart = (
    body: RequestOrderStartType
): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, RequestOrderStartType>({
        method: 'POST',
        url: '/sdk/orderstart',
        body,
    });

export const orderStartV2 = (
    body: RequestOrderStartV2Type
): Promise<OrderV2ResponseType> =>
    fetcher<OrderV2ResponseType, RequestOrderStartV2Type>({
        method: 'POST',
        url: '/sdk/v2/orderstart',
        body,
    }) as Promise<OrderV2ResponseType>;

export const orderComplete = (
    body: RequestOrderCompleteType
): Promise<OrderResponseType> =>
    fetcher<OrderResponseType, RequestOrderCompleteType>({
        method: 'POST',
        url: '/sdk/ordercomplete',
        body,
    });

export const paymentTypes = (): Promise<OrderResponseType> =>
    fetcher<OrderResponseType>({
        method: 'GET',
        url: '/sdk/paymenttypes',
    });
