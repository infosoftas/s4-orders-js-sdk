import { useEffect, useCallback } from 'react';

import { MessageEventTypeEnum, PaymentMethodEnum } from '../enums/general';
import { CompleteOrderParamsType, OrderInfoType } from '../types/order';
import useQueryParams from './useQueryParams';

const useMessageEvent = (
    messageCallback: (data: CompleteOrderParamsType) => Promise<void>,
    handleMessageEvent: (type: MessageEventTypeEnum) => void,
    showIframe: boolean,
    orderInfo: OrderInfoType | null
) => {
    const queryParams = useQueryParams();

    const handleMessage = useCallback(
        async (event: MessageEvent) => {
            // Vipps handler
            if (event.data.type === MessageEventTypeEnum.VIPPS_COMPLETE) {
                await messageCallback({
                    orderId: event.data.orderId || '',
                    agreementId: event.data.agreementId || '',
                    orderInfo: orderInfo || null,
                });
            }

            // SwedbankPay handler
            if (event.data.type === MessageEventTypeEnum.COMPLETE) {
                await messageCallback({
                    orderId: event.data.orderId || '',
                    agreementId: event.data.agreementId || '',
                    orderInfo: orderInfo || null,
                });
            }
            if (event.data.type === MessageEventTypeEnum.CANCEL) {
                handleMessageEvent(event.data.type);
            }
        },
        [orderInfo]
    );

    useEffect(() => {
        window.addEventListener('message', handleMessage, false);

        return () => {
            window.removeEventListener('message', handleMessage, false);
        };
    }, [handleMessage]);

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
            queryParams.get('agreementId')
            // !showIframe
        ) {
            messageCallback({
                orderId: queryParams.get('orderId') || '',
                agreementId: queryParams.get('agreementId') || '',
                orderInfo: orderInfo || null,
                paymentMethod: PaymentMethodEnum.Vipps,
            });
        }
    }, [
        queryParams.get('orderId'),
        queryParams.get('agreementId'),
        // showIframe,
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
        queryParams.get('S4OrderId'),
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
                orderInfo: orderInfo || null,
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
