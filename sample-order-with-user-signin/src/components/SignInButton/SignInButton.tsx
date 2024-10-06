import { FC } from 'react';
import { useMsal } from '@azure/msal-react';
import { PopupRequest } from '@azure/msal-browser';

import { AuthOpenTypeEnum } from 'Enums/general';
import Button from 'Component/Button/Button';
import { loginRequest } from 'Utils/authConfig';

type Props = {
    className?: string;
};

const SignInButton: FC<Props> = ({ className = '' }) => {
    const { instance } = useMsal();

    const handleLogin = (loginType: string) => {
        const request: PopupRequest = {
            loginHint: '',
            scopes: loginRequest.scopes,
        };

        if (loginType === AuthOpenTypeEnum.POPUP) {
            instance.loginPopup(request).catch((e: Error) => {
                console.log(e);
            });
        } else if (loginType === AuthOpenTypeEnum.REDIRECT) {
            instance.loginRedirect(request).catch((e: Error) => {
                console.log(e);
            });
        }
    };

    return (
        <div className={`d-flex align-center gap-2 ${className}`}>
            <Button
                buttonText="Sign in"
                onClick={() =>
                    handleLogin(process.env.AUTH_TYPE as AuthOpenTypeEnum)
                }
            />
        </div>
    );
};

export default SignInButton;
