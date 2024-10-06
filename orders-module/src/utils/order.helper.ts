import { MessageEventTypeEnum, PaymentMethodEnum } from 'Enums/general';
import { OrderFormInputsType, AgreementsType } from 'Types/order';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl: string;
    data: OrderFormInputsType;
    generateSubscriberContact: boolean;
    language: string;
    merchantAgreementUrl: string;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    data,
    generateSubscriberContact,
    language,
    merchantAgreementUrl,
}: AgreementModelType): AgreementsType => {
    const model: AgreementsType = {
        paymentProvider: paymentMethod,
    };

    if (paymentMethod === PaymentMethodEnum.SwedbankPay) {
        model.swedbankPay = {
            cancelUrl: `${redirectUrl}?action=${MessageEventTypeEnum.CANCEL}`,
            completeUrl: `${redirectUrl}?action=${MessageEventTypeEnum.COMPLETE}`,
            language,
        };

        return model;
    }

    return {
        ...model,
        vippsMobilePay: {
            generateSubscriberContact,
            merchantAgreementUrl,
            phoneNumber: data.phoneNumber,
            merchantRedirectUrl: redirectUrl,
        },
    };
};
