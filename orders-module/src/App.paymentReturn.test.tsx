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

const submission = vi.hoisted(() => ({
    url: null as string | null,
    data: null as unknown as OrderInfoType,
}));

vi.mock('./components/OrderForm/OrderForm', () => ({
    default: ({
        callback,
    }: {
        callback: (url: string | null, data: OrderInfoType) => void;
    }) => (
        <button onClick={() => callback(submission.url, submission.data)}>
            Submit order
        </button>
    ),
}));

const response = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status });

const fetchMock = vi.fn<typeof fetch>();

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
            settings={{
                successText: 'Order completed',
                orderProcessingText: 'Processing order',
            }}
            {...props}
        />
    );

const returnTo = (search: string) =>
    window.history.replaceState({}, '', `/${search}`);

const advance = async (ms = 0) => {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
};

const requests = () =>
    fetchMock.mock.calls.map(([url, init]) => `${init?.method} ${url}`);

const postedMessages = (type: MessageEventTypeEnum) =>
    vi
        .mocked(window.postMessage)
        .mock.calls.map(([message]) => message as { type?: string })
        .filter((message) => message.type === type);

const foreignMessages = [
    { type: 'cancel' },
    { type: 'complete', orderId: 'foreign-order', agreementId: 'x' },
    { type: 'completeOrder', orderId: 'foreign-order', agreementId: 'x' },
];

const postForeignMessages = () =>
    act(() => {
        for (const data of foreignMessages) {
            window.dispatchEvent(new MessageEvent('message', { data }));
            window.dispatchEvent(
                new MessageEvent('message', { data, source: window })
            );
        }
    });

describe('full-page payment returns', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
        returnTo('');
        sessionStorage.clear();
        localStorage.clear();
        submission.url = null;
        submission.data = null as unknown as OrderInfoType;
        vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('ignores payment messages when no checkout is active', async () => {
        renderApp();
        postForeignMessages();
        await advance(1000);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(
            screen.getByRole('button', { name: 'Submit order' })
        ).toBeTruthy();
    });

    it('does not let payment messages abort, cancel or redirect an active completion', async () => {
        let finish!: (value: Response) => void;
        fetchMock.mockResolvedValueOnce(response(null)).mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                })
        );
        returnTo(
            '?action=complete&S4OrderId=returned-order&TransactionId=tx-1'
        );
        renderApp();
        await advance();

        postForeignMessages();
        await advance();

        expect(requests()).toEqual([
            'POST https://orders.example.test/order/returned-order/complete',
            'GET https://orders.example.test/order/returned-order',
        ]);
        expect(fetchMock.mock.calls[1][1]?.signal?.aborted).toBe(false);

        await act(async () => {
            finish(response({ id: 'returned-order', status: 'Completed' }));
        });
        expect(screen.getByText('Order completed')).toBeTruthy();
        expect(
            postedMessages(MessageEventTypeEnum.ORDER_FLOW_COMPLETE)
        ).toEqual([expect.objectContaining({ orderId: 'returned-order' })]);
    });

    it('sends SwedbankPay to the payment terminal with a full-page redirect', async () => {
        submission.url = `${window.location.origin}/#swedbank-terminal`;
        submission.data = {
            orderId: 'swedbank-order',
            paymentMethod: 'SwedbankPay',
            subscriberId: 'subscriber-7',
        };
        renderApp({ showIframe: true } as Partial<ConfigType>);

        fireEvent.click(screen.getByRole('button', { name: 'Submit order' }));
        await advance(300);

        expect(window.location.hash).toBe('#swedbank-terminal');
        expect(document.querySelector('iframe')).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
        // Coming back with the browser's back button shows a usable form.
        expect(
            screen.getByRole('button', { name: 'Submit order' })
        ).toBeTruthy();
        expect(screen.queryByTestId('sdk-order-loading-skeleton')).toBeNull();
    });

    it('completes a SwedbankPay return', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response({ id: 'returned-order', status: 'Completed' })
            );
        returnTo(
            '?action=complete&S4OrderId=returned-order&TransactionId=tx-1'
        );
        renderApp();
        await advance();

        expect(requests()).toEqual([
            'POST https://orders.example.test/order/returned-order/complete',
            'GET https://orders.example.test/order/returned-order',
        ]);
        expect(screen.getByText('Order completed')).toBeTruthy();
    });

    it('cancels the order on a SwedbankPay cancel return and reopens the form', async () => {
        fetchMock.mockResolvedValueOnce(response(null));
        returnTo('?action=cancel&S4OrderId=returned-order&TransactionId=tx-1');
        renderApp();
        await advance();

        expect(requests()).toEqual([
            'DELETE https://orders.example.test/order/returned-order',
        ]);
        expect(
            screen.getByRole('button', { name: 'Submit order' })
        ).toBeTruthy();
        expect(
            postedMessages(MessageEventTypeEnum.ORDER_FLOW_CANCEL)
        ).toHaveLength(1);
    });

    it('cancels the stored Mollie order on a cancel return without an order ID', async () => {
        fetchMock.mockResolvedValueOnce(response(null));
        sessionStorage.setItem(
            'mollieOrderId',
            JSON.stringify({ id: 'mollie-order', ts: Date.now() })
        );
        returnTo('?action=cancel');
        renderApp();
        await advance();

        expect(requests()).toEqual([
            'DELETE https://orders.example.test/order/mollie-order',
        ]);
        expect(sessionStorage.getItem('mollieOrderId')).toBeNull();
    });

    it('completes a Mollie return', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response({ id: 'mollie-order', status: 'Completed' })
            );
        returnTo('?action=complete&S4OrderId=mollie-order');
        renderApp();
        await advance();

        expect(requests()).toEqual([
            'POST https://orders.example.test/order/mollie-order/complete',
            'GET https://orders.example.test/order/mollie-order',
        ]);
        expect(screen.getByText('Order completed')).toBeTruthy();
    });

    it('completes a Vipps return', async () => {
        fetchMock
            .mockResolvedValueOnce(response(null))
            .mockResolvedValueOnce(
                response({ id: 'vipps-order', status: 'Completed' })
            );
        returnTo('?orderId=vipps-order&agreementId=agreement-1');
        renderApp();
        await advance();

        expect(requests()).toEqual([
            'POST https://orders.example.test/order/vipps-order/complete',
            'GET https://orders.example.test/order/vipps-order',
        ]);
        expect(screen.getByText('Order completed')).toBeTruthy();
    });
});

