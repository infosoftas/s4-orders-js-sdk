import React, { FC, useState, useEffect } from 'react';

import useQueryParams from 'Hooks/useQueryParams';
import { createOrder } from 'API/OrdersApi';
import './mainForm.scss';

type Props = {
    companyName: string;
};

export const MainForm: FC<Props> = ({ companyName = '' }) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [isFailed, setIsFailed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const queryParams = useQueryParams();

    useEffect(() => {
        const status = queryParams.get('status');
        if (status === 'complete') {
            setIsConfirmed(true);
        } else if (status === 'fail') {
            setIsFailed(true);
        }
    }, [queryParams.get('status')]);

    const handleSubmit = async (
        event: React.FormEvent<HTMLElement>
    ): Promise<void> => {
        event.preventDefault();
        setLoading(true);
        setIsFailed(false);
        setIsConfirmed(false);
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
            {isConfirmed && !isFailed && (
                <h2>Congratulation, you type "{email}"!</h2>
            )}
            {!isConfirmed && isFailed && (
                <h2 className="error">Wrong "{email}", try again!</h2>
            )}
        </form>
    );
};
