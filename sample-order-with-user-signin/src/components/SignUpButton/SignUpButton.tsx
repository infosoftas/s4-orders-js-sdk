import { FC } from 'react';
import { useMsal } from '@azure/msal-react';
import { RedirectRequest } from '@azure/msal-browser';

import { AuthOpenTypeEnum } from 'Enums/general';
import Button from 'Component/Button/Button';
import { loginRequest, SignUpAuthority } from 'Utils/authConfig';

type Props = {
    className?: string;
};

const SignUpButton: FC<Props> = ({ className = '' }) => {
    const { instance } = useMsal();

    const handleLogOut = (logoutType: AuthOpenTypeEnum) => {
        const request: RedirectRequest = {
            scopes: loginRequest.scopes,
            authority: SignUpAuthority,
        };

        if (logoutType === AuthOpenTypeEnum.POPUP) {
            instance.loginPopup(request).catch((e: Error) => {
                console.log(e);
            });
        } else if (logoutType === AuthOpenTypeEnum.REDIRECT) {
            instance.loginRedirect(request).catch((e: Error) => {
                console.log(e);
            });
        }
    };

    return (
        <div className={`d-flex align-center gap-2 ${className}`}>
            <Button
                buttonText="Sign up"
                onClick={() =>
                    handleLogOut(process.env.AUTH_TYPE as AuthOpenTypeEnum)
                }
            />
        </div>
    );
};

export default SignUpButton;
