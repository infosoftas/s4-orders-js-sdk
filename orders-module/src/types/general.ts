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
};

export type PaymentMethodOptionsType = {
    [key in PaymentMethodEnum]: {
        generateSubscriberContact?: boolean;
        orderFormFields: OrderFormFiledType[];
    };
};

export type ConfigType = {
    domElementId: string;
    companyName: string;
    templatePackageId: string;
    subscriberId: string;
    tenantId: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    availablePaymentMethods?: PaymentMethodEnum[];
    paymentMethodsOptions?: PaymentMethodOptionsType;
    language?: string;
    merchantAgreementUrl?: string;
    settings?: {
        successText?: string;
        failureText?: string;
        buttonText?: string;
        orderDefaultValues?: OrderFormInputsType;
    };
};
