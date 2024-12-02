import { PaymentMethodEnum } from '../enums/general';

export type OrderFormInputsType = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    paymentMethod?: PaymentMethodEnum;
    country?: string;
    city?: string;
    address?: string;
    zip?: string;
    careOf?: string;
};

export type VippsMobilePay = {
    phoneNumber?: string;
    merchantRedirectUrl: string;
    merchantAgreementUrl: string;
    generateSubscriberContact?: boolean;
    accountId?: string;
};

export type SwedbankPay = {
    accountId?: string;
    completeUrl: string;
    cancelUrl: string;
    language?: string;
};

export type AgreementsType = {
    paymentProvider: PaymentMethodEnum;
    vippsMobilePay?: VippsMobilePay;
    swedbankPay?: SwedbankPay;
};

export type OrderInfoType = {
    subscriberId: string;
    paymentMethod: string;
    orderId: string;
};

export type CompleteOrderParamsType = {
    orderId: string;
    agreementId: string;
    orderInfo: OrderInfoType | null;
    paymentMethod?: PaymentMethodEnum | null;
};
