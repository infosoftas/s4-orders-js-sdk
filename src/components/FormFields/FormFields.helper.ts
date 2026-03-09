import { OrderFormFiledType } from '../../types/general';

export const FIELD_TYPES = {
    PHONE: 'phoneNumber',
    EMAIL: 'email',
    NAME: 'name',
    COUNTRY: 'country',
    CITY: 'city',
    ADDRESS: 'address',
    ZIP: 'zip',
    CARE_OF: 'careOf',
    ORGANIZATION_NUMBER: 'organizationNumber',
    BUYER_REFERENCE: 'buyerReference',
    ORDER_REFERENCE: 'orderReference',
    INVOICE_NAME: 'invoiceName',
    INVOICE_ADDRESS: 'invoiceAddress',
    INVOICE_CITY: 'invoiceCity',
    INVOICE_ZIP: 'invoiceZip',
    INVOICE_COUNTRY: 'invoiceCountry',
    INVOICE_PHONE: 'invoicePhoneNumber',
    INVOICE_EMAIL: 'invoiceEmail',
    INVOICE_CARE_OF: 'invoiceCareOf',
    INVOICE_BUYER_REFERENCE: 'invoiceBuyerReference',
};

export const DEFAULT_ORDER_FORM_FIELDS: OrderFormFiledType[] = [
    {
        name: FIELD_TYPES.PHONE,
        required: false,
        readOnly: false,
        label: '',
    },
];
