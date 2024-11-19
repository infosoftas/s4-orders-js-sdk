import { MessageEventTypeEnum, PaymentMethodEnum } from '../enums/general';
import { AgreementsType } from '../types/order';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl?: string;
    showIframe?: boolean;
    phoneNumber?: string;
    generateSubscriberContact: boolean;
    language: string;
    merchantAgreementUrl: string;
    accountId?: string;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    showIframe,
    phoneNumber,
    generateSubscriberContact,
    language,
    merchantAgreementUrl,
    accountId,
}: AgreementModelType): AgreementsType => {
    const model: AgreementsType = {
        paymentProvider: paymentMethod,
    };
    const existUrl = new URL(window.location.href);
    const journey = existUrl.searchParams.get('journey');
    const url = showIframe
        ? window.location.href.split('?')[0]
        : redirectUrl || window.location.href;
    const cancelUrl = new URL(url);
    cancelUrl.searchParams.append('action', `${MessageEventTypeEnum.CANCEL}`);
    if (journey) {
        cancelUrl.searchParams.append('journey', journey);
    }
    const confirmUrl = new URL(url);
    confirmUrl.searchParams.append(
        'action',
        `${MessageEventTypeEnum.COMPLETE}`
    );
    if (journey) {
        confirmUrl.searchParams.append('journey', journey);
    }

    if (paymentMethod === PaymentMethodEnum.SwedbankPay) {
        model.swedbankPay = {
            cancelUrl: `${cancelUrl}`,
            completeUrl: `${confirmUrl}`,
            language,
            accountId,
        };

        return model;
    }

    return {
        ...model,
        vippsMobilePay: {
            generateSubscriberContact,
            merchantAgreementUrl,
            accountId,
            phoneNumber,
            merchantRedirectUrl: redirectUrl || window.location.href,
        },
    };
};
