import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

import { createSubscriber } from 'API/SubscribeApi';
import { orderStartV2 } from 'API/OrdersApi';
import { WRONG_MSG, PAYMENT_METHOD_DEFAULT } from 'Constants/index';
import Button from 'Component/Button/Button';
import { OrderFormInputsType } from 'Types/order';
import { prepareAgreementModel } from 'Utils/order.helper';

import '../MainForm/mainForm.scss';

type Props = {
    callback: (url: string | null) => void;
    templatePackageId: string;
    subscriberId?: string;
    tenantId: string;
    organizationId: string;
    redirectUrl: string;
    paymentMethods?: string[];
    buttonText?: string;
};

const defaultValues = {
    name: '',
    phoneNumber: '',
    paymentMethod: PAYMENT_METHOD_DEFAULT,
};

const OrderForm: FC<Props> = ({
    callback,
    templatePackageId,
    subscriberId,
    tenantId,
    organizationId,
    redirectUrl,
    paymentMethods = [],
    buttonText = 'Start',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OrderFormInputsType>({
        defaultValues,
    });

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
            }

            if (id) {
                const paymentMethod =
                    data.paymentMethod || PAYMENT_METHOD_DEFAULT;

                const agreements = prepareAgreementModel(
                    paymentMethod,
                    redirectUrl,
                    data
                );
                const responseOrder = await orderStartV2({
                    templatePackageId,
                    tenantId,
                    organizationId,
                    subscriberId: id,
                    agreementParameters: { ...agreements },
                });
                callback(responseOrder.terminalRedirectUrl);
                return;
            }
            callback(null);
            setApiErrorMsg(WRONG_MSG);
        } catch (error) {
            console.error(error);
            setApiErrorMsg((error as string) || WRONG_MSG);
            callback(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="sdkOrderForm" onSubmit={handleSubmit(onSubmit)}>
            <div className="field-wrapper">
                <label>Phone number</label>
                <input
                    {...register('phoneNumber', {
                        pattern: {
                            value: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]{5,10}$/g,
                            message: 'invalid phone address',
                        },
                    })}
                    className="input-control"
                    type="tel"
                />
                {errors.phoneNumber && (
                    <div className="text-error caption">
                        {errors.phoneNumber.message}
                    </div>
                )}
            </div>
            <div className="field-wrapper">
                <label>Name</label>
                <input
                    className="input-control"
                    {...register('name', {
                        required: 'This field is required',
                    })}
                />
                {errors.name && (
                    <div className="text-error caption">
                        {errors.name.message}
                    </div>
                )}
            </div>
            {paymentMethods?.length > 0 && (
                <div className="field-wrapper">
                    <div className="field-label">Payment Method</div>
                    {paymentMethods.map((item) => (
                        <div className="radio-button-control">
                            <label className="radio-badge">
                                <input
                                    {...register('paymentMethod', {
                                        required: true,
                                    })}
                                    type="radio"
                                    value={item}
                                />
                                <span>{item}</span>
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
            <Button type="submit" loading={loading} buttonText={buttonText} />
            {apiErrorMsg && (
                <div className="text-error caption">{apiErrorMsg}</div>
            )}
        </form>
    );
};

export default OrderForm;
