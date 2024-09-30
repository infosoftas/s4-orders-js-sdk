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
            className={`sdk-loader ${className} size-${size} ${
                dark ? 'dark-color' : ''
            }`}
        ></div>
    );
};

export default Loader;
