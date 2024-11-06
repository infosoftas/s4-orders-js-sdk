import { FC, useEffect, useState } from 'react';

import { MessageEventTypeEnum } from 'Enums/general';
import useMessageEvent from 'Hooks/useMessageEvent';
import OrderForm from 'Component/OrderForm/OrderForm';
import Loader from 'Component/Loader/Loader';
import MainIframe from 'Component/MainIframe/MainIframe';
import Alert from 'Component/Alert/Alert';
import { ConfigType } from 'Types/general';
import { CompleteOrderParamsType, OrderInfoType } from 'Types/order';
import { orderComplete } from 'API/OrdersApi';
import { prepareErrorMessage } from 'Utils/helper';

import ErrorBoundary from './ErrorBoundary';

import './App.scss';

const App: FC<ConfigType> = ({
    moduleTitle,
    apiKey,
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
    const [orderInfo, setOrderInfo] = useState<OrderInfoType | null>(null);

    useEffect(() => {
        if (apiKey) {
            sessionStorage.setItem('sdk_api_key', apiKey);
        }
    }, [apiKey]);

    const messageCallback = async (
        data: CompleteOrderParamsType
    ): Promise<void> => {
        setLoading(true);
        setIframeSrc(null);
        setShowOrderForm(false);
        setIsFailed(false);
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
            setFailedMsg(
                prepareErrorMessage(error as Error, settings?.failureText)
            );
            setIsFailed(true);
            setLoading(false);
            setShowOrderForm(true);
        }
    };

    const handleMessageEvent = (type: MessageEventTypeEnum) => {
        if (type === MessageEventTypeEnum.CANCEL) {
            setLoading(false);
            setOrderId(null);
            setOrderInfo(null);
            setIframeSrc(null);
            setIsConfirmed(false);
            setIsFailed(false);
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
        if (url) {
            if (showIframe) {
                setIframeSrc(url);
                let params = new URL(url).searchParams;
                let token = params.get('token');
                console.log(token);
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
                className="sdk-order-container"
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
                        redirectUrl={
                            showIframe
                                ? window.location.href.split('?')[0]
                                : redirectUrl ||
                                  window.location.href.split('?')[0]
                        }
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
            </div>
        </ErrorBoundary>
    );
};

export default App;
