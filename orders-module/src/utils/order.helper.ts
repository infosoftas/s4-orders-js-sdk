import { PaymentMethodEnum } from 'Enums/general';
import { OrderFormInputsType, AgreementsType } from 'Types/order';

export const prepareAgreementModel = (
    method: string,
    redirectUrl: string,
    data: OrderFormInputsType,
    generateSubscriberContact: boolean
): AgreementsType => {
    const model: AgreementsType = {
        PaymentMethod: method,
    };

    if (method === PaymentMethodEnum.SwedbankPay) {
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
