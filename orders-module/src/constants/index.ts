import { PaymentMethodEnum } from 'Enums/general';

export const BASE_API = process.env.API_URL ?? '/';

export const WRONG_MSG = 'Something went wrong!';

export const PAYMENT_METHOD_DEFAULT: PaymentMethodEnum =
    PaymentMethodEnum.Vipps;
