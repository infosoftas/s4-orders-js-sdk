import { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';

import { createSubscriber, mapSubscriberToUser } from '../api/SubscribeApi';
import { orderStart } from '../api/OrdersApi';
import { invoiceLookup } from '../api/InvoiceApi';
import { InvoiceLookupNetworkEnum, PaymentMethodEnum } from '../enums/general';
import { WRONG_MSG, PAYMENT_METHOD_DEFAULT } from '../constants/index';
import { OrderFormInputsType, OrderInfoType } from '../types/order';
import {
    ErrorsMsg,
    OrderFormFiledType,
    PaymentMethodOptionsType,
} from '../types/general';
import {
    prepareAgreementModel,
    prepareContactModel,
    prepareInvoiceModel,
} from '../utils/order.helper';
import {
    prepareErrorMessage,
    prepareErrorsArrayMessage,
} from '../utils/helper';

type Props = {
    callback: (url: string | null, orderInfo?: OrderInfoType | null) => void;
    submitStartCallback?: (id: string) => void;
    templatePackageId: string;
    subscriberId?: string;
    userId?: string;
    identityProviderId?: string;
    organizationId: string;
    redirectUrl?: string;
    showIframe?: boolean;
    language: string;
    merchantAgreementUrl: string;
    paymentMethodsOptions?: PaymentMethodOptionsType;
    orderFields: OrderFormFiledType[];
    invoiceAddressToggle?: boolean;
    invoiceOrderFields: OrderFormFiledType[];
};

const useOrderForm = ({
    callback,
    submitStartCallback,
    organizationId,
    subscriberId,
    userId,
    identityProviderId,
    orderFields,
    redirectUrl,
    showIframe,
    language,
    merchantAgreementUrl,
    paymentMethodsOptions,
    templatePackageId,
    invoiceAddressToggle,
    invoiceOrderFields,
}: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [apiErrorMsg, setApiErrorMsg] = useState<string>('');
    const [errorsMsg, setErrorsMsg] = useState<string[]>([]);

    const orderSubmit: SubmitHandler<OrderFormInputsType> = async (
        data
    ): Promise<void> => {
        setApiErrorMsg('');
        setErrorsMsg([]);
        setLoading(true);
        try {
            let id: string | undefined = subscriberId;
            const contactModel = prepareContactModel({ data, orderFields });
            if (!subscriberId) {
                const response = await createSubscriber({
                    ...contactModel,
                    gln: data?.gln,
                    organizationNumber:
                        data.paymentMethod === PaymentMethodEnum.OIO
                            ? data?.cvr
                            : data.organizationNumber || undefined,
                });
                id = response.id;

                if (userId && identityProviderId) {
                    await mapSubscriberToUser(id, {
                        userId: userId,
                        identityProviderId: identityProviderId,
                    });
                }
            }

            submitStartCallback?.(id as string);

            if (id) {
                const paymentMethod =
                    data.paymentMethod || PAYMENT_METHOD_DEFAULT;

                const agreements = prepareAgreementModel({
                    paymentMethod,
                    redirectUrl,
                    showIframe,
                    phoneNumber: orderFields.find(
                        (i) => i.name === 'phoneNumber'
                    )
                        ? data.phoneNumber?.trim() || undefined
                        : undefined,
                    language,
                    merchantAgreementUrl,
                    generateSubscriberContact:
                        paymentMethodsOptions?.[
                            data.paymentMethod as PaymentMethodEnum
                        ]?.generateSubscriberContact || false,
                    accountId:
                        paymentMethodsOptions?.[
                            data.paymentMethod as PaymentMethodEnum
                        ]?.accountId,
                });
                const responseOrder = await orderStart({
                    subscriberId: id,
                    subscriptionPlan: {
                        organizationId,
                        templateSubscriptionPlanId: templatePackageId,
                    },
                    paymentAgreement: { ...agreements },
                    invoiceContact: invoiceAddressToggle
                        ? prepareInvoiceModel({
                              data,
                              orderFields: invoiceOrderFields,
                          })
                        : undefined,
                    orderReference: data.orderReference || undefined,
                });
                if (data.paymentMethod === PaymentMethodEnum.OIO) {
                    await invoiceLookup({
                        network: data.gln
                            ? InvoiceLookupNetworkEnum.OIO_GLN
                            : InvoiceLookupNetworkEnum.OIO_Danish_CVR,
                        value: data.gln || data.cvr || '',
                    });
                }
                if (data.paymentMethod === PaymentMethodEnum.EHF) {
                    await invoiceLookup({
                        network: InvoiceLookupNetworkEnum.EHF,
                        value: data.organizationNumber || '',
                    });
                }
                callback(responseOrder.terminalRedirectUrl, {
                    ...(data || {}),
                    orderId: responseOrder.id,
                    subscriberId: id,
                    paymentMethod: paymentMethod,
                });
                return;
            }
            callback(null);
            setApiErrorMsg(WRONG_MSG);
            setErrorsMsg([]);
        } catch (error) {
            console.error(error);
            setApiErrorMsg(prepareErrorMessage(error as Error));
            setErrorsMsg(
                prepareErrorsArrayMessage(
                    (
                        error as {
                            errors: ErrorsMsg;
                        }
                    )?.errors
                )
            );
            callback(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        orderSubmit,
        loading,
        apiErrorMsg,
        errorsMsg,
    };
};

export default useOrderForm;
