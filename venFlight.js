const venjs = {
    // 1. DYNAMIC BRIDGE DETECTION
    // This logic ensures 'flight.php' is relative to the venjs file, not the page URL.
    _bridgeUrl: (function() {
        const script = document.currentScript;
        if (script && script.src) {
            // Get the folder where venjs script is located
            const url = new URL(script.src);
            const pathParts = url.pathname.split('/');
            pathParts.pop(); // Remove 'venFlight.js'
            const folderPath = pathParts.join('/');
            return `${url.origin}${folderPath}/flight.php`;
        }
        // Fallback to absolute GitHub if everything else fails
        return 'https://raw.githubusercontent.com/Myxo-victor/venjs/main/flight.php';
    })(),

    db: {
        _execute: async (action, table, data = null, id = null) => {
            const config = window._ven_db_config || {}; 
            try {
                const response = await fetch(venjs._bridgeUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ config, action, table, data, id })
                });
                return await response.json();
            } catch (err) {
                console.error("Venjs Bridge Error:", err);
                return { success: false, error: "Bridge connection failed" };
            }
        },
        connect: (config, customUrl = null) => { 
            window._ven_db_config = config; 
            if (customUrl) venjs._bridgeUrl = customUrl; // Allows manual override
        },
        fetch: (table) => venjs.db._execute('fetch', table),
        send: (table, data) => venjs.db._execute('send', table, data),
        delete: (table, id) => venjs.db._execute('delete', table, null, id),
        update: (table, id, data) => venjs.db._execute('update', table, data, id)
    },

    createElement: (tag, props = {}, children = []) => {
        const element = document.createElement(tag);
        Object.entries(props).forEach(([key, value]) => {
            if (key === 'events') {
                Object.entries(value).forEach(([ev, fn]) => element.addEventListener(ev, fn));
            } else if (key === 'style') {
                Object.assign(element.style, value);
            } else if (key in element) {
                element[key] = value;
            } else {
                element.setAttribute(key, value);
            }
        });
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
                listeners.forEach(l => l(state));
            },
            subscribe: (l) => {
                listeners.push(l);
                return () => listeners.splice(listeners.indexOf(l), 1);
            }
        };
    },

    ven: (app, component) => {
        if (app) {
            app.innerHTML = '';
            app.appendChild(component());
        }
    }
};
