import type { FC, MouseEvent } from 'react';

import { Button as UIButton } from '../ui/button';
import { Spinner } from '../ui/spinner';

type Props = {
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
    btnType?: 'primary' | 'default';
    buttonText?: string;
    loading?: boolean;
    disable?: boolean;
    className?: string;
};

const Button: FC<Props> = ({
    onClick,
    type = 'button',
    btnType = 'primary',
    buttonText = 'Start',
    loading = false,
    disable = false,
    className,
}) => (
    <UIButton
        data-testid="sdk-button-id"
        type={type}
        variant={btnType === 'primary' ? 'default' : 'ghost'}
        disabled={loading || disable}
        aria-busy={loading || undefined}
        className={className}
        onClick={onClick}
    >
        {loading && <Spinner data-icon="inline-start" />}
        {buttonText}
    </UIButton>
);

export default Button;
