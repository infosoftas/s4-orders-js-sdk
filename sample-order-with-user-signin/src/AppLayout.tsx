import { FC } from 'react';
import {
    useIsAuthenticated,
    AuthenticatedTemplate,
    UnauthenticatedTemplate,
} from '@azure/msal-react';

import SignInButton from 'Component/SignInButton/SignInButton';
import SignOutButton from 'Component/SignOutButton/SignOutButton';
import SignUpButton from 'Component/SignUpButton/SignUpButton';

const AppLayout: FC = () => {
    const isAuthenticated = useIsAuthenticated();

    console.log(isAuthenticated);

    return (
        <div className="app-layout-wrapper" data-testid="app-layout-id">
            <AuthenticatedTemplate>
                <h5 className="text-center">Login in.</h5>
                <div className="d-flex flex-column align-center">
                    <SignOutButton className="mb-2" />
                    <div id="order" className="w-100 order-wrapper" />
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
    );
};

export default AppLayout;
