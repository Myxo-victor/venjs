/*
* @author Myxo victor
* @type Cross-Platform Framework + Engine
* @Version 3.1 (VDom + Reactive Signals + Flexible Array Children + Swapped Mount)
* @copy Copyright Aximon 2025 | MIT License
*/

const venjs = (() => {
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

    // --- UTILS ---
    const isEvent = (key) => key.startsWith("on");
    const isProperty = (key) => key !== "children" && !isEvent(key);

    // --- VIRTUAL DOM CORE ---
    function createVNode(tag, props, ...children) {
        // Flatten children to handle both [child1, child2] and child1, child2
        const flatChildren = children.flat(Infinity);
        
        return {
            tag,
            props: props || {},
            children: flatChildren.map(child =>
                (child !== null && typeof child === "object" && child.tag) 
                    ? child 
                    : createTextVNode(String(child ?? ""))
            )
        };
    }

    function createTextVNode(text) {
        return {
            tag: "TEXT_ELEMENT",
            props: { nodeValue: text },
            children: []
        };
    }

    // --- REACTIVE SIGNALS ---
    let currentEffect = null;

    function signal(value) {
        const subscriptions = new Set();
        return {
            get value() {
                if (currentEffect) subscriptions.add(currentEffect);
                return value;
            },
            set value(newValue) {
                if (value === newValue) return;
                value = newValue;
                subscriptions.forEach(fn => fn());
            },
            peek: () => value
        };
    }

    function effect(fn) {
        currentEffect = fn;
        fn();
        currentEffect = null;
    }

    // --- DOM RENDERING ENGINE ---
    function createDom(vnode) {
        const dom = vnode.tag === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(vnode.tag);

        updateDom(dom, {}, vnode.props);

        vnode.children.forEach(child => {
            dom.appendChild(createDom(child));
        });

        return dom;
    }

    function updateDom(dom, prevProps, nextProps) {
        // Remove old properties
        Object.keys(prevProps)
            .filter(isProperty)
            .forEach(name => { dom[name] = ""; });

        // Remove old events
        Object.keys(prevProps)
            .filter(isEvent)
            .forEach(name => {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, prevProps[name]);
            });

        // Add new properties
        Object.keys(nextProps)
            .filter(isProperty)
            .forEach(name => {
                if (name === 'style' && typeof nextProps[name] === 'object') {
                    Object.assign(dom.style, nextProps[name]);
                } else {
                    dom[name] = nextProps[name];
                }
            });

        // Add new events
        Object.keys(nextProps)
            .filter(isEvent)
            .forEach(name => {
                const eventType = name.toLowerCase().substring(2);
                dom.addEventListener(eventType, nextProps[name]);
            });
    }

    // --- THE CORE BASE OBJECT ---
    const base = {
        isWeb,
        signal,
        effect,
        
        createElement: createVNode,

        api: {
            connect: async function(url, options = {}) {
                const config = {
                    method: options.method || 'GET',
                    headers: { 'Content-Type': 'application/json', ...options.headers },
                    ...options
                };
                if (options.body && typeof options.body === 'object') config.body = JSON.stringify(options.body);
                const response = await fetch(url, config);
                return await response.json();
            }
        },

        // Updated: mount(container, component)
        render: function(container, vnode) {
            if (!isWeb) return console.log("Tree:", vnode);
            if (!container) return console.error("Venjs: Target container not found.");

            const renderLoop = () => {
                const newVNode = typeof vnode === 'function' ? vnode() : vnode;
                
                // For now, we perform a clean re-render on signal change
                // (VDom Patching can be optimized further in v4)
                const newDom = createDom(newVNode);
                container.innerHTML = '';
                container.appendChild(newDom);
            };

            effect(renderLoop);
        }
    };

    // --- THE MAGIC PROXY (Tag shortcuts) ---
    return new Proxy(base, {
        get(target, prop) {
            if (prop in target) return target[prop];
            // Returns a function that accepts (props, childrenArray) OR (props, ...childrenArgs)
            return (props, ...children) => createVNode(prop, props, ...children);
        }
    });
})();

// Aliases
venjs.mount = venjs.render;
venjs.ven = venjs.render;

// --- EXAMPLE USAGE (The way you wanted it) ---
/*
const count = venjs.signal(0);

const App = () => {
    return venjs.div({ className: "container" }, [
        venjs.h1({ style: { color: 'blue' } }, "Venjs V3"),
        venjs.p({}, `Count is: ${count.value}`),
        venjs.button({ 
            onclick: () => count.value++,
            className: "btn"
        }, "Increment")
    ]);
};

// Mount now takes the container first
venjs.mount(document.getElementById("app"), App);
*/
