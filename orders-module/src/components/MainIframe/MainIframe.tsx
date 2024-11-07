import { FC, useEffect, useState } from 'react';

import useIframe from 'Hooks/useIframe';

type Props = {
    iframeSrc: string | null;
};

const MainIframe: FC<Props> = ({ iframeSrc }) => {
    const [loading, setLoading] = useState(false);

    const { frameRef, messageReceiver } = useIframe();

    useEffect(() => {
        if (frameRef && iframeSrc) {
            setLoading(true);
            frameRef?.current &&
                (frameRef?.current as HTMLIFrameElement).addEventListener(
                    'load',
                    () => {
                        setLoading(false);
                    }
                );
            messageReceiver();
        }
    }, [frameRef, iframeSrc]);

    return (
        <div className="sdk-iframe-wrapper" data-testid="sdk-iframe-id">
            {loading && <div>... Loading</div>}
            {iframeSrc && (
                <iframe
                    ref={frameRef}
                    src={iframeSrc}
                    style={{ minHeight: '830px', width: '100%' }}
                ></iframe>
            )}
        </div>
    );
};

export default MainIframe;
