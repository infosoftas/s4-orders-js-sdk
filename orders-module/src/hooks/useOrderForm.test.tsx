// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { orderStart } from '../api/OrdersApi';
import { PaymentMethodEnum } from '../enums/general';
import useOrderForm from './useOrderForm';

vi.mock('../api/OrdersApi', () => ({ orderStart: vi.fn() }));
vi.mock('../api/SubscribeApi', () => ({ createSubscriber: vi.fn() }));
vi.mock('../api/InvoiceApi', () => ({ invoiceLookup: vi.fn() }));

const renderOrderForm = (
    submitStartCallback: (id: string) => void | Promise<void>,
    callback = vi.fn()
) =>
    renderHook(() =>
        useOrderForm({
            callback,
            submitStartCallback,
            templatePackageId: 'template-1',
            subscriberId: 'subscriber-1',
            organizationId: 'organization-1',
            language: 'en-US',
            merchantAgreementUrl: 'https://shop.example.test/terms',
            orderFields: [],
            invoiceOrderFields: [],
        })
    );

const submit = (result: ReturnType<typeof renderOrderForm>['result']) =>
    act(() =>
        result.current.orderSubmit({
            paymentMethod: PaymentMethodEnum.SwedbankPay,
        })
    );

describe('useOrderForm submitStartCallback', () => {
    beforeEach(() => {
        vi.mocked(orderStart).mockResolvedValue({
            id: 'order-1',
            terminalRedirectUrl: 'https://pay.example.test/terminal',
        } as Awaited<ReturnType<typeof orderStart>>);
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.restoreAllMocks();
        window.history.replaceState({}, '', '/');
    });

    it('waits for an async callback so its hashToken reaches the return URLs', async () => {
        const { result } = renderOrderForm(async () => {
            await new Promise((resolve) => setTimeout(resolve, 20));
            window.history.replaceState({}, '', '/?hashToken=protected');
        });

        await submit(result);

        const { paymentAgreement } = vi.mocked(orderStart).mock.calls[0][0];
        const { completeUrl, cancelUrl } = paymentAgreement.swedbankPay ?? {};
        expect(new URL(completeUrl as string).searchParams.get('hashToken')).toBe(
            'protected'
        );
        expect(new URL(cancelUrl as string).searchParams.get('hashToken')).toBe(
            'protected'
        );
    });

    it('does not start the payment when the callback rejects', async () => {
        const callback = vi.fn();
        const { result } = renderOrderForm(
            () => Promise.reject(new Error('token failed')),
            callback
        );

        await submit(result);

        expect(orderStart).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(null);
        expect(result.current.loading).toBe(false);
    });
});
