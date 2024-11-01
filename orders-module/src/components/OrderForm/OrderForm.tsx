import { FC, ChangeEvent, Suspense, useState } from 'react';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';

import { createSubscriber, mapSubscriberToUser } from 'API/SubscribeApi';
import { orderStart } from 'API/OrdersApi';
import { PaymentMethodEnum } from 'Enums/general';
import { WRONG_MSG, PAYMENT_METHOD_DEFAULT } from 'Constants/index';
import Alert from 'Component/Alert/Alert';
import Button from 'Component/Button/Button';
import formFieldsMapper from 'Component/FormFields/FormFieldsMapper';
import { DEFAULT_ORDER_FORM_FIELDS } from 'Component/FormFields/FormFields.helper';
import { OrderFormInputsType, OrderInfoType } from 'Types/order';
import { PaymentMethodOptionsType, OrderFormFiledType } from 'Types/general';
import { prepareAgreementModel } from 'Utils/order.helper';
import { prepareErrorMessage } from 'Utils/helper';

import './orderForm.scss';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    templatePackageId: string;
    subscriberId?: string;
    userId?: string;
    identityProviderId?: string;
    organizationId: string;
    redirectUrl: string;
    language: string;
    merchantAgreementUrl: string;
    paymentMethodsOptions?: PaymentMethodOptionsType;
    defaultValues?: OrderFormInputsType;
    paymentMethods?: { label: string; value: PaymentMethodEnum }[];
    buttonText?: string;
};

const initialData = {
    name: '',
    email: '',
    phoneNumber: '',
    paymentMethod: PAYMENT_METHOD_DEFAULT,
};

const OrderForm: FC<Props> = ({
    callback,
    templatePackageId,
    subscriberId,
    userId,
    identityProviderId,
    organizationId,
    redirectUrl,
    paymentMethodsOptions,
    defaultValues,
    language,
    merchantAgreementUrl,
    paymentMethods = [],
    buttonText = 'Start',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
    const [orderFields, setOrderFields] = useState<OrderFormFiledType[]>(
        paymentMethodsOptions?.[PAYMENT_METHOD_DEFAULT]?.orderFormFields ??
            DEFAULT_ORDER_FORM_FIELDS
    );

    const methods = useForm<OrderFormInputsType>({
        defaultValues: {
            ...initialData,
            ...(defaultValues ?? {}),
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = methods;

    const onSubmit: SubmitHandler<OrderFormInputsType> = async (
        data
    ): Promise<void> => {
        setApiErrorMsg('');

        setLoading(true);
        try {
            let id: string | undefined = subscriberId;
            if (!subscriberId) {
                const response = await createSubscriber({
                    name: data.name,
                    phoneNumber: data.phoneNumber,
                });
                id = response.id;

                if (userId && identityProviderId) {
                    await mapSubscriberToUser(id, {
                        userId: userId,
                        identityProviderId: identityProviderId,
                    });
                }
            }

            if (id) {
                const paymentMethod =
                    data.paymentMethod || PAYMENT_METHOD_DEFAULT;

                const agreements = prepareAgreementModel({
                    paymentMethod,
                    redirectUrl,
                    data,
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
                });
                callback(responseOrder.terminalRedirectUrl, {
                    orderId: responseOrder.id,
                    subscriberId: id,
                    paymentMethod: paymentMethod,
                });
                return;
            }
            callback(null);
            setApiErrorMsg(WRONG_MSG);
        } catch (error) {
            console.error(error);
            setApiErrorMsg(prepareErrorMessage(error as Error));
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
                        <div className="field-label">Select Payment Method</div>
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
                                    required={field.required || false}
                                    readOnly={field.readOnly || false}
                                    errors={errors}
                                />
                            ) : null;
                        })}
                    </Suspense>
                )}
                <Button
                    type="submit"
                    loading={loading}
                    buttonText={buttonText}
                />
                <Alert className="mt-2" msg={apiErrorMsg} />
            </form>
        </FormProvider>
    );
};

export default OrderForm;
