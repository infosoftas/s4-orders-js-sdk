// @vitest-environment jsdom

import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { orderComplete, orderDelete } from './api/OrdersApi';
import { MessageEventTypeEnum } from './enums/general';
import type { OrderInfoType } from './types/order';

vi.mock('./api/OrdersApi', () => ({
    orderComplete: vi.fn(),
    orderDelete: vi.fn(),
}));

vi.mock('./components/OrderForm/OrderForm', () => ({
    default: ({
        callback,
    }: {
        callback: (url: string | null, data?: OrderInfoType | null) => void;
    }) => (
        <button
            type="button"
            onClick={() =>
                callback(null, {
                    orderId: 'order-42',
                    paymentMethod: 'SwedbankPay',
                    subscriberId: 'subscriber-7',
                })
            }
        >
            Set order information
        </button>
    ),
}));

const settings = {
    successText: 'Order request accepted',
    failureText: 'Order request failed',
};

const renderApp = (props: Record<string, unknown> = {}) =>
    render(
        <App
            apiKey="test-key"
            domElementId="sdk-order"
            templatePackageId="template-1"
            subscriberId=""
            userId=""
            identityProviderId=""
            organizationId="organization-1"
            settings={settings}
            {...props}
        />
    );

const completePaymentReturn = () => {
    window.dispatchEvent(
        new MessageEvent('message', {
            data: {
                type: MessageEventTypeEnum.COMPLETE,
                orderId: 'order-42',
                agreementId: 'agreement-3',
            },
        })
    );
};

const completionMessages = () =>
    vi
        .mocked(window.postMessage)
        .mock.calls.map(([message]) => message as { type?: string })
        .filter(
            (message) =>
                message.type === MessageEventTypeEnum.ORDER_FLOW_COMPLETE
        );

describe('order completion', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        window.history.replaceState({}, '', '/');
        vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    it('shows success and emits the existing completion event for InProgress', async () => {
        vi.mocked(orderComplete).mockResolvedValue({
            id: 'order-42',
            status: 'InProgress',
        } as unknown as Awaited<ReturnType<typeof orderComplete>>);

        renderApp({ userId: 'user-9', identityProviderId: 'identity-2' });
        fireEvent.click(
            screen.getByRole('button', { name: 'Set order information' })
        );
        completePaymentReturn();

        expect(await screen.findByText('Order request accepted')).toBeTruthy();
        expect(orderComplete).toHaveBeenCalledWith('order-42', {
            userId: 'user-9',
            identityProviderId: 'identity-2',
        });
        expect(completionMessages()).toHaveLength(1);
        expect(completionMessages()[0]).toMatchObject({
            isCompleted: true,
            orderInfo: {
                orderId: 'order-42',
                paymentMethod: 'SwedbankPay',
                subscriberId: 'subscriber-7',
            },
        });
    });

    it('shows success and emits completion when the successful response is empty', async () => {
        vi.mocked(orderComplete).mockResolvedValue(
            null as unknown as Awaited<ReturnType<typeof orderComplete>>
        );

        renderApp();
        fireEvent.click(
            screen.getByRole('button', { name: 'Set order information' })
        );
        completePaymentReturn();

        expect(await screen.findByText('Order request accepted')).toBeTruthy();
        expect(orderComplete).toHaveBeenCalledWith('order-42', undefined);
        expect(completionMessages()).toHaveLength(1);
    });

    it('preserves validation errors and returns to the order form on failure', async () => {
        vi.mocked(orderComplete).mockRejectedValue({
            status: 400,
            message: 'One or more validation errors occurred.',
            errors: { email: ['Email is invalid.'] },
        });
        const userActionCallback = vi.fn();

        renderApp({ userActionCallback });
        fireEvent.click(
            screen.getByRole('button', { name: 'Set order information' })
        );
        completePaymentReturn();

        expect(
            await screen.findByText('One or more validation errors occurred.')
        ).toBeTruthy();
        expect(screen.getByText('Email is invalid.')).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Set order information' })
        ).toBeTruthy();
        expect(userActionCallback).toHaveBeenCalledWith('selectForm', {
            form: 'order',
        });
        expect(completionMessages()).toHaveLength(0);
    });

    it('keeps the Vipps conflict cancellation path', async () => {
        vi.mocked(orderComplete).mockRejectedValue({
            status: 409,
            message: 'Payment conflict',
        });
        vi.mocked(orderDelete).mockResolvedValue(
            null as unknown as Awaited<ReturnType<typeof orderDelete>>
        );
        const cancelVippsCallback = vi.fn();
        window.history.replaceState(
            {},
            '',
            '/?orderId=order-42&agreementId=agreement-3'
        );

        renderApp({ cancelVippsCallback });

        await waitFor(() => {
            expect(orderDelete).toHaveBeenCalledWith('order-42');
        });
        expect(cancelVippsCallback).toHaveBeenCalledOnce();
        expect(
            vi
                .mocked(window.postMessage)
                .mock.calls.map(([message]) => message as { type?: string })
        ).toContainEqual(
            expect.objectContaining({
                type: MessageEventTypeEnum.ORDER_FLOW_CANCEL,
                isCanceled: true,
            })
        );
        expect(completionMessages()).toHaveLength(0);
    });
});
