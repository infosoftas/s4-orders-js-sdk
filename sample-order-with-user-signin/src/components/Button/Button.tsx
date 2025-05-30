import { FC, MouseEvent } from 'react';

import Loader from 'Component/Loader/Loader';

import './button.scss';

type Props = {
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
    type?: 'submit' | 'button' | 'reset';
    btnType?: 'primary';
    buttonText?: string;
    loading?: boolean;
    disable?: boolean;
};

const Button: FC<Props> = ({
    onClick,
    type = 'button',
    btnType = 'primary',
    buttonText = 'Start',
    loading = false,
    disable = false,
}) => {
    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
    };

    return (
        <button
            data-testid="sdk-button-id"
            type={type}
            disabled={loading || disable}
            className={`sdk-btn ${btnType ? `${btnType}-btn` : ''} ${
                loading ? 'loading' : ''
            }`}
            onClick={handleClick}
        >
            {loading ? <Loader className="btn-loader" /> : buttonText}
        </button>
    );
};

export default Button;
