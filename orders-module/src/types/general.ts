import { PaymentMethodEnum } from 'Enums/general';
import { OrderFormInputsType } from './order';

declare global {
    interface Window {
        sdkOrderCallback: () => void;
    }
}

export type OrderFormFiledType = {
    name: string;
    required?: boolean;
    readOnly?: boolean;
    label?: string;
};

export type PaymentMethodOptionsType = {
    [key in PaymentMethodEnum]: {
        generateSubscriberContact?: boolean;
        accountId?: string;
        orderFormFields: OrderFormFiledType[];
    };
};

export type ConfigType = {
    domElementId: string;
    moduleTitle?: string;
    templatePackageId: string;
    subscriberId: string;
    userId: string;
    identityProviderId: string;
    organizationId: string;
    apiKey?: string;
    apiUrl?: string;
    redirectUrl?: string;
    showIframe?: boolean;
    availablePaymentMethods?: { label: string; value: PaymentMethodEnum }[];
    paymentMethodsOptions?: PaymentMethodOptionsType;
    language?: string;
    merchantAgreementUrl?: string;
    settings?: {
        successText?: string;
        failureText?: string;
        buttonText?: string;
        orderDefaultValues?: OrderFormInputsType;
        paymentMethodLabel?: string;
        errorReqMsg?: string;
        errorInvalidEmailMsg?: string;
        errorInvalidPhoneMsg?: string;
    };
};
