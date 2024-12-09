import { FC, useRef, useEffect } from 'react';
import {
    useIsAuthenticated,
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
    useMsal,
} from '@azure/msal-react';

import SignInButton from 'Component/SignInButton/SignInButton';
import SignOutButton from 'Component/SignOutButton/SignOutButton';
import SignUpButton from 'Component/SignUpButton/SignUpButton';
import OrderPlace from 'Component/OrderPlace/OrderPlace';
import { TokenClaimsType } from 'Types/general';
import { loginRequest } from 'Utils/authConfig';

import { AuthContext } from './context/auth/Auth.context';
import { useAuthContextValue } from './context/auth/useAuthContextValue';

const AppLayout: FC = () => {
    const isAuthenticated = useIsAuthenticated();
    const { accounts, inProgress, instance } = useMsal();
    const authContextValue = useAuthContextValue();
    const tokenRef = useRef(false);

    console.log(isAuthenticated);

    useEffect(() => {
        if (accounts?.[0]?.idTokenClaims && !tokenRef.current) {
            tokenRef.current = true;
            authContextValue.setIdTokenClaims(
                accounts?.[0]?.idTokenClaims as TokenClaimsType
            );
        }
    }, [accounts, authContextValue]);

    useEffect(() => {
        if (
            accounts.length > 0 &&
            inProgress === 'none' &&
            !accounts?.[0]?.idTokenClaims &&
            !authContextValue?.idTokenClaims?.sub
        ) {
            const request = {
                scopes: loginRequest.scopes,
                account: accounts[0],
            };

            instance
                .acquireTokenSilent(request)
                .then((response) => {
                    const idTokenClaims =
                        response.idTokenClaims as unknown as TokenClaimsType;
                    authContextValue.setIdTokenClaims(idTokenClaims);
                    tokenRef.current = true;
                })
                .catch((error) => {
                    console.error('Token acquisition failed:', error);
                });
        }
    }, [instance, accounts, inProgress, authContextValue]);

    return (
        <AuthContext.Provider value={authContextValue}>
            <div className="app-layout-wrapper" data-testid="app-layout-id">
                <AuthenticatedTemplate>
                    <h5 className="text-center">Login in.</h5>
                    <div className="d-flex flex-column align-center">
                        <SignOutButton className="mb-2" />
                        <OrderPlace />
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <h5 className="text-center">
                        Please sign-in to see your profile information.
                    </h5>
                    <div className="d-flex justify-center">
                        <SignInButton className="mb-2 mx-2" />
                        <SignUpButton className="mb-2 mx-2" />
                    </div>
                </UnauthenticatedTemplate>
            </div>
        </AuthContext.Provider>
    );
};

export default AppLayout;
