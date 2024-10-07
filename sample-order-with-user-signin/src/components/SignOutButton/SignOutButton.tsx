import { FC } from 'react';
import { useMsal } from '@azure/msal-react';
import { EndSessionRequest, EndSessionPopupRequest } from '@azure/msal-browser';

import { AuthOpenTypeEnum } from 'Enums/general';
import Button from 'Component/Button/Button';

type Props = {
    className?: string;
};

const SignOutButton: FC<Props> = ({ className = '' }) => {
    const { instance } = useMsal();

    const handleLogOut = (logoutType: AuthOpenTypeEnum) => {
        const request: EndSessionRequest = {
            postLogoutRedirectUri: '/',
        };

        if (logoutType === AuthOpenTypeEnum.POPUP) {
            instance
                .logoutPopup({
                    ...request,
                    mainWindowRedirectUri: '/',
                } as EndSessionPopupRequest)
                .catch((e: Error) => {
                    console.log(e);
                });
        } else if (logoutType === AuthOpenTypeEnum.REDIRECT) {
            instance.logoutRedirect(request).catch((e: Error) => {
                console.log(e);
            });
        }
    };

    return (
        <div className={`d-flex align-center gap-2 ${className}`}>
            <Button
                buttonText="Sign out"
                onClick={() =>
                    handleLogOut(process.env.AUTH_TYPE as AuthOpenTypeEnum)
                }
            />
        </div>
    );
};

export default SignOutButton;
