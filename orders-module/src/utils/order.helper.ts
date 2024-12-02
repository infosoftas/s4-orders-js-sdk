import { MessageEventTypeEnum, PaymentMethodEnum } from '../enums/general';
import { AgreementsType, OrderFormInputsType } from '../types/order';
import { OrderFormFiledType } from '../types/general';

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

    if (
        paymentMethod === PaymentMethodEnum.Vipps ||
        paymentMethod === PaymentMethodEnum.MobilePay
    ) {
        model.vippsMobilePay = {
            generateSubscriberContact,
            merchantAgreementUrl,
            accountId,
            phoneNumber,
            merchantRedirectUrl: redirectUrl || window.location.href,
        };

        return model;
    }

    return model;
};

type ContactModelType = {
    data: OrderFormInputsType;
    orderFields: OrderFormFiledType[];
};

export const prepareContactModel = ({
    data,
    orderFields,
}: ContactModelType) => {
    const model = {
        name: orderFields.find((i) => i.name === 'name')
            ? data.name?.trim() || undefined
            : undefined,
        email: orderFields.find((i) => i.name === 'email')
            ? data.email?.trim() || undefined
            : undefined,
        phone: orderFields.find((i) => i.name === 'phoneNumber')
            ? data.phoneNumber?.trim() || undefined
            : undefined,
        country: orderFields.find((i) => i.name === 'country')
            ? data.country?.trim() || undefined
            : undefined,
        city: orderFields.find((i) => i.name === 'city')
            ? data.city?.trim() || undefined
            : undefined,
        addressLines: orderFields.find((i) => i.name === 'address')
            ? data.address?.trim()
                ? data.address
                      ?.trim()
                      .replace(/\r\n/g, '\n')
                      .split('\n')
                      .filter((line) => line)
                : undefined
            : undefined,
        zip: orderFields.find((i) => i.name === 'zip')
            ? data.zip?.trim() || undefined
            : undefined,
        careOf: orderFields.find((i) => i.name === 'careOf')
            ? data.zip?.trim() || undefined
            : undefined,
    };

    return model;
};
