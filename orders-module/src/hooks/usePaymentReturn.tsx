import { useEffect } from 'react';

import { PaymentMethodEnum, PaymentReturnActionEnum } from '../enums/general';
import type { CompleteOrderParamsType, OrderInfoType } from '../types/order';
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

const usePaymentReturn = (
    onPaymentComplete: (data: CompleteOrderParamsType) => Promise<void>,
    onPaymentCancel: (orderId?: string) => void,
    orderInfo: OrderInfoType | null
) => {
    const queryParams = useQueryParams();

    // Vipps / MobilePay
    useEffect(() => {
        if (queryParams.get('orderId') && queryParams.get('agreementId')) {
            onPaymentComplete({
                orderId: queryParams.get('orderId') || '',
                agreementId: queryParams.get('agreementId') || '',
                orderInfo: orderInfo || null,
                paymentMethod: PaymentMethodEnum.Vipps,
            });
        }
    }, [queryParams.get('orderId'), queryParams.get('agreementId')]);

    // SwedbankPay completion, and cancellation for every redirect provider
    useEffect(() => {
        if (
            queryParams.get('S4OrderId') &&
            queryParams.get('TransactionId') &&
            queryParams.get('action') === PaymentReturnActionEnum.COMPLETE
        ) {
            onPaymentComplete({
                orderId: queryParams.get('S4OrderId') || '',
                agreementId: queryParams.get('TransactionId') || '',
                orderInfo: orderInfo || null,
            });
        }

        if (queryParams.get('action') === PaymentReturnActionEnum.CANCEL) {
            const cancelOrderId =
                queryParams.get('S4OrderId') || takeStoredMollieOrderId();
            onPaymentCancel(cancelOrderId || undefined);
        }
    }, [
        queryParams.get('action'),
        queryParams.get('S4OrderId'),
        queryParams.get('TransactionId'),
    ]);

    // Mollie: a completion return with no TransactionId (that one is SwedbankPay's).
    useEffect(() => {
        if (
            queryParams.get('action') !== PaymentReturnActionEnum.COMPLETE ||
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

        onPaymentComplete({
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

export default usePaymentReturn;
