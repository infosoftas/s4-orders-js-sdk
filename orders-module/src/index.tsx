import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';

import { ConfigType } from './types/general';
import { createSubscriber, mapSubscriberToUser } from './api/SubscribeApi';
import App from './App';

export const orderComponent = {
    root: null as Root | null,
    init: function (config: ConfigType) {
        const domNode = document.getElementById(config.domElementId);
        orderComponent.root = createRoot(
            domNode || document.createElement('div')
        );
        const reactElement = createElement(App, config);
        orderComponent.root.render(reactElement);
    },
    remove: function () {
        (orderComponent.root as Root)?.unmount();
    },
    createSubscriber,
    mapSubscriberToUser,
};
