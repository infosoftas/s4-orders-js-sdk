import { FC, useState } from 'react';

import { MessageEventTypeEnum } from 'Enums/general';
import useMessageEvent from 'Hooks/useMessageEvent';
import OrderForm from 'Component/OrderForm/OrderForm';
import Loader from 'Component/Loader/Loader';
import MainIframe from 'Component/MainIframe/MainIframe';
import { ConfigType } from 'Types/general';
import { CompleteOrderParamsType } from 'Types/order';
import { orderComplete } from 'API/OrdersApi';

import './App.scss';

const App: FC<ConfigType> = ({
    companyName,
    templatePackageId,
    subscriberId,
    tenantId,
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
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [newOrderId, setNewOrderId] = useState<string | null>(null);
    const [agreementId, setAgreementId] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [isFailed, setIsFailed] = useState<boolean>(false);
    const [failedMsg, setFailedMsg] = useState<string>('');

    const messageCallback = async (
        data: CompleteOrderParamsType
    ): Promise<void> => {
        setIframeSrc(null);
        setOrderId(data.orderId);
        setAgreementId(data.agreementId);
        setIsFailed(false);
        setLoading(true);
        try {
            await orderComplete(newOrderId || data.orderId || '');
            setIsConfirmed(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            if (typeof error === 'string') {
                try {
                    const parsedError = JSON.parse(error);
                    setFailedMsg((parsedError as { message: string }).message);
                } catch (e) {
                    setFailedMsg(error);
                }
            } else if ((error as { message: string })?.message) {
                setFailedMsg((error as { message: string }).message);
            }
            setIsFailed(true);
            setLoading(false);
        }
    };

    const handleMessageEvent = (type: MessageEventTypeEnum) => {
        if (type === MessageEventTypeEnum.CANCEL) {
            setIsFailed(false);
            setLoading(false);
            setIframeSrc(null);
            setOrderId(null);
            setAgreementId(null);
        }
    };

    useMessageEvent(messageCallback, handleMessageEvent, !!showIframe);

    const handleForm = (url: string | null, id?: string | null) => {
        setIsConfirmed(false);
        setIsFailed(false);
        setNewOrderId(id || null);
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
        <div className="sdk-order-container" data-testid="sdk-app-id">
            {companyName && <h1>{companyName}</h1>}
            {loading && (
                <div className="d-flex justify-center">
                    <Loader size="lg" dark={true} />
                </div>
            )}
            {!iframeSrc && !orderId && !agreementId && (
                <OrderForm
                    callback={handleForm}
                    templatePackageId={templatePackageId}
                    subscriberId={subscriberId}
                    organizationId={organizationId}
                    paymentMethods={availablePaymentMethods}
                    buttonText={settings?.buttonText}
                    defaultValues={settings?.orderDefaultValues}
                    redirectUrl={
                        showIframe
                            ? window.location.toString()
                            : redirectUrl || window.location.toString()
                    }
                    paymentMethodsOptions={paymentMethodsOptions}
                    language={language}
                    merchantAgreementUrl={merchantAgreementUrl}
                />
            )}
            {showIframe && <MainIframe iframeSrc={iframeSrc} />}
            {isConfirmed && (
                <p className="text-success">{settings?.successText}</p>
            )}
            {isFailed && (
                <p className="text-error">
                    {failedMsg || settings?.failureText}
                </p>
            )}
        </div>
    );
};

export default App;
