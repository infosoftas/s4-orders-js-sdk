import { useEffect } from 'react';

import { CompleteOrderParamsType } from 'Types/general';
import useQueryParams from './useQueryParams';

const COMPLETE_EVENT_TYPE = 'completeOrder';

const useMessageEvent = (
    messageCallback: (data: CompleteOrderParamsType) => Promise<void>
) => {
    const queryParams = useQueryParams();

    useEffect(() => {
        window.addEventListener(
            'message',
            async (event) => {
                if (event.data.type === COMPLETE_EVENT_TYPE) {
                    await messageCallback({
                        orderId: event.data.orderId || '',
                        agreementId: event.data.agreementId || '',
                    });
                }
            },
            false
        );
    }, []);

    useEffect(() => {
        if (
            queryParams.get('orderId') &&
            queryParams.get('agreementId') &&
            top &&
            window !== top
        ) {
            top?.postMessage(
                {
                    type: COMPLETE_EVENT_TYPE,
                    orderId: queryParams.get('orderId'),
                    agreementId: queryParams.get('agreementId'),
                },
                top?.location?.origin || '*'
            );
        }
    }, [queryParams.get('orderId'), queryParams.get('agreementId')]);
};

export default useMessageEvent;
