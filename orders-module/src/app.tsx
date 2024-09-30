import { FC, useEffect, useState } from 'react';

import useQueryParams from 'Hooks/useQueryParams';
import useMessageEvent from 'Hooks/useMessageEvent';
import MainForm from 'Component/MainForm/MainForm';
import AddSubscriberForm from 'Component/AddSubscriberForm/AddSubscriberForm';
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
    paymentMethod,
    generateSubscriberContact,
    redirectUrl,
    showIframe,
    availablepaymentmethods = [],
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
        <div className="sdk-order-container">
            {companyName && <h1>{companyName}</h1>}
            {loading && (
                <div className="d-flex justify-center">
                    <Loader size="lg" dark={true} />
                </div>
            )}
            {!iframeSrc && !orderId && !agreementId && (
                <AddSubscriberForm
                    callback={handleForm}
                    templatePackageId={templatePackageId}
                    subscriberId={subscriberId}
                    tenantId={tenantId}
                    organizationId={organizationId}
                    paymentMethods={availablepaymentmethods}
                    redirectUrl={
                        showIframe
                            ? window.location.toString()
                            : redirectUrl || window.location.toString()
                    }
                    buttonText={strings?.buttonText}
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
