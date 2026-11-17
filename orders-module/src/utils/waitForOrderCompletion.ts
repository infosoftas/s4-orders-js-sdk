import { getOrderStatus } from '../api/OrdersApi';

type CompletionResult =
    | { status: 'Completed' | 'Cancelled' | 'Rejected' | 'Aborted' }
    | { status: 'Pending'; reason: 'timeout' | 'statusUnavailable' };

const retryDelay = (retryAfter?: string | null): number => {
    if (!retryAfter) {
        // Cross-origin APIs may not expose Retry-After. Do not retry blindly.
        return 10000;
    }
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && !/^\d+$/.test(retryAfter)) {
        return 10000;
    }

    const delay = Number.isFinite(seconds)
        ? seconds * 1000
        : Date.parse(retryAfter) - Date.now();
    return Number.isFinite(delay) ? Math.max(500, delay) : 10000;
};

const pause = (delay: number, signal: AbortSignal): Promise<void> =>
    new Promise((resolve) => {
        const done = () => {
            clearTimeout(timer);
            signal.removeEventListener('abort', done);
            resolve();
        };
        const timer = setTimeout(done, delay);
        signal.addEventListener('abort', done, { once: true });
        if (signal.aborted) {
            done();
        }
    });

export const waitForOrderCompletion = async (
    orderId: string,
    signal: AbortSignal
): Promise<CompletionResult> => {
    const controller = new AbortController();
    let timedOut = false;
    const abort = () => controller.abort();
    const deadline = Date.now() + 10000;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, 10000);
    signal.addEventListener('abort', abort, { once: true });

    const aborted = (): CompletionResult =>
        timedOut
            ? { status: 'Pending', reason: 'timeout' }
            : { status: 'Aborted' };
    let onAbort!: () => void;
    const cancellation = new Promise<CompletionResult>((resolve) => {
        onAbort = () => resolve(aborted());
        controller.signal.addEventListener('abort', onAbort, { once: true });
    });
    if (signal.aborted) {
        controller.abort();
    }

    const poll = async (): Promise<CompletionResult> => {
        while (!controller.signal.aborted && Date.now() < deadline) {
            let delay = 500;
            try {
                const order = await getOrderStatus(orderId, controller.signal);
                if (controller.signal.aborted) {
                    return aborted();
                }
                if (Date.now() >= deadline) {
                    return { status: 'Pending', reason: 'timeout' };
                }
                if (order?.id !== orderId) {
                    return { status: 'Pending', reason: 'statusUnavailable' };
                }
                switch (order.status) {
                    case 'Completed':
                    case 'Cancelled':
                    case 'Rejected':
                        return { status: order.status };
                    case 'InProgress':
                        break;
                    default:
                        return {
                            status: 'Pending',
                            reason: 'statusUnavailable',
                        };
                }
            } catch (error) {
                if (controller.signal.aborted) {
                    return aborted();
                }
                const { status, retryAfter } = (error || {}) as {
                    status?: number;
                    retryAfter?: string;
                };
                if (status === 429) {
                    delay = retryDelay(retryAfter);
                } else if (status && status !== 404 && status < 500) {
                    return { status: 'Pending', reason: 'statusUnavailable' };
                }
            }
            await pause(
                Math.min(delay, deadline - Date.now()),
                controller.signal
            );
        }
        return signal.aborted
            ? { status: 'Aborted' }
            : { status: 'Pending', reason: 'timeout' };
    };

    try {
        // Race also bounds transports that do not settle when their signal aborts.
        return await Promise.race([poll(), cancellation]);
    } finally {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        controller.signal.removeEventListener('abort', onAbort);
        controller.abort();
    }
};
