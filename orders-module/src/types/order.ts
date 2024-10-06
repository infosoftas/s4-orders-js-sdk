import { PaymentMethodEnum } from 'Enums/general';

export type CompleteOrderParamsType = {
    orderId: string;
    agreementId: string;
};

export type OrderFormInputsType = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    paymentMethod?: PaymentMethodEnum;
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
