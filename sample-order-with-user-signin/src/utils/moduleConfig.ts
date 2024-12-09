import {
    DEFAULT_PAYMENT_METHODS,
    LANGUAGE_KEY,
    ORDER_PLACE_ID,
    ORDER_SUCCESS_MSG,
    WRONG_MSG,
} from 'Constants/index';
import { AllowLanguageCodeEnum, OrderModuleFiledNameEnum } from 'Enums/general';
import { OptionType } from 'Types/general';
import { ConfigType } from 'Types/orderModule';

type Props = {
    apiKey: string;
    apiUrl: string;
    userId: string;
    subscriberId: string;
    templatePackageId: string;
    identityProviderId: string;
    organizationId: string;
    selfServiceUrl: string;
    userEmail?: string;
    name?: string;
    city?: string;
    country?: string;
    postalCode?: string;
    streetAddress?: string;
    paymentMethodOptions?: string[] | null;
};

const preparePaymentMethods = (): OptionType[] => {
    return [
        ...DEFAULT_PAYMENT_METHODS,
        { label: 'Invoice', translateKey: 'Invoice', value: 'Invoice' },
        { label: 'Email', translateKey: 'Email', value: 'Email' },
        { label: 'EHF', translateKey: 'EHF', value: 'EHF' },
        { label: 'OIO', translateKey: 'OIO', value: 'OIO' },
    ];
};

const prepareLanguage = () => {
    const navigatorLanguage =
        localStorage.getItem(LANGUAGE_KEY) ||
        navigator.language ||
        (navigator.languages && navigator.languages[0]);

    if (
        Object.values(AllowLanguageCodeEnum).includes(
            navigatorLanguage as AllowLanguageCodeEnum
        )
    ) {
        return navigatorLanguage;
    }

    const languageWithoutRegionCode = navigatorLanguage
        ?.toLowerCase()
        .split(/[_-]+/)[0];

    if (languageWithoutRegionCode === 'en') {
        return AllowLanguageCodeEnum.EN;
    }

    if (
        navigatorLanguage === 'nn-NO' ||
        navigatorLanguage === 'se-NO' ||
        navigatorLanguage === 'nb-NO'
    ) {
        return AllowLanguageCodeEnum.NB;
    }

    return AllowLanguageCodeEnum.EN;
};

const prepareContactAdditionalFields = () => {
    const additionalFields = [
        {
            name: OrderModuleFiledNameEnum.country,
            label: 'Country',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.city,
            label: 'City',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.address,
            label: 'Address',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.zip,
            label: 'Zip',
            required: false,
            readOnly: false,
        },
    ];

    return additionalFields;
};

const prepareInvoiceContactFields = () => {
    const orderInvoiceContactFields = [
        {
            name: OrderModuleFiledNameEnum.invoiceName,
            label: 'Name',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoicePhone,
            label: 'Phone',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceEmail,
            label: 'Email',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceCountry,
            label: 'Country',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceCity,
            label: 'City',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceAddress,
            label: 'Address',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceZip,
            label: 'Zip',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceCareOf,
            label: 'Contact Person',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.invoiceBuyerReference,
            label: 'Buyer Reference',
            required: false,
            readOnly: false,
        },
    ];

    return orderInvoiceContactFields;
};

const prepareAdditionalBusinessFields = () => {
    const businessAdditionalFields = [
        {
            name: OrderModuleFiledNameEnum.careOf,
            label: 'Contact Person',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.organizationNumber,
            label: 'Organization Number',
            required: false,
            readOnly: false,
        },
        {
            name: OrderModuleFiledNameEnum.orderReference,
            label: 'Order Reference',
            required: false,
            readOnly: false,
        },
    ];

    return businessAdditionalFields;
};

export const prepareConfig = ({
    apiKey,
    apiUrl,
    userId,
    subscriberId,
    templatePackageId,
    identityProviderId,
    organizationId,
    selfServiceUrl,
    userEmail,
    name,
    city,
    country,
    postalCode,
    streetAddress,
}: Props) => {
    const additionalContactFields = prepareContactAdditionalFields();
    const additionalBusinessFields = prepareAdditionalBusinessFields();

    const config = {
        moduleTitle: '',
        domElementId: ORDER_PLACE_ID,
        redirectUrl: window.location.href,
        merchantAgreementUrl: selfServiceUrl,
        showIframe: true,
        apiKey,
        apiUrl,
        userId,
        subscriberId,
        templatePackageId,
        identityProviderId,
        organizationId,
        language: prepareLanguage(),
        availablePaymentMethods: preparePaymentMethods(),
        paymentMethodsOptions: {
            Vipps: {
                generateSubscriberContact: true,
                orderFormFields: [],
            },
            SwedbankPay: {
                orderFormFields: [
                    {
                        name: OrderModuleFiledNameEnum.name,
                        label: 'Name',
                        required: false,
                    },
                    {
                        name: OrderModuleFiledNameEnum.phoneNumber,
                        label: 'Phone',
                        readOnly: false,
                        required: false,
                    },
                    {
                        name: OrderModuleFiledNameEnum.email,
                        label: 'Email',
                        required: true,
                        readOnly: !!userEmail,
                    },
                    ...additionalContactFields,
                    ...additionalBusinessFields,
                ],
            },
            Invoice: {
                orderFormFields: [
                    ...additionalContactFields,
                    ...additionalBusinessFields,
                ],
            },
            Email: {
                orderFormFields: [
                    ...additionalContactFields,
                    ...additionalBusinessFields,
                ],
            },
            EHF: {
                orderFormFields: [
                    ...additionalContactFields,
                    ...additionalBusinessFields,
                ],
            },
            OIO: {
                orderFormFields: [
                    ...additionalContactFields,
                    ...additionalBusinessFields,
                ],
            },
        },
        invoiceAddressSelection: {
            enabled: true,
            label: 'Invoice Address',
            fields: prepareInvoiceContactFields(),
        },
        settings: {
            submitButtonText: 'Continue',
            backButtonText: 'Back',
            verifyButtonText: 'Verify',
            organizationNumberLabel: 'CVR',
            glnLabel: 'GLN/EAN',
            paymentMethodLabel: 'Select Payment Method',
            errorReqMsg: 'This field is required!',
            errorInvalidEmailMsg: 'Invalid email address!',
            errorInvalidPhoneMsg: 'Invalid phone number!',
            successText: ORDER_SUCCESS_MSG,
            failureText: WRONG_MSG,
            orderDefaultValues: {
                name,
                email: userEmail || '',
                phoneNumber: '',
                city,
                country,
                zip: postalCode,
                address: streetAddress,
                paymentMethod: undefined,
            },
        },
    };

    return config as ConfigType;
};
