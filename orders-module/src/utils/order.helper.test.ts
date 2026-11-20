// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';

import { PaymentMethodEnum } from '../enums/general';
import { prepareAgreementModel } from './order.helper';

const prepare = (paymentMethod: PaymentMethodEnum, redirectUrl?: string) =>
    prepareAgreementModel({
        paymentMethod,
        redirectUrl,
        generateSubscriberContact: false,
        language: 'nb-NO',
        merchantAgreementUrl: 'https://shop.example.test/terms',
    });

const params = (url: string | undefined) => [
    ...new URL(url as string).searchParams.entries(),
];

// The page after a cancelled card payment, where the shopper tries again.
const cancelledReturn =
    'https://shop.example.test/checkout?journey=order&action=cancel&S4OrderId=old-order&TransactionId=old-tx';

describe('prepareAgreementModel return URLs', () => {
    afterEach(() => {
        window.history.replaceState({}, '', '/');
    });

    it('does not carry a previous return into the next SwedbankPay attempt', () => {
        const { swedbankPay } = prepare(
            PaymentMethodEnum.SwedbankPay,
            cancelledReturn
        );

        expect(params(swedbankPay?.completeUrl)).toEqual([
            ['journey', 'order'],
            ['action', 'complete'],
        ]);
        expect(params(swedbankPay?.cancelUrl)).toEqual([
            ['journey', 'order'],
            ['action', 'cancel'],
        ]);
    });

    it('does not carry a previous return into the next Mollie attempt', () => {
        const { mollie } = prepare(PaymentMethodEnum.Mollie, cancelledReturn);

        expect(params(mollie?.returnUrl)).toEqual([
            ['journey', 'order'],
            ['action', 'complete'],
        ]);
    });

    it('does not carry previous return parameters into the Vipps redirect', () => {
        const { vippsMobilePay } = prepare(
            PaymentMethodEnum.Vipps,
            `${cancelledReturn}&orderId=old-vipps&agreementId=old-agreement`
        );

        expect(params(vippsMobilePay?.merchantRedirectUrl)).toEqual([
            ['journey', 'order'],
        ]);
    });

    it('falls back to the current page and keeps journey and hashToken once', () => {
        window.history.replaceState(
            {},
            '',
            '/checkout?journey=order&hashToken=token-1&action=cancel&S4OrderId=old-order'
        );

        const { swedbankPay } = prepare(PaymentMethodEnum.SwedbankPay);

        expect(params(swedbankPay?.completeUrl)).toEqual([
            ['journey', 'order'],
            ['hashToken', 'token-1'],
            ['action', 'complete'],
        ]);
    });

    it('uses the live hashToken over a stale one in the Vipps redirectUrl', () => {
        window.history.replaceState({}, '', '/checkout?hashToken=live');

        const { vippsMobilePay } = prepare(
            PaymentMethodEnum.Vipps,
            'https://shop.example.test/checkout?hashToken=stale'
        );

        expect(params(vippsMobilePay?.merchantRedirectUrl)).toEqual([
            ['hashToken', 'live'],
        ]);
    });
});
