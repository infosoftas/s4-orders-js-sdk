import { createRoot, Root } from 'react-dom/client';
import { createElement } from 'react';

import { ConfigType } from './types/general';
import { createSubscriber, mapSubscriberToUser } from './api/SubscribeApi';
import App from './App';

let root: Root;

export const orderComponent = {
    init: function (config: ConfigType) {
        const domNode = document.getElementById(config.domElementId);
        root = createRoot(domNode || document.createElement('div'));
        const reactElement = createElement(App, config);
        root.render(reactElement);
    },
    remove: function () {
        (root as Root)?.unmount();
    },
    createSubscriber,
    mapSubscriberToUser,
};
