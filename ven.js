/*
*@author Myxo victor
*@type Framework + engine
*@Built for UIs and animations
*@copy Copyright Aximon 2025 | Mit Lincense
*/

const venjs = {
    createElement: (tag, props = {}, children = []) => {
        const isNode = typeof window === 'undefined';
        if (isNode) {
            return { tag, props: { ...props }, children: children.map(child => typeof child === 'string' ? child : child) };
        }
        const element = document.createElement(tag);
        if (props.textContent) element.textContent = props.textContent;
        if (props.className) element.className = props.className;
        if (props.id) element.id = props.id;
        if (props.style) Object.assign(element.style, props.style);
        if (props.events) {
            Object.entries(props.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }
        if (props.value !== undefined) element.value = props.value;
        if (props.placeholder) element.placeholder = props.placeholder;
        if (props.type) element.type = props.type;
        if (props.src) element.src = props.src;
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        });
        return element;
    },

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

    /**
     * venjs.animate
     * Triggers high-performance animations using WAAPI and Intersection Observer
     * @param {string|HTMLElement} selector - CSS selector or Element
     * @param {Object} options - Animation config (slideFrom, duration, easing, etc.)
     */
    animate: function(selector, options = {}) {
        if (typeof window === 'undefined') return;

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

    // Internal animation player
    _play: (el, options, config) => {
        // Promote to GPU layer
        el.style.willChange = 'transform, opacity';

        const keyframes = [];
        const start = { opacity: options.opacity ? options.opacity[0] : 0, transform: '' };
        const end = { opacity: options.opacity ? options.opacity[1] : 1, transform: 'translate(0,0) scale(1)' };

        // Handle Sliding
        if (options.slideFrom === 'left') start.transform += 'translateX(-100px) ';
        if (options.slideFrom === 'right') start.transform += 'translateX(100px) ';
        if (options.slideFrom === 'top') start.transform += 'translateY(-100px) ';
        if (options.slideFrom === 'bottom') start.transform += 'translateY(100px) ';

        // Handle Scaling
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

    loadPage: async (page, documentation) => {
        const content = documentation[page] || documentation['hello-world'];
        return venjs.createElement('div', {}, [
            venjs.createElement('h2', { className: 'text-2xl font-bold mb-4', textContent: content.title }),
            venjs.createElement('div', { className: 'prose', innerHTML: content.content })
        ]);
    },

    ven: (app, component) => {
        if (typeof window === 'undefined') {
            console.log('Venjs running in Node.js');
        } else {
            if (app) {
                app.innerHTML = '';
                app.appendChild(component());
            } else {
                console.error('App element not found');
            }
        }
    }
};
