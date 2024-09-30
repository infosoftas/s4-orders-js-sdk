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
    GenerateSubscriberContact?: boolean;
    CustomerPhoneNumber?: string;
    MerchantAgreementUrl: string;
    MerchantRedirectUrl: string;
};

export type SwedbankPay = {
    CancelUrl: string;
    CompleteUrl: string;
    CallbackUrl: string;
    Culture?: string;
};

export type AgreementsType = {
    PaymentMethod: string;
    VippsMobilePay?: VippsMobilePay;
    SwedbankPay?: SwedbankPay;
};
