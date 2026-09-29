const postcss = require('postcss');

const DEFAULT_SCOPE = '.sdk-scope';
const DEFAULT_LAYERS = ['utilities'];

const plugin = (opts = {}) => {
    const scope = opts.scope || DEFAULT_SCOPE;
    const layers = opts.layers || DEFAULT_LAYERS;
    const required = opts.required !== false;

    return {
        postcssPlugin: 'scope-tailwind',

        OnceExit(root, { result }) {
            const wrapped = [];

            root.walkAtRules('layer', (atRule) => {
                const name = atRule.params.trim();
                if (!layers.includes(name)) return;
                if (!atRule.nodes || atRule.nodes.length === 0) return;
                if (
                    atRule.nodes.length === 1 &&
                    atRule.first.type === 'atrule' &&
                    atRule.first.name === 'scope'
                ) {
                    return;
                }

                const scoped = postcss.atRule({
                    name: 'scope',
                    params: `(${scope})`,
                    nodes: [],
                    raws: { before: '\n', after: '\n', between: ' ' },
                });

                const children = atRule.nodes;
                atRule.removeAll();
                scoped.append(children);
                atRule.append(scoped);

                wrapped.push(name);
            });

            if (required && wrapped.length === 0) {
                throw root.error(
                    `scope-tailwind: none of the layers [${layers.join(
                        ', '
                    )}] were found, so nothing was scoped. Tailwind's utilities ` +
                        `would ship as global selectors and could restyle the ` +
                        `host page. Check that this plugin runs after ` +
                        `@tailwindcss/postcss.`
                );
            }

            result.messages.push({
                type: 'scope-tailwind',
                plugin: 'scope-tailwind',
                scopedLayers: wrapped,
            });
        },
    };
};

plugin.postcss = true;

module.exports = plugin;
