import { FC, useEffect, useState } from 'react';

import useQueryParams from 'Hooks/useQueryParams';
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
    orderFormFields,
    availablePaymentMethods = [],
    generateSubscriberContact = false,
    strings = {
        successText: 'Order successful completed!',
        failureText: 'Something went wrong!',
        buttonText: 'Start',
    },
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [iframeSrc, setIframeSrc] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [agreementId, setAgreementId] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
    const [isFailed, setIsFailed] = useState<boolean>(false);
    const [failedMsg, setFailedMsg] = useState<string>('');
    const queryParams = useQueryParams();

    const messageCallback = async (
        data: CompleteOrderParamsType
    ): Promise<void> => {
        setIframeSrc(null);
        setOrderId(data.orderId);
        setAgreementId(data.agreementId);
        setIsFailed(false);
        setLoading(true);
        try {
            await orderComplete({
                orderId: data.orderId,
                agreementId: data.agreementId,
            });
            setIsConfirmed(true);
            setLoading(false);
        } catch (error) {
            console.log(error);
            if (typeof error === 'string') {
                setFailedMsg(error);
            }
            setIsFailed(true);
            setLoading(false);
        }
    };

    useMessageEvent(messageCallback);

    const handleForm = (url: string | null) => {
        setIsConfirmed(false);
        setIsFailed(false);
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

    useEffect(() => {
        if (
            queryParams.get('orderId') &&
            queryParams.get('agreementId') &&
            !showIframe
        ) {
            messageCallback({
                orderId: queryParams.get('orderId') || '',
                agreementId: queryParams.get('agreementId') || '',
            });
        }
    }, [
        queryParams.get('orderId'),
        queryParams.get('agreementId'),
        showIframe,
    ]);

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
                    tenantId={tenantId}
                    organizationId={organizationId}
                    paymentMethods={availablePaymentMethods}
                    generateSubscriberContact={
                        generateSubscriberContact || false
                    }
                    redirectUrl={
                        showIframe
                            ? window.location.toString()
                            : redirectUrl || window.location.toString()
                    }
                    buttonText={strings?.buttonText}
                    orderFormFields={orderFormFields}
                />
            )}
            {showIframe && <MainIframe iframeSrc={iframeSrc} />}
            {isConfirmed && (
                <p className="text-success">{strings?.successText}</p>
            )}
            {isFailed && (
                <p className="text-error">
                    {failedMsg || strings?.failureText}
                </p>
            )}
        </div>
    );
};

export default App;
