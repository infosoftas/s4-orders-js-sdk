import { useEffect, useCallback } from 'react';

import { MessageEventTypeEnum, PaymentMethodEnum } from '../enums/general';
import { CompleteOrderParamsType, OrderInfoType } from '../types/order';
import useQueryParams from './useQueryParams';

const MOLLIE_ORDER_TTL_MS = 20 * 60 * 1000;

// Reads and consumes the persisted Mollie order id. The key is always removed:
// the return leg gets one chance to use it, whether or not it is still valid.
const takeStoredMollieOrderId = (): string | null => {
    const raw = sessionStorage.getItem('mollieOrderId');
    if (!raw) {
        return null;
    }

    sessionStorage.removeItem('mollieOrderId');

    try {
        const { id, ts } = JSON.parse(raw) as { id: string; ts: number };

        return Date.now() - ts <= MOLLIE_ORDER_TTL_MS ? id : null;
    } catch {
        return null;
    }
};

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
            sessionStorage.removeItem('mollieOrderId');
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

    // Mollie: a completion return with no TransactionId (that one is SwedbankPay's).
    useEffect(() => {
        if (
            queryParams.get('action') !== MessageEventTypeEnum.COMPLETE ||
            queryParams.get('TransactionId')
        ) {
            return;
        }

        const s4OrderId = queryParams.get('S4OrderId');
        const storedOrderId = takeStoredMollieOrderId();
        const mollieOrderId = s4OrderId || storedOrderId;
        if (!mollieOrderId) {
            return;
        }

        messageCallback({
            orderId: mollieOrderId,
            agreementId: '',
            orderInfo: orderInfo || null,
        });
    }, [
        queryParams.get('action'),
        queryParams.get('S4OrderId'),
        queryParams.get('TransactionId'),
    ]);
};

export default useMessageEvent;
