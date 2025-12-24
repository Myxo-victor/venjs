const venjs = {
    // Hidden Bridge Configuration
    _bridgeUrl: 'flight.php', 

    db: {
        _execute: async (action, table, data = null, id = null) => {
            // Retrieve DB config from a global or internal store if set
            const config = window._ven_db_config || {}; 
            try {
                const response = await fetch(venjs._bridgeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ config, action, table, data, id })
                });
                return await response.json();
            } catch (err) {
                return { success: false, error: "Bridge connection failed" };
            }
        },
        // Setup credentials once
        connect: (config) => { window._ven_db_config = config; },
        // Methods requested
        fetch: (table) => venjs.db._execute('fetch', table),
        send: (table, data) => venjs.db._execute('send', table, data),
        delete: (table, id) => venjs.db._execute('delete', table, null, id),
        update: (table, id, data) => venjs.db._execute('update', table, data, id)
    },

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
        if (props.onclick) element.onclick = props.onclick; // Added for easier event handling
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
