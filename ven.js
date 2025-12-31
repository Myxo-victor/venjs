/*
* @author Myxo victor
* @type Cross-Platform Framework + Engine
* @Version 2.3 (Unified + API Connector + Rendering Aliases)
* @copy Copyright Aximon 2025 | MIT License
*/

const venjs = {
    // Detect environment
    isWeb: typeof window !== 'undefined' && typeof document !== 'undefined',

    // --- API CONNECTOR MODULE ---
    api: {
        /**
         * venjs.api.connect
         * Unified method for API calls using a modern async/await interface.
         * @param {string} url - The target endpoint URL.
         * @param {Object} options - Custom configuration (method, headers, body, etc.)
         */
        connect: async function(url, options = {}) {
            const config = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            // Automatically stringify object bodies
            if (options.body && typeof options.body === 'object') {
                config.body = JSON.stringify(options.body);
            }

            try {
                const response = await fetch(url, config);
                
                if (!response.ok) {
                    throw new Error(`Venjs API Error: ${response.status} ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                console.error("Venjs Connection Failed:", error);
                throw error;
            }
        }
    },

    // --- UI ENGINE ---
    createElement: (tag, props = {}, children = []) => {
        // MOBILE/NODE LOGIC: Return a Virtual Node
        if (!venjs.isWeb) {
            return {
                type: 'VEN_NODE',
                tag: tag,
                props: { ...props },
                children: children.map(child => 
                    typeof child === 'string' ? { type: 'TEXT', content: child } : child
                )
            };
        }

        // WEB LOGIC: Return real DOM element
        const element = document.createElement(tag);
        
        // Handle Properties
        if (props.textContent) element.textContent = props.textContent;
        if (props.className) element.className = props.className;
        if (props.id) element.id = props.id;
        if (props.style) Object.assign(element.style, props.style);
        if (props.value !== undefined) element.value = props.value;
        if (props.placeholder) element.placeholder = props.placeholder;
        if (props.type) element.type = props.type;
        if (props.src) element.src = props.src;

        // Handle Events
        if (props.events) {
            Object.entries(props.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }

        // Handle Children
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });

        return element;
    },

    // --- STATE MANAGEMENT ---
    createStore: (initialState) => {
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

    // --- ANIMATION ENGINE ---
    animate: function(selector, options = {}) {
        if (!venjs.isWeb) return;

        const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
        const config = {
            duration: options.duration || 1000,
            easing: options.easing || 'cubic-bezier(0.22, 1, 0.36, 1)',
            delay: options.delay || 0,
            threshold: options.threshold || 0.1,
            once: options.once !== false
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this._play(entry.target, options, config);
                    if (config.once) observer.unobserve(entry.target);
                }
            });
        }, { threshold: config.threshold });

        elements.forEach(el => observer.observe(el));
    },

    _play: (el, options, config) => {
        el.style.willChange = 'transform, opacity';
        const start = { opacity: options.opacity ? options.opacity[0] : 0, transform: '' };
        const end = { opacity: options.opacity ? options.opacity[1] : 1, transform: 'translate(0,0) scale(1)' };

        if (options.slideFrom === 'left') start.transform += 'translateX(-100px) ';
        if (options.slideFrom === 'right') start.transform += 'translateX(100px) ';
        if (options.slideFrom === 'top') start.transform += 'translateY(-100px) ';
        if (options.slideFrom === 'bottom') start.transform += 'translateY(100px) ';

        if (options.scale) {
            start.transform += `scale(${options.scale[0]}) `;
            end.transform = 'translate(0,0) scale(' + options.scale[1] + ')';
        }

        el.animate([start, end], {
            duration: config.duration,
            easing: config.easing,
            delay: config.delay,
            fill: 'forwards'
        });
    },

    // --- RENDERING & ALIASES ---
    render: function(app, component) {
        if (!venjs.isWeb) {
            const uiTree = component();
            console.log('Mobile UI Tree generated:', uiTree);
            return;
        }

        if (app) {
            app.innerHTML = '';
            const content = component();
            // Ensure we handle both Ven elements and standard strings/nodes
            if (content instanceof HTMLElement) {
                app.appendChild(content);
            } else if (typeof content === 'string') {
                app.innerHTML = content;
            }
        }
    }
};

// Define Aliases
venjs.ven = venjs.render;
venjs.mount = venjs.render;
