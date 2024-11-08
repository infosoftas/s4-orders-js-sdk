import { MessageEventTypeEnum, PaymentMethodEnum } from 'Enums/general';
import { OrderFormInputsType, AgreementsType } from 'Types/order';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl: string;
    data: OrderFormInputsType;
    generateSubscriberContact: boolean;
    language: string;
    merchantAgreementUrl: string;
    accountId?: string;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    data,
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
            phoneNumber: data.phoneNumber,
            email: data.email,
            name: data.name,
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
            phoneNumber: data.phoneNumber,
            email: data.email,
            name: data.name,
            merchantRedirectUrl: redirectUrl,
        },
    };
};
