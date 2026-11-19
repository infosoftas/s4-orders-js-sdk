import { PaymentMethodEnum, PaymentReturnActionEnum } from '../enums/general';
import type { AgreementsType, OrderFormInputsType } from '../types/order';
import type { OrderFormFieldType } from '../types/general';
import { FIELD_TYPES } from '../components/FormFields/FormFields.helper';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl?: string;
    phoneNumber?: string;
    generateSubscriberContact: boolean;
    language: string;
    merchantAgreementUrl: string;
    accountId?: string;
};

const mapToPaymentProviderLanguage = (language: string) => {
    const allowedLanguages = [
        'en-US',
        'sv-SE',
        'nb-NO',
        'da-DK',
        'fi-FI',
        'en-GB',
        'nn-NO',
        'no-NO',
        'se-NO',
    ];
    if (allowedLanguages.includes(language)) {
        return language;
    }

    console.warn(`Language ${language} not supported.`);

    return 'en-US';
};

// Parameters a payment provider adds on return. A return URL built from a page
// that is itself a return would otherwise carry the previous attempt's values,
// and the first `action`/`S4OrderId` wins when the next return is read.
const PAYMENT_RETURN_PARAMS = [
    'action',
    's4orderid',
    'transactionid',
    'orderid',
    'agreementid',
];

const withoutPaymentReturnParams = (href: string) => {
    const url = new URL(href);
    for (const key of [...url.searchParams.keys()]) {
        if (PAYMENT_RETURN_PARAMS.includes(key.toLowerCase())) {
            url.searchParams.delete(key);
        }
    }
    return url;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    phoneNumber,
    generateSubscriberContact,
    language,
    merchantAgreementUrl,
    accountId,
}: AgreementModelType): AgreementsType => {
    const model: AgreementsType = {
        paymentProvider: paymentMethod,
    };
    const existUrl = new URL(window.location.href);
    const journey = existUrl.searchParams.get('journey');
    const hashToken = existUrl.searchParams.get('hashToken');
    const baseUrl = withoutPaymentReturnParams(
        redirectUrl || window.location.href
    );
    const buildReturnUrl = (action: PaymentReturnActionEnum) => {
        const returnUrl = new URL(baseUrl);
        returnUrl.searchParams.set('action', action);
        if (journey) {
            returnUrl.searchParams.set('journey', journey);
        }
        if (hashToken) {
            returnUrl.searchParams.set('hashToken', hashToken);
        }
        return returnUrl;
    };
    const cancelUrl = buildReturnUrl(PaymentReturnActionEnum.CANCEL);
    const confirmUrl = buildReturnUrl(PaymentReturnActionEnum.COMPLETE);

    if (paymentMethod === PaymentMethodEnum.SwedbankPay) {
        model.swedbankPay = {
            cancelUrl: `${cancelUrl}`,
            completeUrl: `${confirmUrl}`,
            language: mapToPaymentProviderLanguage(language),
            accountId,
        };

        return model;
    }

    if (paymentMethod === PaymentMethodEnum.Mollie) {
        model.mollie = {
            accountId,
            returnUrl: `${confirmUrl}`,
            cancelUrl: `${cancelUrl}`,
            language: mapToPaymentProviderLanguage(language),
        };

        return model;
    }

    if (
        paymentMethod === PaymentMethodEnum.Vipps ||
        paymentMethod === PaymentMethodEnum.MobilePay
    ) {
        model.vippsMobilePay = {
            generateSubscriberContact,
            merchantAgreementUrl,
            accountId,
            phoneNumber,
            merchantRedirectUrl: `${baseUrl}`,
        };

        return model;
    }

    return model;
};

type ContactModelType = {
    data: OrderFormInputsType;
    orderFields: OrderFormFieldType[];
};

export const prepareContactModel = ({
    data,
    orderFields,
}: ContactModelType) => {
    const organizationNumber =
        data.paymentMethod === PaymentMethodEnum.OIO
            ? data.cvr?.trim() || undefined
            : data.organizationNumber?.trim() || undefined;

    const model = {
        name: orderFields.find((i) => i.name === 'name')
            ? data.name?.trim() || undefined
            : undefined,
        email: orderFields.find((i) => i.name === 'email')
            ? data.email?.trim() || undefined
            : undefined,
        phone: orderFields.find((i) => i.name === 'phoneNumber')
            ? data.phoneNumber?.trim() || undefined
            : undefined,
        country: orderFields.find((i) => i.name === 'country')
            ? data.country?.trim() || undefined
            : undefined,
        city: orderFields.find((i) => i.name === 'city')
            ? data.city?.trim() || undefined
            : undefined,
        addressLines: orderFields.find((i) => i.name === 'address')
            ? data.address?.trim()
                ? data.address
                      ?.trim()
                      .replace(/\r\n/g, '\n')
                      .split('\n')
                      .filter((line) => line)
                : undefined
            : undefined,
        zip: orderFields.find((i) => i.name === 'zip')
            ? data.zip?.trim() || undefined
            : undefined,
        careOf: orderFields.find((i) => i.name === 'careOf')
            ? data.careOf?.trim() || undefined
            : undefined,
        organizationNumber,
        gln:
            data.paymentMethod === PaymentMethodEnum.OIO
                ? data.gln?.trim() || undefined
                : undefined,
    };

    return model;
};

export const prepareInvoiceModel = ({
    data,
    orderFields,
}: ContactModelType) => {
    const model = {
        name: orderFields.find((i) => i.name === 'invoiceName')
            ? data.invoiceName?.trim() || undefined
            : undefined,
        email: orderFields.find((i) => i.name === 'invoiceEmail')
            ? data.invoiceEmail?.trim() || undefined
            : undefined,
        phone: orderFields.find((i) => i.name === 'invoicePhoneNumber')
            ? data.invoicePhoneNumber?.trim() || undefined
            : undefined,
        country: orderFields.find((i) => i.name === 'invoiceCountry')
            ? data.invoiceCountry?.trim() || undefined
            : undefined,
        city: orderFields.find((i) => i.name === 'invoiceCity')
            ? data.invoiceCity?.trim() || undefined
            : undefined,
        addressLines: orderFields.find((i) => i.name === 'invoiceAddress')
            ? data.invoiceAddress?.trim()
                ? data.invoiceAddress
                      ?.trim()
                      .replace(/\r\n/g, '\n')
                      .split('\n')
                      .filter((line) => line)
                : undefined
            : undefined,
        zip: orderFields.find((i) => i.name === 'invoiceZip')
            ? data.invoiceZip?.trim() || undefined
            : undefined,
        careOf: orderFields.find((i) => i.name === 'invoiceCareOf')
            ? data.invoiceCareOf?.trim() || undefined
            : undefined,
        buyerReference: orderFields.find(
            (i) => i.name === 'invoiceBuyerReference'
        )
            ? data.invoiceBuyerReference?.trim() || undefined
            : undefined,
    };

    return model;
};

export const orderInvoiceContactFields = [
    {
        name: FIELD_TYPES.INVOICE_NAME,
        label: 'Name',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_EMAIL,
        label: 'Email',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_PHONE,
        label: 'Phone',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_COUNTRY,
        label: 'Country',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_CITY,
        label: 'City',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_ADDRESS,
        label: 'Address',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_ZIP,
        label: 'Zip',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_CARE_OF,
        label: 'Contact Person',
        required: false,
        readOnly: false,
    },
    {
        name: FIELD_TYPES.INVOICE_BUYER_REFERENCE,
        label: 'Buyer Reference',
        required: false,
        readOnly: false,
    },
];