describe('payment returns inside a legacy checkout iframe', () => {
    const swedbankComplete =
        '?action=complete&S4OrderId=returned-order&TransactionId=tx-1';

    const insideFrame = (location: object) => {
        const parent = { location } as unknown as Window;
        vi.spyOn(window, 'top', 'get').mockReturnValue(parent);
    };

    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock.mockReset();
        fetchMock.mockResolvedValue(response(null));
        vi.stubGlobal('fetch', fetchMock);
        returnTo('');
        sessionStorage.clear();
        vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
        vi.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it.each([
        ['a SwedbankPay completion', swedbankComplete],
        ['a cancellation', '?action=cancel&S4OrderId=returned-order'],
        ['a Vipps return', '?orderId=vipps-order&agreementId=agreement-1'],
    ])(
        'moves %s to the top-level page without handling it in the frame',
        async (_label, search) => {
            const replace = vi.fn();
            insideFrame({ origin: window.location.origin, replace });
            sessionStorage.setItem(
                'mollieOrderId',
                JSON.stringify({ id: 'mollie-order', ts: Date.now() })
            );
            returnTo(search);
            renderApp();
            await advance(1000);

            expect(replace).toHaveBeenCalledExactlyOnceWith(
                window.location.href
            );
            expect(fetchMock).not.toHaveBeenCalled();
            expect(sessionStorage.getItem('mollieOrderId')).not.toBeNull();
        }
    );

    it('handles the return in the frame when the parent page is on another origin', async () => {
        insideFrame({
            get origin(): string {
                throw new DOMException('Blocked', 'SecurityError');
            },
        });
        returnTo(swedbankComplete);
        renderApp({ completionMode: 'external' });
        await advance();

        expect(requests()).toEqual([
            'POST https://orders.example.test/order/returned-order/complete',
        ]);
    });

    it('does nothing in a frame without a payment return', async () => {
        const replace = vi.fn();
        insideFrame({ origin: window.location.origin, replace });
        renderApp();
        await advance(1000);

        expect(replace).not.toHaveBeenCalled();
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
