import { FC, useEffect, useState } from 'react';

import useQueryParams from 'Hooks/useQueryParams';
import useMessageEvent from 'Hooks/useMessageEvent';
import MainForm from 'Component/MainForm/MainForm';
import MainIframe from 'Component/MainIframe/MainIframe';
import { CompleteOrderParamsType, ConfigType } from 'Types/general';
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
    strings = {
        successText: 'Order successful completed!',
        failureText: 'Something went wrong!',
        buttonText: 'Start',
    },
}) => {
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
        try {
            await orderComplete({
                orderId: data.orderId,
                agreementId: data.agreementId,
            });
            setIsConfirmed(true);
        } catch (error) {
            console.log(error);
            if (typeof error === 'string') {
                setFailedMsg(error);
            }
            setIsFailed(true);
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
            {!iframeSrc && !orderId && !agreementId && (
                <MainForm
                    callback={handleForm}
                    templatePackageId={templatePackageId}
                    subscriberId={subscriberId}
                    tenantId={tenantId}
                    organizationId={organizationId}
                    redirectUrl={
                        showIframe
                            ? window.location.toString()
                            : redirectUrl || window.location.toString()
                    }
                    buttonText={strings?.buttonText}
                />
            )}
            {showIframe && <MainIframe iframeSrc={iframeSrc} />}
            {isConfirmed && <p>{strings?.successText}</p>}
            {isFailed && (
                <p className="error">{failedMsg || strings?.failureText}</p>
            )}
        </div>
    );
};

export default App;
