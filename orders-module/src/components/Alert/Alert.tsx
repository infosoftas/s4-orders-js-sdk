import type { FC } from 'react';

import { Alert as UIAlert, AlertDescription } from '../ui/alert';

type Props = {
    msg?: string;
    type?: 'danger' | 'success';
    className?: string;
};

const Alert: FC<Props> = ({ msg, type = 'danger', className }) => {
    return msg ? (
        <UIAlert
            variant={type === 'danger' ? 'destructive' : 'default'}
            className={className}
            data-testid="sdk-alert-id"
        >
            <AlertDescription>{msg}</AlertDescription>
        </UIAlert>
    ) : null;
};

export default Alert;
