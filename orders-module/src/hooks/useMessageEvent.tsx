import { useEffect } from 'react';

import { MessageEventTypeEnum } from 'Enums/general';
import { CompleteOrderParamsType } from 'Types/order';
import useQueryParams from './useQueryParams';

const useMessageEvent = (
    messageCallback: (data: CompleteOrderParamsType) => Promise<void>,
    handleMessageEvent: (type: MessageEventTypeEnum) => void,
    showIframe: boolean
) => {
    const queryParams = useQueryParams();

    useEffect(() => {
        window.addEventListener(
            'message',
            async (event) => {
                // Vipps handler
                if (event.data.type === MessageEventTypeEnum.VIPPS_COMPLETE) {
                    await messageCallback({
                        orderId: event.data.orderId || '',
                        agreementId: event.data.agreementId || '',
                    });
                }

                // SwedbankPay handler
                if (event.data.type === MessageEventTypeEnum.COMPLETE) {
                    await messageCallback({
                        orderId: event.data.orderId || '',
                        agreementId: event.data.agreementId || '',
                    });
                }
                if (event.data.type === MessageEventTypeEnum.CANCEL) {
                    handleMessageEvent(event.data.type);
                }
            },
            false
        );
    }, []);

    // Vipps
    useEffect(() => {
        if (
            queryParams.get('orderId') &&
            queryParams.get('agreementId') &&
            top &&
            window !== top
        ) {
            top?.postMessage(
                {
                    type: MessageEventTypeEnum.VIPPS_COMPLETE,
                    orderId: queryParams.get('orderId'),
                    agreementId: queryParams.get('agreementId'),
                },
                top?.location?.origin || '*'
            );
        }
    }, [queryParams.get('orderId'), queryParams.get('agreementId')]);

    //Vipps
    useEffect(() => {
        if (
            queryParams.get('orderId') &&
            queryParams.get('agreementId') &&
            !showIframe
        ) {
            messageCallback({
                orderId: queryParams.get('orderId') || '',
                agreementId: queryParams.get('agreementId') || '',
            });
        }
    }, [
        queryParams.get('orderId'),
        queryParams.get('agreementId'),
        showIframe,
    ]);

    // SwedbankPay
    useEffect(() => {
        if (
            queryParams.get('action') &&
            queryParams.get('S4OrderId') &&
            queryParams.get('TransactionId') &&
            top &&
            window !== top
        ) {
            top?.postMessage(
                {
                    type: queryParams.get('action'),
                    orderId: queryParams.get('S4OrderId'),
                    agreementId: queryParams.get('TransactionId'),
                },
                top?.location?.origin || '*'
            );
        }
    }, [
        queryParams.get('OrderId'),
        queryParams.get('TransactionId'),
        queryParams.get('action'),
    ]);

    // SwedbankPay
    useEffect(() => {
        if (
            queryParams.get('S4OrderId') &&
            queryParams.get('TransactionId') &&
            queryParams.get('action') === MessageEventTypeEnum.COMPLETE &&
            !showIframe
        ) {
            messageCallback({
                orderId: queryParams.get('S4OrderId') || '',
                agreementId: queryParams.get('TransactionId') || '',
            });
        }

        if (
            queryParams.get('action') === MessageEventTypeEnum.CANCEL &&
            !showIframe
        ) {
            handleMessageEvent(
                queryParams.get('action') as MessageEventTypeEnum
            );
        }
    }, [
        queryParams.get('action'),
        queryParams.get('S4OrderId'),
        queryParams.get('TransactionId'),
        showIframe,
    ]);
};

export default useMessageEvent;
