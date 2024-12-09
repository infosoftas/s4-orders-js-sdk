import { FC, useEffect, useRef } from 'react';
import { orderComponent } from '@infosoftas/s4-orders-js-sdk/src/index';

import { useAuthContext } from 'Context/auth/Auth.context';
import { prepareConfig } from 'Utils/moduleConfig';
import { ORDER_PLACE_ID } from 'Constants/index';

const OrderPlace: FC = () => {
    const { idTokenClaims } = useAuthContext();
    const moduleMount = useRef(false);
    const userEmail = idTokenClaims?.emails?.[0];

    useEffect(() => {
        if (!moduleMount.current && idTokenClaims) {
            moduleMount.current = true;
            const config = prepareConfig({
                apiKey: process.env.API_KEY || '',
                apiUrl: process.env.ORDER_SDK_API_URL || '',
                userId: idTokenClaims?.sub || '',
                subscriberId: idTokenClaims?.extension_SubscriberId || '',
                identityProviderId: process.env.IDENTITY_PROVIDER_ID || '',
                templatePackageId: process.env.TEMPLATE_PACKAGE_ID || '',
                selfServiceUrl: process.env.SELF_SERVICE_URL || '',
                organizationId: process.env.ORGANIZATION_ID || '',
                userEmail: userEmail || '',
                name: idTokenClaims.name,
                city: idTokenClaims.city,
                country: idTokenClaims.country,
                postalCode: idTokenClaims.postalCode,
                streetAddress: idTokenClaims.streetAddress,
            });
            orderComponent?.remove();
            orderComponent?.init(config);
        }
    }, [idTokenClaims, userEmail]);

    return (
        <div
            id={ORDER_PLACE_ID}
            className="w-100 order-wrapper"
            data-testid="order-place-id"
        />
    );
};

export default OrderPlace;
