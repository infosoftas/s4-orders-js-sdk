import React, { ChangeEvent, FC, useState } from 'react';

import { orderStart } from 'API/OrdersApi';
import Loader from 'Component/Loader/Loader';
import { WRONG_MSG } from 'Constants/index';

import './mainForm.scss';

type Props = {
    callback: (url: string | null) => void;
    templatePackageId: string;
    subscriberId: string;
    tenantId: string;
    organizationId: string;
    redirectUrl: string;
    buttonText?: string;
};

const MainForm: FC<Props> = ({
    callback,
    templatePackageId,
    subscriberId,
    tenantId,
    organizationId,
    redirectUrl,
    buttonText = 'Start',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();
        setApiErrorMsg('');

        if (!isValidPhone(phone)) {
            setErrorMsg('Please enter a valid phone number.');
            return;
        }

        setLoading(true);
        try {
            const response = await orderStart({
                templatePackageId,
                subscriberId,
                tenantId,
                organizationId,
                redirectUrl,
                phoneNumber: phone,
            });
            if (response.url) {
                callback(response.url);
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
        setErrorMsg('');
        const phoneNumber = e.target.value.trim();
        setPhone(phoneNumber);
    };

    return (
        <form className="sdkOrderForm" onSubmit={handleSubmit}>
            <div className="field-wrapper">
                <input
                    className="input-control"
                    type="tel"
                    name="phoneNUmber"
                    value={phone}
                    onChange={handlePhoneNumberChange}
                />
                {errorMsg && (
                    <div className="text-error caption">{errorMsg}</div>
                )}
            </div>
            <button
                type="submit"
                disabled={loading}
                className={`${loading ? 'loading' : ''}`}
                onClick={handleSubmit}
            >
                {loading ? <Loader className="btn-loader" /> : buttonText}
            </button>
            {apiErrorMsg && (
                <div className="text-error caption">{apiErrorMsg}</div>
            )}
        </form>
    );
};

export default MainForm;
