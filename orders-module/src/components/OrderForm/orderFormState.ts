import { z, type ZodTypeAny } from 'zod';

import { PaymentMethodEnum } from '../../enums/general';
import {
    PAYMENT_METHOD_DEFAULT,
    INVOICE_ALLOWED_PAYMENT_METHODS,
} from '../../constants/index';
import formFieldsMapper from '../FormFields/FormFieldsMapper';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';
import { buildFieldSchema } from '../FormFields/fieldValidators';
import { orderInvoiceContactFields } from '../../utils/order.helper';
import type { OrderFormInputsType } from '../../types/order';
import type {
    PaymentMethodSettingsType,
    PaymentMethodOptionType,
    OrderFormFieldType,
} from '../../types/general';

export type InvoiceAddressSelection = {
    enabled?: boolean;
    label?: string;
    fields?: OrderFormFieldType[];
    paymentMethods?: PaymentMethodEnum[];
};

export type OrderFormConfig = {
    paymentMethods: PaymentMethodOptionType[];
    paymentMethodsOptions?: PaymentMethodSettingsType;
    allowedPaymentMethods?: PaymentMethodEnum[];
    invoiceAddressSelection?: InvoiceAddressSelection;
};

export type OrderFormValues = Pick<
    OrderFormInputsType,
    'paymentMethod' | 'invoiceAddressSelection'
>;

export type OrderFormDerived = {
    paymentMethod: PaymentMethodEnum;
    availablePaymentMethods: PaymentMethodEnum[];
    orderFields: OrderFormFieldType[];
    invoiceOrderFields: OrderFormFieldType[];
    invoicePaymentMethods: PaymentMethodEnum[];
    allowPaymentMethod: boolean;
    showPaymentMethodSelection: boolean;
    showOrderFields: boolean;
    showInvoiceToggle: boolean;
    showInvoiceFields: boolean;
    showContactDetails: boolean;
};

export const deriveOrderFormState = (
    values: OrderFormValues,
    {
        paymentMethods,
        paymentMethodsOptions,
        allowedPaymentMethods,
        invoiceAddressSelection,
    }: OrderFormConfig
): OrderFormDerived => {
    const paymentMethod = (values.paymentMethod ||
        PAYMENT_METHOD_DEFAULT) as PaymentMethodEnum;

    const orderFields =
        paymentMethodsOptions?.[paymentMethod]?.orderFormFields ??
        DEFAULT_ORDER_FORM_FIELDS;

    const invoiceOrderFields =
        paymentMethodsOptions?.[paymentMethod]?.paymentInvoiceFields ||
        invoiceAddressSelection?.fields ||
        orderInvoiceContactFields;

    const invoicePaymentMethods =
        invoiceAddressSelection?.paymentMethods ||
        INVOICE_ALLOWED_PAYMENT_METHODS;

    const allowPaymentMethod =
        !allowedPaymentMethods?.length ||
        allowedPaymentMethods.includes(paymentMethod);

    const showOrderFields = orderFields?.length > 0 && allowPaymentMethod;

    const showInvoiceToggle = !!(
        invoiceAddressSelection?.enabled &&
        allowPaymentMethod &&
        invoicePaymentMethods.includes(paymentMethod)
    );

    const showInvoiceFields = !!(
        values.invoiceAddressSelection &&
        invoiceOrderFields?.length > 0 &&
        allowPaymentMethod
    );

    return {
        paymentMethod,
        availablePaymentMethods: paymentMethods.map((m) => m.value),
        orderFields,
        invoiceOrderFields,
        invoicePaymentMethods,
        allowPaymentMethod,
        showPaymentMethodSelection: paymentMethods.length > 1,
        showOrderFields,
        showInvoiceToggle,
        showInvoiceFields,
        showContactDetails:
            showOrderFields || showInvoiceToggle || showInvoiceFields,
    };
};

export type OrderFormMessages = {
    errorReqMsg?: string;
    errorInvalidEmailMsg?: string;
    errorInvalidPhoneMsg?: string;
    errorTermsMsg?: string;
};

export const buildOrderFormSchema = (
    derived: OrderFormDerived,
    requireTermsAcceptance: boolean | undefined,
    {
        errorReqMsg,
        errorInvalidEmailMsg,
        errorInvalidPhoneMsg,
        errorTermsMsg,
    }: OrderFormMessages
): z.ZodType<OrderFormInputsType, OrderFormInputsType> => {
    const shape: Record<string, ZodTypeAny> = {};
    const messages = {
        errorReqMsg,
        errorInvalidEmailMsg,
        errorInvalidPhoneMsg,
    };

    const addFields = (fields: OrderFormFieldType[]) => {
        fields.forEach((field) => {
            if (!formFieldsMapper[field.name]) return;

            shape[field.name] = buildFieldSchema(
                field.name,
                field.required || false,
                messages
            );
        });
    };

    if (derived.showOrderFields) addFields(derived.orderFields);
    if (derived.showInvoiceFields) addFields(derived.invoiceOrderFields);

    if (derived.availablePaymentMethods.length > 0) {
        const available: string[] = derived.availablePaymentMethods;
        shape.paymentMethod = z
            .string()
            .refine((value) => available.includes(value), {
                message: errorReqMsg || 'This field is required!',
            });
    }

    if (requireTermsAcceptance) {
        shape.termsAccept = z.boolean().refine((value) => value === true, {
            message:
                errorTermsMsg ||
                'You must accept the terms and conditions to proceed.',
        });
    }

    return z.object(shape).loose() as unknown as z.ZodType<
        OrderFormInputsType,
        OrderFormInputsType
    >;
};
