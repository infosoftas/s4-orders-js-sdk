import { createRoot } from 'react-dom/client';
import { createElement } from 'react';

import { MainForm } from './components/MainForm/MainForm';

type ConfigType = {
    domElementId: string;
    companyName: string;
};

export const orderComponent = {
    init: function (config: ConfigType) {
        const domNode = document.getElementById(config.domElementId);
        const root = createRoot(domNode || document.createElement('div'));
        const reactElement = createElement(MainForm, config);
        root.render(reactElement);
    },
};
