import { PaymentMethodEnum } from 'Enums/general';

export type OrderFormFiledType = {
    name: string;
    required?: boolean;
};

export type OrderFormFieldsConfigType = {
    [key in PaymentMethodEnum]: OrderFormFiledType[];
};

export type ConfigType = {
    domElementId: string;
    companyName: string;
    templatePackageId: string;
    subscriberId: string;
    tenantId: string;
    organizationId: string;
    redirectUrl?: string;
    generateSubscriberContact?: boolean;
    showIframe?: boolean;
    availablePaymentMethods?: PaymentMethodEnum[];
    orderFormFields?: OrderFormFieldsConfigType;
    strings?: {
        successText?: string;
        failureText?: string;
        buttonText?: string;
    };
};
