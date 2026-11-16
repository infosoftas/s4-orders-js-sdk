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
    organizationNumber?: string;
    invoiceAddressSelection?: boolean;
    orderReference?: string;
    invoiceName?: string;
    invoiceEmail?: string;
    invoicePhoneNumber?: string;
    invoiceCountry?: string;
    invoiceCity?: string;
    invoiceAddress?: string;
    invoiceZip?: string;
    invoiceCareOf?: string;
    invoiceBuyerReference?: string;
    gln?: string;
    cvr?: string;
    termsAccept?: boolean;
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

export type Mollie = {
    accountId?: string;
    returnUrl: string;
    cancelUrl?: string;
    language?: string;
};

export type AgreementsType = {
    paymentProvider: PaymentMethodEnum;
    vippsMobilePay?: VippsMobilePay;
    swedbankPay?: SwedbankPay;
    mollie?: Mollie;
};

export type OrderInfoType = {
    subscriberId: string;
    paymentMethod: string;
    orderId: string;
};

export type OrderStatusResponseType = {
    id: string;
    status: string;
    orderCreated?: string | null;
    orderCompleted?: string | null;
    orderCancelled?: string | null;
};

export type OrderCompletionEventType = {
    orderId: string;
    orderInfo: OrderInfoType | null;
};

export type OrderCompletionDelayedEventType = OrderCompletionEventType & {
    reason: 'timeout' | 'statusUnavailable';
};

export type OrderCompletionFailedEventType = OrderCompletionEventType & {
    status: 'Cancelled' | 'Rejected';
};

export type CompleteOrderParamsType = {
    orderId: string;
    agreementId: string;
    orderInfo: OrderInfoType | null;
    paymentMethod?: PaymentMethodEnum | null;
};
