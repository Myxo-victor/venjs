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
        if (props.innerHTML) element.innerHTML = props.innerHTML;
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
    loadPage: async (page, documentation) => {
        console.log('Loading page:', page);
        const content = documentation[page] || documentation['hello-world'];
        if (!content) {
            console.error('No content found for page:', page);
            return venjs.createElement('div', { textContent: 'Error: Page not found' });
        }
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