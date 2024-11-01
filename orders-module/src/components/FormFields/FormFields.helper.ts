import { OrderFormFiledType } from 'Types/general';

export const FIELD_TYPES = {
    PHONE: 'phoneNumber',
    EMAIL: 'email',
    NAME: 'name',
};

export const DEFAULT_ORDER_FORM_FIELDS: OrderFormFiledType[] = [
    {
        name: FIELD_TYPES.PHONE,
        required: false,
        readOnly: false,
    },
];
