/*
* @author Myxo victor
* @type Enterprise-Level UI Framework + Engine
* @Version 4.0 (Unified: VDom + Signals + Legacy Store + Animation + UI + Notifications + Prebuilt components)
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
        Object.keys(prevProps).forEach(name => {
            if (isEvent(name)) {
                const eventType = name.toLowerCase().substring(2);
                dom.removeEventListener(eventType, prevProps[name]);
            } else if (isProperty(name)) {
                if (name === 'className' || name === 'class') dom.className = '';
                else dom.removeAttribute(name);
            }
        });

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

    // --- ENTERPRISE UI COMPONENTS ---
    const UI = {
        button: (props, ...children) => {
            const baseClass = "px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ";
            const variant = props.variant === 'outline' 
                ? "border-2 border-blue-600 text-blue-600 hover:bg-blue-50" 
                : "bg-blue-600 text-white shadow-lg hover:shadow-blue-200";
            return createVNode("button", { ...props, class: baseClass + variant + " " + (props.class || "") }, ...children);
        },

        input: (props) => {
            return createVNode("div", { class: "flex flex-col gap-1 w-full" }, [
                props.label ? createVNode("label", { class: "text-sm font-semibold text-gray-600 ml-1" }, props.label) : null,
                createVNode("input", { 
                    ...props, 
                    class: "px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all " + (props.class || "") 
                })
            ]);
        },

        appBar: (props) => {
            return createVNode("nav", { 
                class: "sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between backdrop-blur-md bg-white/80 border-b border-gray-100" 
            }, [
                createVNode("div", { class: "text-xl font-black tracking-tighter text-blue-600" }, props.title || "VENJS"),
                createVNode("div", { class: "hidden md:flex gap-6 font-medium text-gray-600" }, props.links || []),
                props.trailing || createVNode("div", { class: "w-8 h-8 rounded-full bg-gray-200" })
            ]);
        },

        sideBar: (props) => {
            const isOpen = props.isOpen !== false;
            return createVNode("aside", { 
                class: `fixed left-0 top-0 h-full bg-white border-r border-gray-100 transition-all duration-300 z-[60] ${isOpen ? 'w-64' : 'w-0 -translate-x-full'} md:translate-x-0 md:w-64 p-6` 
            }, props.children || []);
        },

        bottomNav: (props) => {
            return createVNode("div", { 
                class: "fixed bottom-0 left-0 w-full h-16 bg-white border-t border-gray-100 flex md:hidden items-center justify-around px-4 pb-safe z-50" 
            }, props.items || []);
        },

        card: (props, ...children) => {
            return createVNode("div", { 
                class: "bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow " + (props.class || "") 
            }, ...children);
        }
    };

    // --- THE CORE BASE OBJECT ---
    const base = {
        isWeb,
        signal,
        effect,
        createElement: createVNode,
        ...UI, 

        notification: {
            registerServiceWorker: async (swPath = '/sw.js') => {
                if ('serviceWorker' in navigator) {
                    try {
                        const reg = await navigator.serviceWorker.register(swPath);
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

        createStore: (initialState) => {
            let state = { ...initialState };
            const listeners = [];
            return {
                getState: () => state,
                setState: (ns) => { state = { ...state, ...ns }; listeners.forEach(l => l(state)); },
                subscribe: (l) => { listeners.push(l); return () => listeners.splice(listeners.indexOf(l), 1); }
            };
        },

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

        render: function(container, componentFactory) {
            if (!isWeb || !container) return;
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

// --- EXPORTS FOR MODULE SUPPORT ---
// Only components are exported as prebuilt named modules
export const { 
    button, appBar, sideBar, bottomNav, card, input 
} = venjs;

// The main object (containing signals, render, etc.) is the default export
export default venjs;
