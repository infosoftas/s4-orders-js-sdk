import { PaymentMethodEnum } from '../enums/general';

export const BASE_API = '/';

export const WRONG_MSG = 'Something went wrong!';

export const PAYMENT_METHOD_DEFAULT: PaymentMethodEnum =
    PaymentMethodEnum.Vipps;

export const INVOICE_ALLOWED_PAYMENT_METHODS = [
    PaymentMethodEnum.Email,
    PaymentMethodEnum.Invoice,
];
