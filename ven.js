/*
* @author Myxo victor
* @type Cross-Platform Framework + Engine
* @Version 3.3 (Unified: VDom + Proxy Tags + Signals + Legacy Store & Animate)
* @copy Copyright Aximon 2025 | MIT License
*/

const venjs = (() => {
    const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

    // --- UTILS ---
    const isEvent = (key) => key.startsWith("on");
    const isProperty = (key) => key !== "children" && !isEvent(key);

    // --- VIRTUAL DOM CORE ---
    function createVNode(tag, props, ...children) {
        const flatChildren = children.flat(Infinity).filter(c => c !== null && c !== undefined);
        
        return {
            tag,
            props: props || {},
            children: flatChildren.map(child =>
                (typeof child === "object" && child.tag) 
                    ? child 
                    : createTextVNode(String(child))
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

    // --- REACTIVE SIGNALS (Modern State) ---
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

        vnode.dom = dom;
        return dom;
    }

    function updateDom(dom, prevProps, nextProps) {
        // Remove old properties/events
        Object.keys(prevProps).forEach(name => {
            if (isEvent(name)) {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, prevProps[name]);
            } else if (isProperty(name)) {
                if (name === 'className' || name === 'class') dom.className = '';
                else dom.removeAttribute(name);
            }
        });

        // Add new properties/events
        Object.keys(nextProps).forEach(name => {
            const val = nextProps[name];
            if (isEvent(name)) {
                const eventType = name.toLowerCase().substring(2);
                dom.addEventListener(eventType, val);
            } else if (isProperty(name)) {
                if (name === 'style' && typeof val === 'object') {
                    Object.assign(dom.style, val);
                } else if (name === 'className' || name === 'class') {
                    dom.className = val;
                } else if (name === 'innerHTML') {
                    dom.innerHTML = val;
                } else {
                    dom[name] = val;
                }
            }
        });
    }

    // --- THE CORE BASE OBJECT ---
    const base = {
        isWeb,
        signal,
        effect,
        createElement: createVNode,

        // --- LEGACY STATE MANAGEMENT (Added back for compatibility) ---
        createStore: function(initialState) {
            let state = { ...initialState };
            const listeners = [];
            return {
                getState: () => state,
                setState: (newState) => {
                    state = { ...state, ...newState };
                    listeners.forEach(listener => listener(state));
                },
                subscribe: (listener) => {
                    listeners.push(listener);
                    return () => listeners.splice(listeners.indexOf(listener), 1);
                }
            };
        },

        // --- API CONNECTOR ---
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

        // --- LEGACY ANIMATION ENGINE ---
        animate: function(selector, options = {}) {
            if (!isWeb) return;
            const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
            const config = {
                duration: options.duration || 1000,
                easing: options.easing || 'cubic-bezier(0.22, 1, 0.36, 1)',
                delay: options.delay || 0,
                once: options.once !== false
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this._play(entry.target, options, config);
                        if (config.once) observer.unobserve(entry.target);
                    }
                });
            }, { threshold: options.threshold || 0.1 });

            elements.forEach(el => observer.observe(el));
        },

        _play: (el, options, config) => {
            el.style.willChange = 'transform, opacity';
            const start = { opacity: options.opacity ? options.opacity[0] : 0, transform: '' };
            const end = { opacity: options.opacity ? options.opacity[1] : 1, transform: 'translate(0,0) scale(1)' };
            if (options.slideFrom === 'left') start.transform += 'translateX(-100px) ';
            if (options.slideFrom === 'right') start.transform += 'translateX(100px) ';
            if (options.scale) {
                start.transform += `scale(${options.scale[0]}) `;
                end.transform = 'translate(0,0) scale(' + options.scale[1] + ')';
            }
            el.animate([start, end], { duration: config.duration, easing: config.easing, delay: config.delay, fill: 'forwards' });
        },

        // --- RENDER / MOUNT ---
        render: function(container, componentFactory) {
            if (!isWeb) return;
            if (!container) return console.error("Venjs: Container not found.");

            let prevVNode = null;

            const renderLoop = () => {
                const nextVNode = typeof componentFactory === 'function' 
                    ? componentFactory() 
                    : componentFactory;
                
                if (!prevVNode) {
                    container.innerHTML = '';
                    container.appendChild(createDom(nextVNode));
                } else {
                    const newDom = createDom(nextVNode);
                    container.replaceChild(newDom, container.firstChild);
                }
                prevVNode = nextVNode;
            };

            effect(renderLoop);
        }
    };

    // --- PROXY FOR DYNAMIC TAGS ---
    return new Proxy(base, {
        get(target, prop) {
            if (prop in target) return target[prop];
            return (props, ...children) => createVNode(prop, props, ...children);
        }
    });
})();

// Aliases
venjs.mount = venjs.render;
venjs.ven = venjs.render;
