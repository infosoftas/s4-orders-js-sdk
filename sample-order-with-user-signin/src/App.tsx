import React from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from 'Utils/authConfig';

import AppLayout from './AppLayout';
import ErrorBoundary from './ErrorBoundary';

import './App.scss';

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
    return (
        <React.StrictMode>
            <ErrorBoundary>
                <MsalProvider instance={msalInstance}>
                    <AppLayout />
                </MsalProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}

export default App;
