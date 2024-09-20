import React, { FC, useState } from 'react';

import './mainForm.scss';

type Props = {
    companyName: string;
};

export const MainForm: FC<Props> = ({ companyName = '' }) => {
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');

    const handleSubmit = (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        setIsConfirmed(true);
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
                        disabled={!email}
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
