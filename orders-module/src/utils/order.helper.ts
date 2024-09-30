import { PaymentMethodEnum } from 'Enums/general';
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
            CancelUrl: `${redirectUrl}?action=cancel`,
            CompleteUrl: `${redirectUrl}?action=complete`,
            CallbackUrl: `${redirectUrl}?action=callback`,
            Culture: 'en-GB',
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
