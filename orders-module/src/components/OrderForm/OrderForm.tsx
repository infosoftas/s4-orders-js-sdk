import { FC, ChangeEvent, Suspense, useState, useMemo } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';

import { PaymentMethodEnum } from '../../enums/general';
import {
    PAYMENT_METHOD_DEFAULT,
    INVOICE_ALLOWED_PAYMENT_METHODS,
} from '../../constants/index';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import ToggleField from '../FormFields/ToggleFiled';
import formFieldsMapper from '../FormFields/FormFieldsMapper';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';
import { OrderFormInputsType, OrderInfoType } from '../../types/order';
import {
    PaymentMethodOptionsType,
    OrderFormFiledType,
} from '../../types/general';
import { orderInvoiceContactFields } from '../../utils/order.helper';
import useOrderForm from '../../hooks/useOrderForm';

import './orderForm.scss';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    updateFormData: (data: OrderFormInputsType) => void;
    submitStartCallback?: (id: string) => void;
    templatePackageId: string;
    subscriberId?: string;
    userId?: string;
    identityProviderId?: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    language: string;
    merchantAgreementUrl: string;
    paymentMethodsOptions?: PaymentMethodOptionsType;
    defaultValues?: OrderFormInputsType;
    paymentMethods?: { label: string; value: PaymentMethodEnum }[];
    allowedPaymentMethods?: PaymentMethodEnum[];
    submitButtonText?: string;
    paymentMethodLabel?: string;
    paymentMethodNotAllowedMsg?: string;
    errorReqMsg?: string;
    errorInvalidEmailMsg?: string;
    errorInvalidPhoneMsg?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFiledType[];
        paymentMethods?: PaymentMethodEnum[];
    };
};

const initialData = {
    invoiceAddressSelection: false,
    name: '',
    email: '',
    phoneNumber: '',
    country: '',
    city: '',
    address: '',
    zip: '',
    paymentMethod: PAYMENT_METHOD_DEFAULT,
    orderReference: '',
};

