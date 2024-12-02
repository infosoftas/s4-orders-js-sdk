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
};

export const DEFAULT_ORDER_FORM_FIELDS: OrderFormFiledType[] = [
    {
        name: FIELD_TYPES.PHONE,
        required: false,
        readOnly: false,
        label: '',
    },
];
