import { MessageEventTypeEnum, PaymentMethodEnum } from '../enums/general';
import { AgreementsType, OrderFormInputsType } from '../types/order';
import { OrderFormFiledType } from '../types/general';
import { FIELD_TYPES } from '../components/FormFields/FormFields.helper';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl?: string;
    showIframe?: boolean;
    phoneNumber?: string;
    generateSubscriberContact: boolean;
    language: string;
    merchantAgreementUrl: string;
    accountId?: string;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    showIframe,
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
    const url = showIframe
        ? window.location.href.split('?')[0]
        : redirectUrl || window.location.href;
    const cancelUrl = new URL(url);
    cancelUrl.searchParams.append('action', `${MessageEventTypeEnum.CANCEL}`);
    if (journey) {
        cancelUrl.searchParams.append('journey', journey);
    }
    if (hashToken) {
        cancelUrl.searchParams.append('hashToken', hashToken);
    }
    const confirmUrl = new URL(url);
    confirmUrl.searchParams.append(
        'action',
        `${MessageEventTypeEnum.COMPLETE}`
    );
    if (journey) {
        confirmUrl.searchParams.append('journey', journey);
    }
    if (hashToken) {
        confirmUrl.searchParams.append('hashToken', hashToken);
    }

    if (paymentMethod === PaymentMethodEnum.SwedbankPay) {
        model.swedbankPay = {
            cancelUrl: `${cancelUrl}`,
            completeUrl: `${confirmUrl}`,
            language,
            accountId,
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
            merchantRedirectUrl: redirectUrl || window.location.href,
        };

        return model;
    }

    return model;
};

type ContactModelType = {
    data: OrderFormInputsType;
    orderFields: OrderFormFiledType[];
};

export const prepareContactModel = ({
    data,
    orderFields,
}: ContactModelType) => {
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
