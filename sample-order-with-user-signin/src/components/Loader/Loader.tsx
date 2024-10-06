import { FC } from 'react';

import './loader.scss';

type Props = {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    dark?: boolean;
};

const Loader: FC<Props> = ({ className = '', size = 'sm', dark = false }) => {
    return (
        <div
            data-testid="sdk-loader-id"
            className={`sdk-loader ${className} size-${size} ${
                dark ? 'dark-color' : ''
            }`}
        />
    );
};

export default Loader;