const OrderForm: FC<Props> = ({
    callback,
    updateFormData,
    submitStartCallback,
    templatePackageId,
    subscriberId,
    userId,
    identityProviderId,
    organizationId,
    redirectUrl,
    showIframe,
    paymentMethodsOptions,
    defaultValues,
    language,
    merchantAgreementUrl,
    paymentMethods = [],
    allowedPaymentMethods,
    invoiceAddressSelection,
    submitButtonText = 'Start',
    paymentMethodLabel = 'Select Payment Method',
    paymentMethodNotAllowedMsg = 'This payment method not allowed!',
    errorReqMsg = '',
    errorInvalidEmailMsg = '',
    errorInvalidPhoneMsg = '',
}) => {
    const [orderFields, setOrderFields] = useState<OrderFormFiledType[]>(
        paymentMethodsOptions?.[
            defaultValues?.paymentMethod || PAYMENT_METHOD_DEFAULT
        ]?.orderFormFields ?? DEFAULT_ORDER_FORM_FIELDS
    );

    const methods = useForm<OrderFormInputsType>({
        defaultValues: {
            ...initialData,
            ...(defaultValues ?? {}),
            paymentMethod:
                defaultValues?.paymentMethod || PAYMENT_METHOD_DEFAULT,
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    const invoiceAddressToggle = watch('invoiceAddressSelection');
    const paymentMethodInput = watch('paymentMethod');

    const invoiceOrderFields =
        paymentMethodsOptions?.[paymentMethodInput || PAYMENT_METHOD_DEFAULT]
            ?.paymentInvoiceFields ||
        invoiceAddressSelection?.fields ||
        orderInvoiceContactFields;

    const invoicePaymentMethods =
        invoiceAddressSelection?.paymentMethods ||
        INVOICE_ALLOWED_PAYMENT_METHODS;

    const { orderSubmit, loading, apiErrorMsg, errorsMsg } = useOrderForm({
        callback,
        submitStartCallback,
        organizationId,
        subscriberId,
        userId,
        identityProviderId,
        orderFields,
        redirectUrl,
        showIframe,
        language,
        merchantAgreementUrl,
        paymentMethodsOptions,
        templatePackageId,
        invoiceAddressToggle,
        invoiceOrderFields,
    });

    const onSubmit: SubmitHandler<OrderFormInputsType> = async (
        data
    ): Promise<void> => {
        if (
            paymentMethodInput === PaymentMethodEnum.EHF ||
            paymentMethodInput === PaymentMethodEnum.OIO
        ) {
            updateFormData(data);
            return;
        }
        await orderSubmit(data);
    };

    const handlePaymentChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue('paymentMethod', e.target.value as PaymentMethodEnum);
        const orderFieldsLocal =
            paymentMethodsOptions?.[e.target.value as PaymentMethodEnum]
                ?.orderFormFields ?? DEFAULT_ORDER_FORM_FIELDS;
        setOrderFields(orderFieldsLocal);
        if (
            !invoicePaymentMethods.includes(e.target.value as PaymentMethodEnum)
        ) {
            setValue('invoiceAddressSelection', false);
        }
    };

    const allowPaymentMethod = useMemo(() => {
        if (!allowedPaymentMethods || allowedPaymentMethods?.length === 0) {
            return true;
        }

        if (
            allowedPaymentMethods.includes(
                paymentMethodInput as PaymentMethodEnum
            )
        ) {
            return true;
        }

        return false;
    }, [allowedPaymentMethods, paymentMethodInput]);

    const showInvoiceFields =
        invoiceAddressToggle &&
        invoiceOrderFields?.length > 0 &&
        allowPaymentMethod;

    const showInvoiceToggle =
        invoiceAddressSelection?.enabled &&
        allowPaymentMethod &&
        invoicePaymentMethods.includes(paymentMethodInput as PaymentMethodEnum);

    return (
        <FormProvider {...methods}>
            <form
                className="sdk-order-form"
                onSubmit={handleSubmit(onSubmit)}
                data-testid="sdk-order-form-id"
            >
                {paymentMethods?.length > 0 && (
                    <div className="field-wrapper radio-button-group">
                        <div className="field-label">{paymentMethodLabel}</div>
                        {paymentMethods.map((item) => (
                            <div
                                className="radio-button-control"
                                key={item.value}
                            >
                                <label className="radio-badge">
                                    <input
                                        {...register('paymentMethod', {
                                            required: true,
                                        })}
                                        onChange={handlePaymentChange}
                                        type="radio"
                                        value={item.value}
                                    />
                                    <span className="value-block">
                                        <span className="prefix-icon"></span>
                                        <span className="text-block">
                                            {item.label}
                                        </span>
                                    </span>
                                </label>
                            </div>
                        ))}
                        {errors.paymentMethod && (
                            <div className="text-error caption">
                                {errors.paymentMethod.message}
                            </div>
                        )}
                    </div>
                )}
                {orderFields?.length > 0 && allowPaymentMethod && (
                    <Suspense fallback={null}>
                        {orderFields.map((field) => {
                            const Component = formFieldsMapper[field.name];

                            return Component ? (
                                <Component
                                    key={field.name}
                                    name={field.name}
                                    label={field.label}
                                    required={field.required || false}
                                    readOnly={field.readOnly || false}
                                    errors={errors}
                                    errorReqMsg={errorReqMsg}
                                    errorInvalidEmailMsg={errorInvalidEmailMsg}
                                    errorInvalidPhoneMsg={errorInvalidPhoneMsg}
                                />
                            ) : null;
                        })}
                    </Suspense>
                )}
                {showInvoiceToggle && (
                    <ToggleField
                        name="invoiceAddressSelection"
                        label={
                            invoiceAddressSelection?.label ?? 'Invoice Address'
                        }
                    />
                )}
                {showInvoiceFields && (
                    <Suspense fallback={null}>
                        {invoiceOrderFields.map((field) => {
                            const Component = formFieldsMapper[field.name];

                            return Component ? (
                                <Component
                                    key={field.name}
                                    name={field.name}
                                    label={field.label}
                                    required={field.required || false}
                                    readOnly={field.readOnly || false}
                                    errors={errors}
                                    errorReqMsg={errorReqMsg}
                                    errorInvalidEmailMsg={errorInvalidEmailMsg}
                                    errorInvalidPhoneMsg={errorInvalidPhoneMsg}
                                />
                            ) : null;
                        })}
                    </Suspense>
                )}
                {allowPaymentMethod && (
                    <Button
                        type="submit"
                        loading={loading}
                        buttonText={submitButtonText}
                    />
                )}
                <Alert
                    className="mt-2"
                    msg={
                        allowPaymentMethod
                            ? apiErrorMsg
                            : paymentMethodNotAllowedMsg
                    }
                />
                {errorsMsg?.length > 0 &&
                    allowPaymentMethod &&
                    errorsMsg.map((i) => <Alert className="mt-2" msg={i} />)}
            </form>
        </FormProvider>
    );
};

export default OrderForm;
