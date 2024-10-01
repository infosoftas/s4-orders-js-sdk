import { MessageEventTypeEnum, PaymentMethodEnum } from 'Enums/general';
import { OrderFormInputsType, AgreementsType } from 'Types/order';

type AgreementModelType = {
    paymentMethod: PaymentMethodEnum;
    redirectUrl: string;
    data: OrderFormInputsType;
    generateSubscriberContact: boolean;
};

export const prepareAgreementModel = ({
    paymentMethod,
    redirectUrl,
    data,
    generateSubscriberContact,
}: AgreementModelType): AgreementsType => {
    const model: AgreementsType = {
        PaymentMethod: paymentMethod,
    };

    if (paymentMethod === PaymentMethodEnum.SwedbankPay) {
        model.SwedbankPay = {
            CancelUrl: `${redirectUrl}?action=${MessageEventTypeEnum.CANCEL}`,
            CompleteUrl: `${redirectUrl}?action=${MessageEventTypeEnum.COMPLETE}`,
            CallbackUrl: `${redirectUrl}?action=${MessageEventTypeEnum.CALLBACK}`,
            Culture: 'en-US',
        };

        return model;
    }

    return {
        ...model,
        VippsMobilePay: {
            GenerateSubscriberContact: generateSubscriberContact,
            CustomerPhoneNumber: data.phoneNumber,
            MerchantAgreementUrl:
                'https://service.info-subscription.com/agreement',
            MerchantRedirectUrl: redirectUrl,
        },
    };
};
