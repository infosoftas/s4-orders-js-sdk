import { useRef } from 'react';

let currentMessageReceiver: (event: Event) => void;

const useIframe = () => {
    const frameRef = useRef(null);

    const messageReceiver = (
        callback?: (type: string, value: string) => void
    ) => {
        if (currentMessageReceiver) {
            window.removeEventListener('message', currentMessageReceiver);
        }

        currentMessageReceiver = (event: Event) => {
            if (!frameRef.current) {
                return;
            }

            const childWindow = (frameRef.current as HTMLIFrameElement)
                .contentWindow;

            if ((event as MessageEvent).source !== childWindow) {
                return; // Skip message in this event listener
            }

            let { value, type } = (event as MessageEvent).data as unknown as {
                value: string;
                type: string;
            };

            if (callback) {
                callback(type, value);
            }
        };

        window.addEventListener('message', currentMessageReceiver, false);

        return () => {
            removeMessageReceiver();
        };
    };

    const removeMessageReceiver = () => {
        if (currentMessageReceiver) {
            window.removeEventListener(
                'addEventListener',
                currentMessageReceiver
            );
        }
    };

    return {
        frameRef,
        messageReceiver,
    };
};

export default useIframe;
