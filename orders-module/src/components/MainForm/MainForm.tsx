import React, { FC, useState } from 'react';

import { orderStart } from 'API/OrdersApi';
import Loader from 'Component/Loader/Loader';

import './mainForm.scss';

type Props = {
    callback: (url: string | null) => void;
    buttonText?: string;
    templatePackageId?: string;
    subscriberId?: string;
    tenantId?: string;
    organizationId?: string;
    redirectUrl?: string;
    showIframe?: boolean;
};

const MainForm: FC<Props> = ({
    callback,
    templatePackageId,
    subscriberId,
    tenantId,
    organizationId,
    showIframe,
    redirectUrl,
    buttonText = 'Start',
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>('');

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await orderStart({
                templatePackageId,
                subscriberId,
                tenantId,
                organizationId,
                phoneNumber: phone,
                redirectUrl: showIframe
                    ? window.location.toString()
                    : redirectUrl || window.location.toString(),
            });
            if (response.url) {
                callback(response.url);
                return;
            }
            callback(null);
        } catch (error) {
            console.error(error);
            callback(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="sdkOrderForm" onSubmit={handleSubmit}>
            <div>
                <input
                    name="phoneNUmber"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className={`${loading ? 'loading' : ''}`}
                onClick={handleSubmit}
            >
                {loading ? <Loader className="btn-loader" /> : buttonText}
            </button>
        </form>
    );
};

export default MainForm;
