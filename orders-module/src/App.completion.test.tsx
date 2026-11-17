// @vitest-environment jsdom

import {
    act,
    cleanup,
    fireEvent,
    render,
    screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App';
import { MessageEventTypeEnum } from './enums/general';
import type { ConfigType } from './types/general';
import type { OrderInfoType } from './types/order';

vi.mock('./components/OrderForm/OrderForm', () => ({
    default: ({
        callback,
    }: {
        callback: (url: string | null, data: OrderInfoType) => void;
    }) => (
        <button
            onClick={() =>
                callback(null, {
                    orderId: 'invoice-order',
                    paymentMethod: 'Invoice',
                    subscriberId: 'subscriber-7',
                })
            }
        >
            Submit invoice
        </button>
    ),
}));

const response = (body: unknown, status = 200, headers?: HeadersInit) =>
    new Response(JSON.stringify(body), { status, headers });

const fetchMock = vi.fn<typeof fetch>();
const settings = {
    successText: 'Order completed',
    failureText: 'Order failed',
    orderProcessingText: 'Processing order',
    orderReceivedText: 'Order received',
    orderDelayedText: 'Order received, taking longer than expected',
};

const renderApp = (props: Partial<ConfigType> = {}) =>
    render(
        <App
            apiKey="tenant-key"
            apiUrl="https://orders.example.test"
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

const paymentReturn = () =>
    window.dispatchEvent(
        new MessageEvent('message', {
            data: {
                type: MessageEventTypeEnum.COMPLETE,
                orderId: 'returned-order',
                agreementId: 'agreement-3',
            },
        })
    );

const advance = async (ms = 0) => {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
};

const completionMessages = () =>
    vi
        .mocked(window.postMessage)
        .mock.calls.map(([message]) => message as { type?: string })
        .filter(
            (message) =>
                message.type === MessageEventTypeEnum.ORDER_FLOW_COMPLETE
        );

describe('SDK-managed order completion', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
        window.history.replaceState({}, '', '/');
        sessionStorage.clear();
        localStorage.clear();
        vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('waits for Completed and emits the exact submitted ID after a full redirect', async () => {
        fetchMock
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'InProgress' })
            )
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'InProgress' })
            )
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'Completed' })
            );
        const orderAcceptedCallback = vi.fn();
        renderApp({
            orderAcceptedCallback,
            userId: 'user-9',
            identityProviderId: 'identity-2',
        });
        act(paymentReturn);
        await advance();

        expect(screen.queryByText('Order completed')).toBeNull();
        expect(screen.getByText('Processing order')).toBeTruthy();
        expect(completionMessages()).toHaveLength(0);
        expect(orderAcceptedCallback).toHaveBeenCalledWith({
            orderId: 'returned-order',
            orderInfo: null,
        });
        expect(fetchMock.mock.calls[0][0]).toBe(
            'https://orders.example.test/order/returned-order/complete'
        );
        expect(JSON.parse(fetchMock.mock.calls[0][1]?.body as string)).toEqual({
            userId: 'user-9',
            identityProviderId: 'identity-2',
        });
        expect(fetchMock.mock.calls[1][0]).toBe(
            'https://orders.example.test/order/returned-order'
        );
        expect(
            new Headers(fetchMock.mock.calls[1][1]?.headers).get(
                'S4-ORDERS-API-KEY'
            )
        ).toBe('tenant-key');
        await advance(499);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        await advance(1);
        expect(screen.getByText('Order completed')).toBeTruthy();
        expect(completionMessages()).toEqual([
            expect.objectContaining({
                orderId: 'returned-order',
                isCompleted: true,
                orderInfo: null,
            }),
        ]);
    });

    it('shows received-but-delayed at ten seconds without success, resubmission or further reads', async () => {
        fetchMock.mockImplementation(async (_url, init) =>
            response({
                id: 'returned-order',
                status: init?.method === 'POST' ? 'Completed' : 'InProgress',
            })
        );
        const orderCompletionDelayedCallback = vi.fn();
        renderApp({ orderCompletionDelayedCallback });
        act(paymentReturn);
        await advance(9999);
        expect(
            screen.queryByText('Order received, taking longer than expected')
        ).toBeNull();
        await advance(1);
        expect(
            screen.getByText('Order received, taking longer than expected')
        ).toBeTruthy();
        expect(
            screen.queryByRole('button', { name: 'Submit invoice' })
        ).toBeNull();
        expect(orderCompletionDelayedCallback).toHaveBeenCalledExactlyOnceWith({
            orderId: 'returned-order',
            orderInfo: null,
            reason: 'timeout',
        });
        expect(completionMessages()).toHaveLength(0);
        const calls = fetchMock.mock.calls.length;
        await advance(20000);
        act(paymentReturn);
        await advance();
        expect(fetchMock).toHaveBeenCalledTimes(calls);
    });

    it('bounds a hung status read and ignores its eventual Completed response', async () => {
        let finish!: (value: Response) => void;
        fetchMock.mockResolvedValueOnce(response(null)).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                })
        );
        const orderCompletionDelayedCallback = vi.fn();
        renderApp({ orderCompletionDelayedCallback });
        act(paymentReturn);
        await advance();
        await advance(10000);
        expect(
            screen.getByText('Order received, taking longer than expected')
        ).toBeTruthy();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock.mock.calls[1][1]?.signal?.aborted).toBe(true);
        await act(async () => {
            finish(response({ id: 'returned-order', status: 'Completed' }));
        });
        expect(screen.queryByText('Order completed')).toBeNull();
        expect(orderCompletionDelayedCallback).toHaveBeenCalledOnce();
        expect(completionMessages()).toHaveLength(0);
    });

    it('lets external mode receive acceptance without polling or announcing success', async () => {
        fetchMock.mockResolvedValueOnce(response(null));
        const orderAcceptedCallback = vi.fn();
        renderApp({ completionMode: 'external', orderAcceptedCallback });
        act(paymentReturn);
        await advance(20000);
        expect(orderAcceptedCallback).toHaveBeenCalledExactlyOnceWith({
            orderId: 'returned-order',
            orderInfo: null,
        });
        expect(screen.getByText('Order received')).toBeTruthy();
        expect(screen.queryByText('Order completed')).toBeNull();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(completionMessages()).toHaveLength(0);
    });

    it.each(['Cancelled', 'Rejected'])(
        'reports %s without success or reopening submission',
        async (status) => {
            fetchMock
                .mockResolvedValueOnce(response(null))
                .mockResolvedValueOnce(
                    response({ id: 'returned-order', status })
                );
            const orderCompletionFailedCallback = vi.fn();
            renderApp({ orderCompletionFailedCallback });
            act(paymentReturn);
            await advance(10000);
            expect(screen.getByText('Order failed')).toBeTruthy();
            expect(
                screen.queryByRole('button', { name: 'Submit invoice' })
            ).toBeNull();
            expect(
                orderCompletionFailedCallback
            ).toHaveBeenCalledExactlyOnceWith({
                orderId: 'returned-order',
                orderInfo: null,
                status,
            });
            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(completionMessages()).toHaveLength(0);
        }
    );

    it('does not overlap reads or repeat POST for duplicate payment returns', async () => {
        let finish!: (value: Response) => void;
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finish = resolve;
                    })
            )
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'Completed' })
            );
        renderApp();
        act(() => {
            paymentReturn();
            paymentReturn();
        });
        await advance(1500);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        await act(async () => {
            finish(response({ id: 'returned-order', status: 'InProgress' }));
        });
        await advance(499);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        await advance(1);
        expect(screen.getByText('Order completed')).toBeTruthy();
        act(paymentReturn);
        await advance();
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(completionMessages()).toHaveLength(1);
    });

    it('aborts on unmount without callbacks or a stale success event', async () => {
        let finish!: (value: Response) => void;
        fetchMock.mockResolvedValueOnce(response(null)).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                })
        );
        const orderCompletionDelayedCallback = vi.fn();
        const view = renderApp({ orderCompletionDelayedCallback });
        act(paymentReturn);
        await advance();
        view.unmount();
        expect(fetchMock.mock.calls[1][1]?.signal?.aborted).toBe(true);
        await act(async () => {
            finish(response({ id: 'returned-order', status: 'Completed' }));
        });
        await advance(10000);
        expect(orderCompletionDelayedCallback).not.toHaveBeenCalled();
        expect(completionMessages()).toHaveLength(0);
    });

    it('uses invoice submission ID and order information without requiring payment messages', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response({ id: 'invoice-order', status: 'Completed' })
            );
        renderApp();
        fireEvent.click(screen.getByRole('button', { name: 'Submit invoice' }));
        await advance();
        expect(screen.getByText('Order completed')).toBeTruthy();
        expect(completionMessages()).toEqual([
            expect.objectContaining({
                orderId: 'invoice-order',
                orderInfo: {
                    orderId: 'invoice-order',
                    subscriberId: 'subscriber-7',
                    paymentMethod: 'Invoice',
                },
            }),
        ]);
    });

    it('preserves POST validation failures without starting polling or acceptance callbacks', async () => {
        fetchMock.mockResolvedValueOnce(
            response(
                {
                    status: 400,
                    title: 'Invalid order',
                    errors: { email: ['Email is invalid'] },
                },
                400
            )
        );
        const orderAcceptedCallback = vi.fn();
        renderApp({ orderAcceptedCallback });
        act(paymentReturn);
        await advance();
        expect(screen.getByText('Invalid order')).toBeTruthy();
        expect(screen.getByText('Email is invalid')).toBeTruthy();
        expect(
            screen.getByRole('button', { name: 'Submit invoice' })
        ).toBeTruthy();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(orderAcceptedCallback).not.toHaveBeenCalled();
        expect(completionMessages()).toHaveLength(0);
    });

    it('preserves Vipps conflict cancellation', async () => {
        fetchMock
            .mockResolvedValueOnce(
                response({ status: 409, title: 'Payment conflict' }, 409)
            )
            .mockResolvedValueOnce(response(null));
        window.history.replaceState(
            {},
            '',
            '/?orderId=returned-order&agreementId=agreement-3'
        );
        const cancelVippsCallback = vi.fn();
        renderApp({ cancelVippsCallback });
        await advance();
        expect(cancelVippsCallback).toHaveBeenCalledOnce();
        expect(
            fetchMock.mock.calls.map(([, options]) => options?.method)
        ).toEqual(['POST', 'DELETE']);
        expect(completionMessages()).toHaveLength(0);
    });

    it('retries network, temporary 404 and 503 errors before confirming completion', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockRejectedValueOnce(new TypeError('Network unavailable'))
            .mockResolvedValueOnce(response({ title: 'Not visible yet' }, 404))
            .mockResolvedValueOnce(response({ title: 'Try later' }, 503))
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'Completed' })
            );
        renderApp();
        act(paymentReturn);
        await advance(1499);
        expect(completionMessages()).toHaveLength(0);
        await advance(1);
        expect(screen.getByText('Order completed')).toBeTruthy();
        expect(fetchMock).toHaveBeenCalledTimes(5);
    });

    it.each([
        ['seconds', '2'],
        ['HTTP date', new Date(Date.UTC(2026, 10, 16, 12, 0, 2)).toUTCString()],
    ])('honors Retry-After expressed as %s', async (_label, retryAfter) => {
        vi.setSystemTime(new Date(Date.UTC(2026, 10, 16, 12, 0, 0)));
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response(null, 429, { 'Retry-After': retryAfter })
            )
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'Completed' })
            );
        renderApp();
        act(paymentReturn);
        await advance(1999);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(completionMessages()).toHaveLength(0);
        await advance(1);
        expect(screen.getByText('Order completed')).toBeTruthy();
    });

    it('does not extend the deadline for a long Retry-After', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response(null, 429, { 'Retry-After': '60' })
            );
        const orderCompletionDelayedCallback = vi.fn();
        renderApp({ orderCompletionDelayedCallback });
        act(paymentReturn);
        await advance(10000);
        expect(
            screen.getByText('Order received, taking longer than expected')
        ).toBeTruthy();
        expect(orderCompletionDelayedCallback).toHaveBeenCalledOnce();
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(completionMessages()).toHaveLength(0);
    });

    it('does not retry a rate-limited read when Retry-After is unavailable to the browser', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(response(null, 429));
        renderApp();
        act(paymentReturn);
        await advance(9999);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        await advance(1);
        expect(
            screen.getByText('Order received, taking longer than expected')
        ).toBeTruthy();
        expect(completionMessages()).toHaveLength(0);
    });

    it.each(['-1', '1.5', '0x1'])(
        'does not retry a rate-limited read for invalid Retry-After %s',
        async (retryAfter) => {
            fetchMock
                .mockResolvedValueOnce(response(null))
                .mockResolvedValueOnce(
                    response(null, 429, { 'Retry-After': retryAfter })
                )
                .mockResolvedValueOnce(
                    response({ id: 'returned-order', status: 'Completed' })
                );
            const orderCompletionDelayedCallback = vi.fn();
            renderApp({ orderCompletionDelayedCallback });
            act(paymentReturn);
            await advance(9999);
            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(orderCompletionDelayedCallback).not.toHaveBeenCalled();
            await advance(1);
            expect(
                screen.getByText('Order received, taking longer than expected')
            ).toBeTruthy();
            expect(
                orderCompletionDelayedCallback
            ).toHaveBeenCalledExactlyOnceWith({
                orderId: 'returned-order',
                orderInfo: null,
                reason: 'timeout',
            });
            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(completionMessages()).toHaveLength(0);
        }
    );

    it.each([
        [401, 'Not JSON'],
        [403, 'Not JSON'],
        [400, 'Not JSON'],
        [400, 'null'],
    ] as const)(
        'stops status reads on HTTP %s (%s) without claiming order rejection',
        async (status, body) => {
            fetchMock
                .mockResolvedValueOnce(response(null))
                .mockResolvedValueOnce(new Response(body, { status }));
            const orderCompletionDelayedCallback = vi.fn();
            const orderCompletionFailedCallback = vi.fn();
            renderApp({
                orderCompletionDelayedCallback,
                orderCompletionFailedCallback,
            });
            act(paymentReturn);
            await advance(10000);
            expect(
                orderCompletionDelayedCallback
            ).toHaveBeenCalledExactlyOnceWith({
                orderId: 'returned-order',
                orderInfo: null,
                reason: 'statusUnavailable',
            });
            expect(
                screen.getByText('Order received, taking longer than expected')
            ).toBeTruthy();
            expect(orderCompletionFailedCallback).not.toHaveBeenCalled();
            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(completionMessages()).toHaveLength(0);
        }
    );

    it.each([
        null,
        { id: 'returned-order' },
        { id: 'returned-order', status: 'FutureStatus' },
        { id: 'different-order', status: 'Completed' },
    ])(
        'never treats an unknown or malformed status response as success: %j',
        async (body) => {
            fetchMock
                .mockResolvedValueOnce(response(null))
                .mockResolvedValueOnce(response(body));
            const orderCompletionDelayedCallback = vi.fn();
            renderApp({ orderCompletionDelayedCallback });
            act(paymentReturn);
            await advance(10000);
            expect(
                screen.getByText('Order received, taking longer than expected')
            ).toBeTruthy();
            expect(orderCompletionDelayedCallback).toHaveBeenCalledWith({
                orderId: 'returned-order',
                orderInfo: null,
                reason: 'statusUnavailable',
            });
            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(completionMessages()).toHaveLength(0);
        }
    );

    it('isolates host callback failures from accepted order state and polling', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'Completed' })
            );
        renderApp({
            orderAcceptedCallback: () => {
                throw new Error('Host callback error');
            },
            orderCompletedCallback: async () => {
                throw new Error('Async callback error');
            },
        });
        act(paymentReturn);
        await advance();
        expect(screen.getByText('Order completed')).toBeTruthy();
        expect(
            screen.queryByRole('button', { name: 'Submit invoice' })
        ).toBeNull();
        expect(completionMessages()).toHaveLength(1);
    });

    it('does not start status reads after acceptance callback unmounts SDK', async () => {
        fetchMock.mockResolvedValueOnce(response(null));
        let unmount!: () => void;
        const view = renderApp({ orderAcceptedCallback: () => unmount() });
        unmount = view.unmount;
        act(paymentReturn);
        await advance(10000);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(completionMessages()).toHaveLength(0);
    });

    it('ignores a pending POST response after unmount', async () => {
        let finish!: (value: Response) => void;
        fetchMock.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                })
        );
        const orderAcceptedCallback = vi.fn();
        const view = renderApp({ orderAcceptedCallback });
        act(paymentReturn);
        view.unmount();
        await act(async () => {
            finish(response(null));
        });
        await advance(10000);
        expect(orderAcceptedCallback).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(completionMessages()).toHaveLength(0);
    });

    it('ignores an old status response after cancelling and starting another order', async () => {
        let finish!: (value: Response) => void;
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        finish = resolve;
                    })
            )
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response({ id: 'invoice-order', status: 'Completed' })
            );
        renderApp();
        act(paymentReturn);
        await advance();
        act(() =>
            window.dispatchEvent(
                new MessageEvent('message', {
                    data: { type: MessageEventTypeEnum.CANCEL },
                })
            )
        );
        await advance();
        expect(fetchMock.mock.calls[1][1]?.signal?.aborted).toBe(true);
        expect(fetchMock.mock.calls[2][0]).toBe(
            'https://orders.example.test/order/returned-order'
        );
        expect(fetchMock.mock.calls[2][1]?.method).toBe('DELETE');
        fireEvent.click(screen.getByRole('button', { name: 'Submit invoice' }));
        await advance();
        await act(async () => {
            finish(response({ id: 'returned-order', status: 'Completed' }));
        });
        expect(completionMessages()).toEqual([
            expect.objectContaining({ orderId: 'invoice-order' }),
        ]);
        expect(screen.getByText('Order completed')).toBeTruthy();
    });

    it('shows a useful delayed message even when settings contain no custom polling text', async () => {
        fetchMock.mockImplementation(async () =>
            response({ id: 'returned-order', status: 'InProgress' })
        );
        renderApp({ settings: {} });
        act(paymentReturn);
        await advance(10000);
        expect(screen.getByRole('status').textContent).toContain(
            'Your order was received, but things are taking longer than expected.'
        );
        expect(completionMessages()).toHaveLength(0);
    });
});
