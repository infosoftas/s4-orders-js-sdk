import { FC, useEffect, useState } from 'react';

import { MessageEventTypeEnum, PaymentMethodEnum } from './enums/general';
import useMessageEvent from './hooks/useMessageEvent';
import OrderForm from './components/OrderForm/OrderForm';
import Loader from './components/Loader/Loader';
import MainIframe from './components/MainIframe/MainIframe';
import Alert from './components/Alert/Alert';
import { ConfigType, ErrorsMsg } from './types/general';
import { CompleteOrderParamsType, OrderInfoType } from './types/order';
import { orderComplete, orderDelete } from './api/OrdersApi';
import { prepareErrorMessage, prepareErrorsArrayMessage } from './utils/helper';

import ErrorBoundary from './ErrorBoundary';

import './App.scss';

const App: FC<ConfigType> = ({
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
    availablePaymentMethods = [],
    language = 'en-US',
    merchantAgreementUrl = '',
    settings = {
        successText: 'Order successful completed!',
        failureText: 'Something went wrong!',
        buttonText: 'Start',
    },
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [showOrderForm, setShowOrderForm] = useState<boolean>(true);
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [isFailed, setIsFailed] = useState<boolean>(false);
    const [failedMsg, setFailedMsg] = useState<string>('');
    const [errorsMsg, setErrorsMsg] = useState<string[]>([]);
    const [orderInfo, setOrderInfo] = useState<OrderInfoType | null>(null);

    useEffect(() => {
        if (apiKey) {
            sessionStorage.setItem('sdk_api_key', apiKey);
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
            await orderComplete(orderId || data.orderId || '');
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

    const handleMessageEvent = async (type: MessageEventTypeEnum) => {
        if (type === MessageEventTypeEnum.CANCEL) {
            try {
                if (orderId) {
                    await handleOrderDelete(orderId);
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
            if (window === top) {
                setIsConfirmed(true);
                setLoading(false);
                top.postMessage(
                    {
                        type: MessageEventTypeEnum.ORDER_FLOW_COMPLETE,
                        isCompleted: true,
                        orderInfo: data || null,
                    },
                    top?.location?.origin || '*'
                );
            }
        } else if (url) {
            if (
                showIframe &&
                data?.paymentMethod === PaymentMethodEnum.SwedbankPay
            ) {
                setIframeSrc(url);
                return;
            }

            window.location.href = url;
            return;
        }

        setIframeSrc(null);
    };

    if (window !== top) {
        return null;
    }

    return (
        <ErrorBoundary>
            <div
                className={`sdk-order-container ${
                    iframeSrc ? 'show-iframe' : ''
                }`}
                data-testid="sdk-order-module-id"
            >
                {moduleTitle && <h1 className="text-center">{moduleTitle}</h1>}
                {loading && (
                    <div className="d-flex justify-center">
                        <Loader size="lg" dark={true} />
                    </div>
                )}
                {!iframeSrc && showOrderForm && (
                    <OrderForm
                        callback={handleForm}
                        templatePackageId={templatePackageId}
                        subscriberId={subscriberId}
                        userId={userId}
                        identityProviderId={identityProviderId}
                        organizationId={organizationId}
                        paymentMethods={availablePaymentMethods}
                        buttonText={settings?.buttonText}
                        paymentMethodLabel={settings?.paymentMethodLabel}
                        errorReqMsg={settings?.errorReqMsg}
                        errorInvalidEmailMsg={settings?.errorInvalidEmailMsg}
                        errorInvalidPhoneMsg={settings?.errorInvalidPhoneMsg}
                        defaultValues={settings?.orderDefaultValues}
                        redirectUrl={redirectUrl}
                        showIframe={showIframe}
                        paymentMethodsOptions={paymentMethodsOptions}
                        language={language}
                        merchantAgreementUrl={merchantAgreementUrl}
                    />
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
                    errorsMsg.map((i) => <Alert className="mt-2" msg={i} />)}
            </div>
        </ErrorBoundary>
    );
};

export default App;
