import { FC } from 'react';

import './loader.scss';

type Props = {
    className?: string;
};

const Loader: FC<Props> = ({ className = '' }) => {
    return <div className={`sdk-loader ${className}`}></div>;
};

export default Loader;
