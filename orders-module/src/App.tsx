import { type FC, useEffect, useState } from 'react';

import {
    FormTypeEnum,
    MessageEventTypeEnum,
    PaymentMethodEnum,
    UserActionEnum,
} from './enums/general';
import useMessageEvent from './hooks/useMessageEvent';
import OrderForm from './components/OrderForm/OrderForm';
import OIOForm from './components/OIOForm/OIOForm';
import EHFForm from './components/EHFForm/EHFForm';
import MainIframe from './components/MainIframe/MainIframe';
import Alert from './components/Alert/Alert';
import { Skeleton } from './components/ui/skeleton';
import { Card, CardContent } from './components/ui/card';
import type { ConfigType, ErrorsMsg } from './types/general';
import type {
    CompleteOrderParamsType,
    OrderInfoType,
    OrderFormInputsType,
} from './types/order';
import { orderComplete, orderDelete } from './api/OrdersApi';
import { prepareErrorMessage, prepareErrorsArrayMessage } from './utils/helper';

import ErrorBoundary from './ErrorBoundary';

const App: FC<ConfigType> = ({
    submitStartCallback,
    userActionCallback,
    setContactCallback,
    cancelVippsCallback,
    moduleTitle,
    apiKey,
    apiUrl,
    templatePackageId,
    subscriberId,
    userId,
    identityProviderId,
    organizationId,
    redirectUrl,
    showIframe,
    paymentMethodsOptions,
    invoiceAddressSelection,
    availablePaymentMethods = [],
    allowedPaymentMethods,
    requireTermsAcceptance,
    language = 'en-US',
    merchantAgreementUrl = '',
    settings = {
        successText: 'Order successful completed!',
        failureText: 'Something went wrong!',
        buttonText: 'Start',
        submitButtonText: 'Start',
        backButtonText: 'Back',
        verifyButtonText: 'Verify',
        organizationNumberLabel: 'Organization Number',
        paymentMethodLabel: '',
        contactDetailsLabel: '',
        glnLabel: 'GLN',
        cvrLabel: 'CVR',
        orderDefaultValues: undefined,
        errorReqMsg: '',
        errorInvalidEmailMsg: '',
        errorInvalidPhoneMsg: '',
        errorTermsMsg: '',
        errorValidationTitleMsg: 'One or more validation errors occurred.',
        errorValidationDenialOrderBlockingMsg:
            'The order/subscription will not be created because the subscriber has a denial order blocking all.',
        errorValidationBlockingOffersMsg:
            'The order/subscription will not be created because the subscriber has a denial order blocking offers.',
        orderDenialOfferBaseText:
            'Hello again!\n\nLooks like you already tried this offer.',
        orderDenialOfferWithFallbackText:
            'Hello again!\n\nLooks like you already tried this offer, but we would like to keep you with us.\n\nTherefore we got a new great offer for you:',
        orderDenialAmountText:
            'We are sorry, but you do not meet the requirements for this offer. Please contact customer service for more information.',
        paymentMethodNotAllowedMsg: '',
        invoiceLookupNotFoundText:
            'There was no recipient found for the given information',
        termsAndConditionsText: '',
        orderDenialCloseButtonText: 'Close',
        orderDenialContinueButtonText: 'Continue',
    },
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(true);
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [subscriberSdkId, setSubscriberSdkId] = useState<string | undefined>(
        subscriberId || undefined
    );
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [isFailed, setIsFailed] = useState<boolean>(false);
    const [failedMsg, setFailedMsg] = useState<string>('');
    const [errorsMsg, setErrorsMsg] = useState<string[]>([]);
    const [orderInfo, setOrderInfo] = useState<OrderInfoType | null>(null);
    const [formType, setFormType] = useState(FormTypeEnum.ORDER);
    const [orderFormValues, setOrderFormValues] = useState(
        settings?.orderDefaultValues
    );

    useEffect(() => {
        if (apiKey) {
            sessionStorage.setItem('sdk_api_key', apiKey);
            localStorage.setItem('sdk_api_key', apiKey);
        }
    }, [apiKey]);

    useEffect(() => {
        if (apiUrl) {
            sessionStorage.setItem('sdk_api_url', apiUrl);
        }
    }, [apiUrl]);

    const messageCallback = async (
        data: CompleteOrderParamsType
    ): Promise<void> => {
        setLoading(true);
        setIframeSrc(null);
        setShowOrderForm(false);
        setIsFailed(false);
        setFailedMsg('');
        setErrorsMsg([]);
        try {
            // There is no way to detect the difference between "cancelled" and "accepted" payment for Vipps via UI
            // Completing an order for cancelled payment is fine. The backend handles it correctly.
            await orderComplete(
                orderId || data.orderId || '',
                userId && identityProviderId
                    ? {
                          userId,
                          identityProviderId,
                      }
                    : undefined
            );
            setIsConfirmed(true);
            setLoading(false);
            if (window === top) {
                top.postMessage(
                    {
                        type: MessageEventTypeEnum.ORDER_FLOW_COMPLETE,
                        isCompleted: true,
                        orderInfo: orderInfo,
                    },
                    top?.location?.origin || '*'
                );
            }
        } catch (error) {
            console.log(error);
            if (
                (error as { status: number }).status === 409 &&
                (data.paymentMethod === PaymentMethodEnum.Vipps ||
                    data.paymentMethod === PaymentMethodEnum.MobilePay)
            ) {
                cancelVippsCallback?.();
                handleOrderDelete(orderId || data.orderId);
                return;
            }

            setFailedMsg(
                prepareErrorMessage(error as Error, settings?.failureText)
            );
            setErrorsMsg(
                prepareErrorsArrayMessage(
                    (
                        error as {
                            errors: ErrorsMsg;
                        }
                    )?.errors
                )
            );
            setIsFailed(true);
            setLoading(false);
            setShowOrderForm(true);
            setFormType(FormTypeEnum.ORDER);
            userActionCallback?.(UserActionEnum.SELECT_FORM, {
                form: FormTypeEnum.ORDER,
            });
        }
    };

    const handleOrderDelete = async (id: string) => {
        try {
            await orderDelete(id);
            if (window === top) {
                top.postMessage(
                    {
                        type: MessageEventTypeEnum.ORDER_FLOW_CANCEL,
                        isCanceled: true,
                        orderInfo: orderInfo,
                    },
                    top?.location?.origin || '*'
                );
            }
            setIsFailed(false);
        } catch (error) {
            console.log(error);
            setFailedMsg(
                prepareErrorMessage(error as Error, settings?.failureText)
            );
            setErrorsMsg(
                prepareErrorsArrayMessage(
                    (
                        error as {
                            errors: ErrorsMsg;
                        }
                    )?.errors
                )
            );
            setIsFailed(true);
        }

        setLoading(false);
        setShowOrderForm(true);
    };

    const handleMessageEvent = async (
        type: MessageEventTypeEnum,
        canceledOrderId?: string
    ) => {
        if (type === MessageEventTypeEnum.CANCEL) {
            try {
                const orderIdToCancel = canceledOrderId || orderId;
                if (orderIdToCancel) {
                    await handleOrderDelete(orderIdToCancel);
                }
            } catch (error) {
                console.log(error);
            }

            setLoading(false);
            setOrderId(null);
            setOrderInfo(null);
            setIframeSrc(null);
            setIsConfirmed(false);
            setShowOrderForm(true);
        }
    };

    useMessageEvent(
        messageCallback,
        handleMessageEvent,
        !!showIframe,
        orderInfo
    );

    const handleForm = (url: string | null, data?: OrderInfoType | null) => {
        setIsConfirmed(false);
        setIsFailed(false);
        setOrderId(data?.orderId || null);
        setOrderInfo(data || null);
        if (data) {
            setOrderFormValues(data as unknown as OrderFormInputsType);
        }
        if (window === top) {
            top.postMessage(
                {
                    type: MessageEventTypeEnum.ORDER_UPDATE_INFO,
                    isUpdate: true,
                    orderInfo: data || null,
                },
                top?.location?.origin || '*'
            );
        }
        if (
            data?.paymentMethod === PaymentMethodEnum.Email ||
            data?.paymentMethod === PaymentMethodEnum.Invoice
        ) {
            messageCallback({
                orderId: data.orderId || orderId || '',
                agreementId: '',
                orderInfo: data || orderInfo || null,
            });
        } else if (data?.paymentMethod === PaymentMethodEnum.EHF) {
            setFormType(FormTypeEnum.EHF);
            userActionCallback?.(UserActionEnum.SELECT_FORM, {
                form: FormTypeEnum.EHF,
            });
        } else if (data?.paymentMethod === PaymentMethodEnum.OIO) {
            setFormType(FormTypeEnum.OIO);
            userActionCallback?.(UserActionEnum.SELECT_FORM, {
                form: FormTypeEnum.OIO,
            });
        } else if (url) {
            if (
                showIframe &&
                data?.paymentMethod === PaymentMethodEnum.SwedbankPay
            ) {
                setIframeSrc(url);
                return;
            }

            if (
                data?.paymentMethod === PaymentMethodEnum.Mollie &&
                data?.orderId
            ) {
                try {
                    sessionStorage.setItem(
                        'mollieOrderId',
                        JSON.stringify({ id: data.orderId, ts: Date.now() })
                    );
                } catch (e) {
                    console.warn(
                        'Could not persist mollieOrderId; return leg will rely on the S4OrderId param.',
                        e
                    );
                }
            }

            setTimeout(() => {
                window.location.href = url;
            }, 300);

            return;
        } else if (data?.paymentMethod) {
            setIsFailed(true);
            setShowOrderForm(true);
            setFormType(FormTypeEnum.ORDER);
        }

        setIframeSrc(null);
    };

    const handleInvoiceBack = () => {
        setFormType(FormTypeEnum.ORDER);
        userActionCallback?.(UserActionEnum.SELECT_FORM, {
            form: FormTypeEnum.ORDER,
        });
    };

    const updateFormData = (data: OrderFormInputsType) => {
        setOrderFormValues(data);
        setFormType(data.paymentMethod as unknown as FormTypeEnum);
        userActionCallback?.(UserActionEnum.SELECT_FORM, {
            form: data.paymentMethod,
        });
    };

    const handleInvoiceForm = async (
        _: string | null,
        data?: OrderInfoType | null
    ) => {
        await messageCallback({
            orderId: data?.orderId || orderId || '',
            agreementId: '',
            orderInfo: data || orderInfo || null,
        });
    };

    const onSubmitStart = (id: string) => {
        setSubscriberSdkId(id);
        submitStartCallback?.(id);
    };

    if (window !== top) {
        return null;
    }

    if (loading) {
        return (
            <div
                className="sdk-order-container sdk-scope"
                data-testid="sdk-order-loading-skeleton"
                aria-busy="true"
            >
                <Card>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-9 w-full rounded-3xl" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-9 w-full rounded-3xl" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-9 w-full rounded-3xl" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-4 shrink-0 rounded-[5px]" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-9 w-full rounded-4xl" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div
                className={`sdk-order-container sdk-scope ${
                    iframeSrc ? 'show-iframe' : ''
                }`}
                data-testid="sdk-order-module-id"
            >
                {moduleTitle && <h1 className="text-center">{moduleTitle}</h1>}
                {!iframeSrc && showOrderForm && (
                    <>
                        {formType === FormTypeEnum.OIO && (
                            <OIOForm
                                onBack={handleInvoiceBack}
                                callback={handleInvoiceForm}
                                backButtonText={settings?.backButtonText}
                                verifyButtonText={settings?.verifyButtonText}
                                orderDenialCloseButtonText={
                                    settings?.orderDenialCloseButtonText
                                }
                                orderDenialContinueButtonText={
                                    settings?.orderDenialContinueButtonText
                                }
                                organizationNumberLabel={settings?.cvrLabel}
                                glnLabel={settings?.glnLabel}
                                organizationNumber={
                                    orderFormValues?.organizationNumber
                                }
                                orderValues={orderFormValues}
                                templatePackageId={templatePackageId}
                                subscriberId={subscriberSdkId}
                                userId={userId}
                                identityProviderId={identityProviderId}
                                organizationId={organizationId}
                                redirectUrl={redirectUrl}
                                showIframe={showIframe}
                                paymentMethodsOptions={paymentMethodsOptions}
                                language={language}
                                merchantAgreementUrl={merchantAgreementUrl}
                                invoiceAddressSelection={
                                    invoiceAddressSelection
                                }
                                invoiceLookupNotFoundText={
                                    settings?.invoiceLookupNotFoundText
                                }
                                errorReqMsg={settings?.errorReqMsg}
                                userActionCallback={userActionCallback}
                                setContactCallback={setContactCallback}
                                errorValidationTitleMsg={
                                    settings?.errorValidationTitleMsg
                                }
                                errorValidationDenialOrderBlockingMsg={
                                    settings?.errorValidationDenialOrderBlockingMsg
                                }
                                errorValidationBlockingOffersMsg={
                                    settings?.errorValidationBlockingOffersMsg
                                }
                                orderDenialOfferBaseText={
                                    settings?.orderDenialOfferBaseText
                                }
                                orderDenialOfferWithFallbackText={
                                    settings?.orderDenialOfferWithFallbackText
                                }
                                orderDenialAmountText={
                                    settings?.orderDenialAmountText
                                }
                                fetchDenialFallbackOffer={
                                    settings?.fetchDenialFallbackOffer
                                }
                            />
                        )}
                        {formType === FormTypeEnum.EHF && (
                            <EHFForm
                                onBack={handleInvoiceBack}
                                callback={handleInvoiceForm}
                                backButtonText={settings?.backButtonText}
                                verifyButtonText={settings?.verifyButtonText}
                                orderDenialCloseButtonText={
                                    settings?.orderDenialCloseButtonText
                                }
                                orderDenialContinueButtonText={
                                    settings?.orderDenialContinueButtonText
                                }
                                organizationNumberLabel={
                                    settings?.organizationNumberLabel
                                }
                                organizationNumber={
                                    orderFormValues?.organizationNumber
                                }
                                orderValues={orderFormValues}
                                templatePackageId={templatePackageId}
                                subscriberId={subscriberSdkId}
                                userId={userId}
                                identityProviderId={identityProviderId}
                                organizationId={organizationId}
                                redirectUrl={redirectUrl}
                                showIframe={showIframe}
                                paymentMethodsOptions={paymentMethodsOptions}
                                language={language}
                                merchantAgreementUrl={merchantAgreementUrl}
                                invoiceAddressSelection={
                                    invoiceAddressSelection
                                }
                                invoiceLookupNotFoundText={
                                    settings?.invoiceLookupNotFoundText
                                }
                                errorReqMsg={settings?.errorReqMsg}
                                userActionCallback={userActionCallback}
                                setContactCallback={setContactCallback}
                                errorValidationTitleMsg={
                                    settings?.errorValidationTitleMsg
                                }
                                errorValidationDenialOrderBlockingMsg={
                                    settings?.errorValidationDenialOrderBlockingMsg
                                }
                                errorValidationBlockingOffersMsg={
                                    settings?.errorValidationBlockingOffersMsg
                                }
                                orderDenialOfferBaseText={
                                    settings?.orderDenialOfferBaseText
                                }
                                orderDenialOfferWithFallbackText={
                                    settings?.orderDenialOfferWithFallbackText
                                }
                                orderDenialAmountText={
                                    settings?.orderDenialAmountText
                                }
                                fetchDenialFallbackOffer={
                                    settings?.fetchDenialFallbackOffer
                                }
                            />
                        )}
                        {formType !== FormTypeEnum.OIO &&
                            formType !== FormTypeEnum.EHF &&
                            templatePackageId && (
                                <OrderForm
                                    callback={handleForm}
                                    updateFormData={updateFormData}
                                    submitStartCallback={onSubmitStart}
                                    templatePackageId={templatePackageId}
                                    subscriberId={subscriberSdkId}
                                    userId={userId}
                                    identityProviderId={identityProviderId}
                                    organizationId={organizationId}
                                    paymentMethods={availablePaymentMethods}
                                    allowedPaymentMethods={
                                        allowedPaymentMethods
                                    }
                                    submitButtonText={
                                        settings?.submitButtonText
                                    }
                                    orderDenialCloseButtonText={
                                        settings?.orderDenialCloseButtonText
                                    }
                                    orderDenialContinueButtonText={
                                        settings?.orderDenialContinueButtonText
                                    }
                                    paymentMethodLabel={
                                        settings?.paymentMethodLabel
                                    }
                                    contactDetailsLabel={
                                        settings?.contactDetailsLabel
                                    }
                                    paymentMethodElementId={
                                        settings?.paymentMethodElementId
                                    }
                                    contactDetailsElementId={
                                        settings?.contactDetailsElementId
                                    }
                                    paymentMethodNotAllowedMsg={
                                        settings?.paymentMethodNotAllowedMsg
                                    }
                                    errorReqMsg={settings?.errorReqMsg}
                                    errorTermsMsg={settings?.errorTermsMsg}
                                    errorInvalidEmailMsg={
                                        settings?.errorInvalidEmailMsg
                                    }
                                    errorInvalidPhoneMsg={
                                        settings?.errorInvalidPhoneMsg
                                    }
                                    defaultValues={orderFormValues}
                                    redirectUrl={redirectUrl}
                                    showIframe={showIframe}
                                    paymentMethodsOptions={
                                        paymentMethodsOptions
                                    }
                                    language={language}
                                    merchantAgreementUrl={merchantAgreementUrl}
                                    invoiceAddressSelection={
                                        invoiceAddressSelection
                                    }
                                    userActionCallback={userActionCallback}
                                    setContactCallback={setContactCallback}
                                    errorValidationTitleMsg={
                                        settings?.errorValidationTitleMsg
                                    }
                                    errorValidationDenialOrderBlockingMsg={
                                        settings?.errorValidationDenialOrderBlockingMsg
                                    }
                                    errorValidationBlockingOffersMsg={
                                        settings?.errorValidationBlockingOffersMsg
                                    }
                                    orderDenialOfferBaseText={
                                        settings?.orderDenialOfferBaseText
                                    }
                                    orderDenialOfferWithFallbackText={
                                        settings?.orderDenialOfferWithFallbackText
                                    }
                                    orderDenialAmountText={
                                        settings?.orderDenialAmountText
                                    }
                                    fetchDenialFallbackOffer={
                                        settings?.fetchDenialFallbackOffer
                                    }
                                    termsAndConditionsText={
                                        settings?.termsAndConditionsText
                                    }
                                    submitConfirmation={
                                        settings?.submitConfirmation
                                    }
                                    requireTermsAcceptance={
                                        requireTermsAcceptance
                                    }
                                />
                            )}
                    </>
                )}
                {showIframe && <MainIframe iframeSrc={iframeSrc} />}
                {isConfirmed && (
                    <Alert
                        className="mt-2"
                        type="success"
                        msg={settings?.successText}
                    />
                )}

                {isFailed && <Alert className="mt-2" msg={failedMsg} />}
                {isFailed &&
                    errorsMsg?.length > 0 &&
                    errorsMsg.map((i, index) => (
                        <Alert key={`${i}-${index}`} className="mt-2" msg={i} />
                    ))}
            </div>
        </ErrorBoundary>
    );
};

export default App;
