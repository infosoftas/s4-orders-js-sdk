import React, { FC, useState } from 'react';

import { createOrder } from 'API/OrdersApi';
import './mainForm.scss';

type Props = {
    companyName: string;
};

export const MainForm: FC<Props> = ({ companyName = '' }) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await createOrder();
            if (response.data.terminalRedirectUrl) {
                window.location.href = response.data.terminalRedirectUrl;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="sdkOrderForm" onSubmit={handleSubmit}>
            <h2>Hi, {companyName}</h2>

            {!isConfirmed && (
                <>
                    <div>
                        <input
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!email || loading}
                        onClick={handleSubmit}
                    >
                        Next
                    </button>
                </>
            )}
            {isConfirmed && <h2>Congratulation, you type "{email}"!</h2>}
        </form>
    );
};
