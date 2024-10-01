import { createRoot } from 'react-dom/client';
import { createElement } from 'react';

import { ConfigType } from 'Types/general';
import App from './app';

export const orderComponent = {
    init: function (config: ConfigType) {
        const domNode = document.getElementById(config.domElementId);
        const root = createRoot(domNode || document.createElement('div'));
        const reactElement = createElement(App, config);
        root.render(reactElement);
    },
};
