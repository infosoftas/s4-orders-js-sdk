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
    redirectUrl,
    showIframe,
    strings,
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
        setIsFailed(true);
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
                    buttonText={strings?.buttonText}
                    templatePackageId={templatePackageId}
                    subscriberId={subscriberId}
                    tenantId={tenantId}
                    organizationId={organizationId}
                    redirectUrl={redirectUrl}
                />
            )}
            {showIframe && <MainIframe iframeSrc={iframeSrc} />}
            {isConfirmed && <p>Congratulation!</p>}
            {isFailed && (
                <p className="error">
                    {failedMsg ||
                        strings?.somethingWrongText ||
                        'Wrong, try again!'}
                </p>
            )}
        </div>
    );
};

export default App;
