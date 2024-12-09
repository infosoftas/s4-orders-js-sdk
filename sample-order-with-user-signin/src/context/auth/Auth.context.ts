import { createContext, useContext } from 'react';

import { TokenClaimsType } from 'Types/general';

export type AuthContextValueType = {
    idTokenClaims: TokenClaimsType;
    setIdTokenClaims(state: TokenClaimsType): void;
};

export const AuthContext = createContext<AuthContextValueType | null>(null);

export function useAuthContext() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuthContext must be used along with AuthContext.Provider'
        );
    }

    return context;
}
