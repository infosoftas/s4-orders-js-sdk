import { FC } from 'react';

import './alert.scss';

type Props = {
    msg?: string;
    type?: 'danger' | 'success';
    className?: string;
};

const Alert: FC<Props> = ({ msg, type = 'danger', className = '' }) => {
    return msg ? (
        <div
            className={`sdk-alert ${type} ${className}`}
            data-testid="sdk-alert-id"
        >
            {msg}
        </div>
    ) : null;
};

export default Alert;
