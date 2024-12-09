import { useState } from 'react';

import { TokenClaimsType } from 'Types/general';

import { AuthContextValueType } from './Auth.context';

const initialState: TokenClaimsType = {
    sub: '',
    emails: [],
    extension_SubscriberId: '',
    extension_Products: [],
};

export const useAuthContextValue = (): AuthContextValueType => {
    const [idTokenClaims, setIdTokenClaims] =
        useState<TokenClaimsType>(initialState);

    return {
        idTokenClaims,
        setIdTokenClaims,
    };
};
