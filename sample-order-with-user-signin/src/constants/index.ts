import { LanguageCodeEnum, PaymentMethodEnum } from 'Enums/general';
import { OptionType } from 'Types/general';

export const BASE_API = process.env.API_URL ?? '/';

export const ORDER_PLACE_ID = 'sdk-order';

export const LANGUAGE_KEY = 'local-language';

export const CREATE_AND_MAP = true;

export const WRONG_MSG = 'Something went wrong!';

export const ORDER_SUCCESS_MSG = 'Order successful completed!';

export const EMAIL_CHECK_PATTERN =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

export const AVAILABLE_PAYMENT_METHODS: OptionType[] = [
    { label: 'Vipps', value: PaymentMethodEnum.Vipps },
    { label: 'MobilePay', value: PaymentMethodEnum.MobilePay },
    {
        label: 'Credit Card/Debit Card',
        translateKey: 'CreditCard',
        value: PaymentMethodEnum.SwedbankPay,
    },
    {
        label: 'EHF',
        translateKey: 'EHF',
        value: PaymentMethodEnum.EHF,
    },
    {
        label: 'OIO',
        translateKey: 'OIO',
        value: PaymentMethodEnum.OIO,
    },
    {
        label: 'Invoice (Enables Invoice Address/Contact Selection)',
        translateKey: 'Invoice',
        value: PaymentMethodEnum.Invoice,
    },
    {
        label: 'Email (Enables Invoice Address/Contact Selection)',
        translateKey: 'Email',
        value: PaymentMethodEnum.Email,
    },
];

export const DEFAULT_PAYMENT_METHODS: OptionType[] = [
    { label: 'Vipps', value: PaymentMethodEnum.Vipps },
    {
        label: 'Credit Card/Debit Card',
        translateKey: 'CreditCard',
        value: PaymentMethodEnum.SwedbankPay,
    },
];

export const DEFAULT_BUSINESS_METHODS: OptionType[] = [
    {
        label: 'EHF',
        translateKey: 'EHF',
        value: PaymentMethodEnum.EHF,
    },
];

export const HEADER_ROUTES = [
    { path: '/user-journey' },
    { path: '/order-journey' },
];

export const ALL_FIELDS_ROUTES = ['/order-address-journey'];

export const languageOptions = [
    {
        label: 'Danish',
        value: LanguageCodeEnum.DA,
    },
    {
        label: 'English',
        value: LanguageCodeEnum.EN,
    },
    {
        label: 'Norwegian',
        value: LanguageCodeEnum.NB,
    },
    {
        label: 'Swedish',
        value: LanguageCodeEnum.SV,
    },
];
