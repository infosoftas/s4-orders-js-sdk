import { ReactNode } from 'react';

import { PaymentMethodEnum, UserActionEnum } from '../enums/general';
import { OrderFormInputsType } from './order';

declare global {
    interface Window {
        sdkOrderCallback: () => void;
    }
}

export type OrderFormFieldType = {
    name: string;
    required?: boolean;
    readOnly?: boolean;
    label?: string;
};

export type PaymentMethodSettingsType = {
    [key in PaymentMethodEnum]?: {
        generateSubscriberContact?: boolean;
        accountId?: string;
        orderFormFields?: OrderFormFieldType[];
        paymentInvoiceFields?: OrderFormFieldType[] | never[] | null;
    };
};

export type ContactRequestType = {
    addressLines?: Array<string> | undefined;
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    city?: string;
    zip?: string;
    careOf?: string;
    organizationNumber?: string;
    gln?: string;
};

export type OrderDenialFallbackOfferType = {
    title?: string;
    description?: string;
    price?: string;
    templatePackageId?: string;
};

export type PaymentIconType = {
    src: string;
    alt: string;
};

export type PaymentMethodOptionType = {
    label: string;
    value: PaymentMethodEnum;
    icons?: PaymentIconType[];
};

export type ConfigType = {
    submitStartCallback?: (subscriberId: string) => void;
    userActionCallback?: (
        action: UserActionEnum,
        args: object | null | undefined
    ) => void;
    setContactCallback?: (contactInfo: ContactRequestType) => void;
    cancelVippsCallback?: () => void;
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
    availablePaymentMethods?: PaymentMethodOptionType[];
    allowedPaymentMethods?: PaymentMethodEnum[];
    paymentMethodsOptions?: PaymentMethodSettingsType;
    requireTermsAcceptance?: boolean;
    language?: string;
    merchantAgreementUrl?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFieldType[];
    };
    settings?: {
        successText?: string;
        failureText?: string;
        submitButtonText?: string;
        backButtonText?: string;
        verifyButtonText?: string;
        orderDenialCloseButtonText?: string;
        orderDenialContinueButtonText?: string;
        organizationNumberLabel?: string;
        cvrLabel?: string;
        glnLabel?: string;
        orderDefaultValues?: OrderFormInputsType;
        paymentMethodLabel?: string;
        errorReqMsg?: string;
        errorInvalidEmailMsg?: string;
        errorInvalidPhoneMsg?: string;
        paymentMethodNotAllowedMsg?: string;
        invoiceLookupNotFoundText?: string;
        errorValidationTitleMsg?: string;
        errorValidationDenialOrderBlockingMsg?: string;
        errorValidationBlockingOffersMsg?: string;
        orderDenialOfferBaseText?: string;
        orderDenialOfferWithFallbackText?: string;
        orderDenialAmountText?: string;
        fetchDenialFallbackOffer?: (
            organizationId: string
        ) => Promise<OrderDenialFallbackOfferType | undefined>;
        termsAndConditionsText?: string | ReactNode;
    };
};

export type ErrorsMsg = {
    [key: string]: string[];
};
