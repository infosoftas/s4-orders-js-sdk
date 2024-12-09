import { PaymentMethodEnum } from 'Enums/general';

export type OrderInfoType = {
    subscriberId: string;
    paymentMethod: string;
    orderId: string;
};

export type OrderFormFiledType = {
    name: string;
    required?: boolean;
};

export type OrderFormInputsType = {
    name?: string;
    email?: string;
    phoneNumber?: string;
    paymentMethod?: PaymentMethodEnum;
    country?: string;
    city?: string;
    address?: string;
    zip?: string;
};

export type PaymentMethodOptionsType = {
    [key in PaymentMethodEnum]: {
        generateSubscriberContact?: boolean;
        accountId?: string;
        orderFormFields?: OrderFormFiledType[] | never[];
    };
};

export type ConfigType = {
    domElementId: string;
    moduleTitle?: string;
    apiKey: string;
    apiUrl: string;
    templatePackageId: string;
    subscriberId: string;
    userId: string;
    identityProviderId: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    availablePaymentMethods?: { label: string; value: PaymentMethodEnum }[];
    paymentMethodsOptions?: PaymentMethodOptionsType;
    language?: string;
    merchantAgreementUrl?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFiledType[] | never[];
    };
    settings?: {
        successText?: string;
        failureText?: string;
        submitButtonText?: string;
        backButtonText?: string;
        verifyButtonText?: string;
        organizationNumberLabel?: string;
        glnLabel?: string;
        orderDefaultValues?: OrderFormInputsType;
        paymentMethodLabel?: string;
        errorReqMsg?: string;
        errorInvalidEmailMsg?: string;
        errorInvalidPhoneMsg?: string;
    };
};
