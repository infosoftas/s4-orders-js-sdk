import { PaymentMethodEnum } from 'Enums/general';

export type OrderFormInputsType = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    paymentMethod?: PaymentMethodEnum;
};

export type VippsMobilePay = {
    phoneNumber?: string;
    name?: string;
    email?: string;
    merchantRedirectUrl: string;
    merchantAgreementUrl: string;
    generateSubscriberContact?: boolean;
    accountId?: string;
};

export type SwedbankPay = {
    phoneNumber?: string;
    name?: string;
    email?: string;
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
};
