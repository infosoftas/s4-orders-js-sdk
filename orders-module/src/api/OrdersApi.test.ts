// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { orderComponent } from '../index';

const fetchMock = vi.fn<typeof fetch>();

const cancel = (orderId = 'order-1') =>
    orderComponent.cancelOrder({
        apiKey: 'tenant-key',
        apiUrl: 'https://orders.example.test',
        orderId,
    });

describe('cancelOrder', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', fetchMock);
        sessionStorage.clear();
        localStorage.clear();
    });

    afterEach(() => {
        fetchMock.mockReset();
        vi.unstubAllGlobals();
    });

    it('deletes the order with the given API settings', async () => {
        fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

        await cancel();

        const [url, init] = fetchMock.mock.calls[0];
        expect(String(url)).toBe('https://orders.example.test/order/order-1');
        expect(init?.method).toBe('DELETE');
        expect(new Headers(init?.headers).get('S4-ORDERS-API-KEY')).toBe(
            'tenant-key'
        );
    });

    it('encodes the order id and leaves no API settings behind', async () => {
        fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));

        await cancel('x/../../subscriber/1');

        expect(String(fetchMock.mock.calls[0][0])).toBe(
            'https://orders.example.test/order/x%2F..%2F..%2Fsubscriber%2F1'
        );
        expect(sessionStorage.getItem('sdk_api_key')).toBeNull();
        expect(sessionStorage.getItem('sdk_api_url')).toBeNull();
    });

    it('rejects when the delete fails', async () => {
        fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));

        await expect(cancel()).rejects.toThrow();
    });
});
