import { MessageEventTypeEnum, PaymentMethodEnum } from 'Enums/general';
import { AgreementsType } from 'Types/order';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl: string;
    phoneNumber?: string;
    generateSubscriberContact: boolean;
    language: string;
    merchantAgreementUrl: string;
    accountId?: string;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    phoneNumber,
    generateSubscriberContact,
    language,
    merchantAgreementUrl,
    accountId,
}: AgreementModelType): AgreementsType => {
    const model: AgreementsType = {
        paymentProvider: paymentMethod,
    };

    if (paymentMethod === PaymentMethodEnum.SwedbankPay) {
        model.swedbankPay = {
            cancelUrl: `${redirectUrl}?action=${MessageEventTypeEnum.CANCEL}`,
            completeUrl: `${redirectUrl}?action=${MessageEventTypeEnum.COMPLETE}`,
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
            merchantRedirectUrl: redirectUrl,
        },
    };
};
