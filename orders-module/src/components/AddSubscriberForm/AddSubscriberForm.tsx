import React, { ChangeEvent, FC, useState } from 'react';

import { createSubscriber } from 'API/SubscribeApi';
import { orderStartV2 } from 'API/OrdersApi';
import Button from 'Component/Button/Button';
import { PAYMENT_METHOD_DEFAULT, WRONG_MSG } from 'Constants/index';
import { prepareAgreementModel } from 'Utils/order.helper';

import '../MainForm/mainForm.scss';

type Props = {
    callback: (url: string | null) => void;
    templatePackageId: string;
    subscriberId: string;
    tenantId: string;
    organizationId: string;
    redirectUrl: string;
    paymentMethods?: string[];
    generateSubscriberContact?: boolean;
    buttonText?: string;
};

const MainForm: FC<Props> = ({
    callback,
    templatePackageId,
    subscriberId,
    tenantId,
    organizationId,
    redirectUrl,
    paymentMethods = [],
    generateSubscriberContact = false,
    buttonText = 'Start',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>('');
    const [errorPhoneMsg, setErrorPhoneMsg] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [errorNameMsg, setErrorNameMsg] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>(
        PAYMENT_METHOD_DEFAULT
    );
    const [errorPaymentMethodMsg, setErrorPaymentMethodMsg] =
        useState<string>('');
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();
        setApiErrorMsg('');

        if (!isValidPhone(phone)) {
            setErrorPhoneMsg('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        try {
            let id: string | undefined = subscriberId;
            if (!subscriberId) {
                const response = await createSubscriber({
                    name: name,
                    phoneNumber: phone,
                });
                id = response.id;
            }
            if (id) {
                const agreements = prepareAgreementModel(
                    paymentMethod,
                    redirectUrl,
                    {
                        name: name,
                        phoneNumber: phone,
                        paymentMethod: paymentMethod,
                    },
                    generateSubscriberContact
                );

                const responseOrder = await orderStartV2({
                    templatePackageId,
                    tenantId,
                    organizationId,
                    subscriberId: id,
                    agreementParameters: {
                        ...agreements,
                    },
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

    const isValidPhone = (phoneNumber: string): boolean => {
        if (!phoneNumber) {
            return true;
        }

        const pattern = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]{5,10}$/g;
        const isValid = pattern.test(phoneNumber);

        return isValid;
    };

    const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
        setErrorPhoneMsg('');
        const phoneNumber = e.target.value.trim();
        setPhone(phoneNumber);
    };

    return (
        <form className="sdkOrderForm" onSubmit={handleSubmit}>
            <div className="field-wrapper">
                <label>Phone number</label>
                <input
                    className="input-control"
                    type="tel"
                    name="phoneNUmber"
                    value={phone}
                    onChange={handlePhoneNumberChange}
                />
                {errorPhoneMsg && (
                    <div className="text-error caption">{errorPhoneMsg}</div>
                )}
            </div>
            <div className="field-wrapper">
                <label>Name</label>
                <input
                    className="input-control"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                {errorNameMsg && (
                    <div className="text-error caption">{errorNameMsg}</div>
                )}
            </div>
            {paymentMethods?.length > 0 && (
                <div className="field-wrapper">
                    <div className="field-label">Payment Method</div>
                    {paymentMethods.map((item) => (
                        <div className="radio-button-control">
                            <label className="radio-badge">
                                <input
                                    name="paymentMethod"
                                    type="radio"
                                    value={item}
                                    checked={item === paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(e.target.value)
                                    }
                                />
                                <span>{item}</span>
                            </label>
                        </div>
                    ))}
                    {errorPaymentMethodMsg && (
                        <div className="text-error caption">
                            {errorPaymentMethodMsg}
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

export default MainForm;
