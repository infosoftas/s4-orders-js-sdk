import { useEffect, useRef } from 'react';

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

// Temporary, remove in the next release: checkouts started on the previous
// version open SwedbankPay in an iframe, so the provider returns inside that
// frame. A framed SDK renders nothing and no longer notifies the parent, so
// hand the return to the top-level page, which then handles it once.
const breakOutOfLegacyPaymentFrame = (): boolean => {
    if (!window.top || window.top === window) {
        return false;
    }
    try {
        if (window.top.location.origin !== window.location.origin) {
            return false;
        }
        window.top.location.replace(window.location.href);
        return true;
    } catch {
        return false;
    }
};

const usePaymentReturn = (
    onPaymentComplete: (data: CompleteOrderParamsType) => Promise<void>,
    onPaymentCancel: (orderId?: string) => void,
    orderInfo: OrderInfoType | null
) => {
    const queryParams = useQueryParams();
    const isBreakingOut = useRef(false);
    const hasPaymentReturn =
        queryParams.get('action') === PaymentReturnActionEnum.COMPLETE ||
        queryParams.get('action') === PaymentReturnActionEnum.CANCEL ||
        (!!queryParams.get('orderId') && !!queryParams.get('agreementId'));

    useEffect(() => {
        if (hasPaymentReturn) {
            isBreakingOut.current = breakOutOfLegacyPaymentFrame();
        }
    }, [hasPaymentReturn]);

    // Vipps / MobilePay
    useEffect(() => {
        if (isBreakingOut.current) {
            return;
        }
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
        if (isBreakingOut.current) {
            return;
        }
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
        if (isBreakingOut.current) {
            return;
        }
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
