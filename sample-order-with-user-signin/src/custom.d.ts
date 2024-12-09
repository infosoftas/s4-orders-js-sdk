declare module '*.svg' {
    import * as React from 'react';

    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    const src: string;
    export default src;
}

declare module '*.png' {
    const value: string;
    export default value;
}

declare module 'react-to-pdf';

type OrderComponentType = {
    root: Root | null;
    init: (config: ConfigType) => void;
    remove: () => void;
    createSubscriber: ({ email: string }) => Promise<{ id: string }>;
    mapSubscriberToUser: (
        id: string,
        data: {
            userId: string;
            identityProviderId: string;
        }
    ) => Promise<void>;
};

declare module '@infosoftas/s4-orders-js-sdk/src/index' {
    export const orderComponent: OrderComponentType;
}
