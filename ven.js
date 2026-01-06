/*
* @author Myxo victor
* @type Cross-Platform Framework + Engine
* @Version 3.4 (Unified: VDom + Proxy Tags + Signals + Legacy Store + Notifications + API)
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

    // --- DOM ENGINE ---
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

        // --- NOTIFICATION MODULE (v3.4) ---
        notification: {
            registerServiceWorker: async (swPath = '/sw.js') => {
                if ('serviceWorker' in navigator) {
                    try {
                        const reg = await navigator.serviceWorker.register(swPath);
                        console.log('Venjs SW Registered:', reg.scope);
                        return reg;
                    } catch (e) { console.error('SW Registration Failed:', e); }
                }
            },
            ask: async (phpUrl = null) => {
                if (!("Notification" in window)) return false;
                const permission = await Notification.requestPermission();
                if (permission === "granted") {
                    const deviceId = btoa(navigator.userAgent + Math.random()).substring(0, 24);
                    if (phpUrl) {
                        fetch(phpUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ deviceId, type: 'browser_push', timestamp: Date.now() })
                        }).catch(e => console.error("Venjs Sync Error:", e));
                    }
                    return deviceId;
                }
                return false;
            },
            push: (options) => {
                if (Notification.permission === "granted") {
                    const n = new Notification("Venjs App", {
                        body: options.Content,
                        icon: options.icon || '',
                    });
                    n.onclick = () => {
                        window.focus();
                        if (options.url) window.open(options.url, '_blank');
                        n.close();
                    };
                }
            }
        },

        // --- LEGACY STATE ---
        createStore: (initialState) => {
            let state = { ...initialState };
            const listeners = [];
            return {
                getState: () => state,
                setState: (ns) => { state = { ...state, ...ns }; listeners.forEach(l => l(state)); },
                subscribe: (l) => { listeners.push(l); return () => listeners.splice(listeners.indexOf(l), 1); }
            };
        },

        // --- API CONNECTOR ---
        api: {
            connect: async (url, options = {}) => {
                const config = {
                    method: options.method || 'GET',
                    headers: { 'Content-Type': 'application/json', ...options.headers },
                    ...options
                };
                if (options.body && typeof options.body === 'object') config.body = JSON.stringify(options.body);
                const res = await fetch(url, config);
                return await res.json();
            }
        },

        // --- ANIMATION ENGINE ---
        animate: function(selector, options = {}) {
            if (!isWeb) return;
            const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
            const config = { duration: options.duration || 1000, easing: options.easing || 'ease-out', once: options.once !== false };

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
            const start = { opacity: options.opacity ? options.opacity[0] : 0, transform: 'translateY(20px)' };
            const end = { opacity: options.opacity ? options.opacity[1] : 1, transform: 'translateY(0)' };
            el.animate([start, end], { duration: config.duration, easing: config.easing, fill: 'forwards' });
        },

        // --- RENDER / MOUNT ---
        render: function(container, componentFactory) {
            let prevVNode = null;
            effect(() => {
                const nextVNode = typeof componentFactory === 'function' ? componentFactory() : componentFactory;
                if (!prevVNode) {
                    container.innerHTML = '';
                    container.appendChild(createDom(nextVNode));
                } else {
                    container.replaceChild(createDom(nextVNode), container.firstChild);
                }
                prevVNode = nextVNode;
            });
        }
    };

    return new Proxy(base, {
        get(target, prop) {
            if (prop in target) return target[prop];
            return (props, ...children) => createVNode(prop, props, ...children);
        }
    });
})();

venjs.mount = venjs.render;
venjs.ven = venjs.render;
