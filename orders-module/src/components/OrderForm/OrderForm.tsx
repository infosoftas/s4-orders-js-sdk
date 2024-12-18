import { FC, ChangeEvent, Suspense, useState } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';

import { createSubscriber, mapSubscriberToUser } from '../../api/SubscribeApi';
import { orderStart } from '../../api/OrdersApi';
import { PaymentMethodEnum } from '../../enums/general';
import { WRONG_MSG, PAYMENT_METHOD_DEFAULT } from '../../constants/index';
import Alert from '../Alert/Alert';
import Button from '../Button/Button';
import ToggleField from '../FormFields/ToggleFiled';
import formFieldsMapper from '../FormFields/FormFieldsMapper';
import { DEFAULT_ORDER_FORM_FIELDS } from '../FormFields/FormFields.helper';
import { OrderFormInputsType, OrderInfoType } from '../../types/order';
import {
    PaymentMethodOptionsType,
    OrderFormFiledType,
    ErrorsMsg,
} from '../../types/general';
import {
    orderInvoiceContactFields,
    prepareAgreementModel,
    prepareContactModel,
    prepareInvoiceModel,
} from '../../utils/order.helper';
import {
    prepareErrorMessage,
    prepareErrorsArrayMessage,
} from '../../utils/helper';

import './orderForm.scss';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
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
    submitButtonText?: string;
    paymentMethodLabel?: string;
    errorReqMsg?: string;
    errorInvalidEmailMsg?: string;
    errorInvalidPhoneMsg?: string;
    invoiceAddressSelection?: {
        enabled?: boolean;
        label?: string;
        fields?: OrderFormFiledType[];
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
    invoiceAddressSelection,
    submitButtonText = 'Start',
    paymentMethodLabel = 'Select Payment Method',
    errorReqMsg = '',
    errorInvalidEmailMsg = '',
    errorInvalidPhoneMsg = '',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
    const [errorsMsg, setErrorsMsg] = useState<string[]>([]);
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
    const invoiceOrderFields =
        invoiceAddressSelection?.fields || orderInvoiceContactFields;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    const invoiceAddressToggle = watch('invoiceAddressSelection');

    const onSubmit: SubmitHandler<OrderFormInputsType> = async (
        data
    ): Promise<void> => {
        setApiErrorMsg('');
        setErrorsMsg([]);

        setLoading(true);
        try {
            let id: string | undefined = subscriberId;
            const contactModel = prepareContactModel({ data, orderFields });
            if (!subscriberId) {
                const response = await createSubscriber({
                    ...contactModel,
                });
                id = response.id;

                if (userId && identityProviderId) {
                    await mapSubscriberToUser(id, {
                        userId: userId,
                        identityProviderId: identityProviderId,
                    });
                }
            }

            submitStartCallback?.(id as string);

            if (id) {
                const paymentMethod =
                    data.paymentMethod || PAYMENT_METHOD_DEFAULT;

                const agreements = prepareAgreementModel({
                    paymentMethod,
                    redirectUrl,
                    showIframe,
                    phoneNumber: orderFields.find(
                        (i) => i.name === 'phoneNumber'
                    )
                        ? data.phoneNumber?.trim() || undefined
                        : undefined,
                    language,
                    merchantAgreementUrl,
                    generateSubscriberContact:
                        paymentMethodsOptions?.[
                            data.paymentMethod as PaymentMethodEnum
                        ]?.generateSubscriberContact || false,
                    accountId:
                        paymentMethodsOptions?.[
                            data.paymentMethod as PaymentMethodEnum
                        ]?.accountId,
                });
                const responseOrder = await orderStart({
                    subscriberId: id,
                    subscriptionPlan: {
                        organizationId,
                        templateSubscriptionPlanId: templatePackageId,
                    },
                    paymentAgreement: { ...agreements },
                    invoiceContact: invoiceAddressToggle
                        ? prepareInvoiceModel({
                              data,
                              orderFields: invoiceOrderFields,
                          })
                        : undefined,
                    orderReference: data.orderReference || undefined,
                });
                callback(responseOrder.terminalRedirectUrl, {
                    ...(data || {}),
                    orderId: responseOrder.id,
                    subscriberId: id,
                    paymentMethod: paymentMethod,
                });
                return;
            }
            callback(null);
            setApiErrorMsg(WRONG_MSG);
            setErrorsMsg([]);
        } catch (error) {
            console.error(error);
            setApiErrorMsg(prepareErrorMessage(error as Error));
            setErrorsMsg(
                prepareErrorsArrayMessage(
                    (
                        error as {
                            errors: ErrorsMsg;
                        }
                    )?.errors
                )
            );
            callback(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentChange = (e: ChangeEvent<HTMLInputElement>) => {
        setValue('paymentMethod', e.target.value as PaymentMethodEnum);
        const orderFieldsLocal =
            paymentMethodsOptions?.[e.target.value as PaymentMethodEnum]
                ?.orderFormFields ?? DEFAULT_ORDER_FORM_FIELDS;
        setOrderFields(orderFieldsLocal);
    };

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
                {orderFields?.length > 0 && (
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
                {invoiceAddressSelection?.enabled && (
                    <ToggleField
                        name="invoiceAddressSelection"
                        label={
                            invoiceAddressSelection?.label ?? 'Invoice Address'
                        }
                    />
                )}
                {invoiceAddressToggle && invoiceOrderFields?.length > 0 && (
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
                <Button
                    type="submit"
                    loading={loading}
                    buttonText={submitButtonText}
                />
                <Alert className="mt-2" msg={apiErrorMsg} />
                {errorsMsg?.length > 0 &&
                    errorsMsg.map((i) => <Alert className="mt-2" msg={i} />)}
            </form>
        </FormProvider>
    );
};

export default OrderForm;
