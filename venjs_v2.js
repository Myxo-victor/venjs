/**
 * Venjs - A Lightweight VDOM-Based Framework
 *
 * Core changes:
 * 1. createElement now always returns a VNode (Virtual Node - a plain JS object).
 * 2. New helper functions (setProp, removeProp, patchProps, render) manage DOM manipulation.
 * 3. New core functions (patch, patchChildren) implement the diffing and reconciliation algorithm.
 * 4. createStore now uses a Reducer function for predictable state updates (dispatch).
 * 5. ven() now handles mounting and subsequent patching/updates.
 */

// --- GLOBAL VDOM STATE & HELPERS ---
let prevVNode = null; // Stores the last rendered Virtual Node tree
let rootElement = null; // Stores the physical root DOM element

/**
 * Helper to safely set properties (attributes, event handlers, styles) on a real DOM element.
 * @param {HTMLElement} domElement - The real DOM element.
 * @param {string} name - The property name (e.g., 'class', 'onclick').
 * @param {*} value - The property value.
 */
const setProp = (domElement, name, value) => {
    // 1. Event Handlers (onclick, oninput, etc.)
    if (name.startsWith('on') && typeof value === 'function') {
        const eventName = name.toLowerCase().substring(2);
        domElement.addEventListener(eventName, value);
    } 
    // 2. Class Name
    else if (name === 'class' || name === 'className') {
        domElement.className = value || '';
    } 
    // 3. Style Object
    else if (name === 'style' && typeof value === 'object') {
        Object.assign(domElement.style, value);
    } 
    // 4. InnerHTML (used sparingly)
    else if (name === 'innerHTML') {
        domElement.innerHTML = value || '';
    }
    // 5. Standard Attributes (id, type, value, src, placeholder, etc.)
    else if (value !== null && value !== undefined) {
        domElement.setAttribute(name, value);
    }
};

/**
 * Helper to remove properties/attributes from a real DOM element.
 * @param {HTMLElement} domElement - The real DOM element.
 * @param {string} name - The property name.
 * @param {*} oldValue - The old property value (needed to remove event listeners).
 */
const removeProp = (domElement, name, oldValue) => {
    if (name.startsWith('on') && typeof oldValue === 'function') {
        const eventName = name.toLowerCase().substring(2);
        domElement.removeEventListener(eventName, oldValue);
    } else if (name === 'class' || name === 'className') {
        domElement.className = '';
    } else if (name === 'style') {
        // Resetting all inline styles
        domElement.removeAttribute('style');
    } else {
        domElement.removeAttribute(name);
    }
};

/**
 * Updates properties on an existing DOM element by comparing old and new VNode props.
 * @param {HTMLElement} domElement - The target DOM element.
 * @param {Object} oldProps - The previous VNode's props.
 * @param {Object} newProps - The new VNode's props.
 */
const patchProps = (domElement, oldProps = {}, newProps = {}) => {
    // 1. Remove old properties that are missing in newProps
    for (const key in oldProps) {
        if (!(key in newProps)) {
            removeProp(domElement, key, oldProps[key]);
        }
    }

    // 2. Add or update new/changed properties
    for (const key in newProps) {
        const oldValue = oldProps[key];
        const newValue = newProps[key];

        if (oldValue !== newValue) {
            // If it's an event handler and the handler changed, remove the old one first
            if (key.startsWith('on') && typeof oldValue === 'function') {
                removeProp(domElement, key, oldValue);
            }
            setProp(domElement, key, newValue);
        }
    }
};

/**
 * Renders a VNode tree into a real DOM element for initial mounting.
 * Attaches the VNode to the element via the __vnode property.
 * @param {VNode|string|number} vnode - The Virtual Node.
 * @returns {HTMLElement|Text} The corresponding real DOM element or Text node.
 */
const render = (vnode) => {
    // Handle text nodes (strings or numbers)
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(vnode);
    }
    
    // Ensure children is an array for safety
    if (!Array.isArray(vnode.children)) {
        vnode.children = [];
    }

    // Create the element
    const element = document.createElement(vnode.tag);

    // Set properties
    for (const key in vnode.props) {
        setProp(element, key, vnode.props[key]);
    }

    // Render children recursively
    vnode.children.forEach(child => {
        element.appendChild(render(child));
    });

    // Link the VNode to the actual DOM element for easy reference during patching
    element.__vnode = vnode;
    // Also store the DOM reference on the VNode for subsequent patches
    vnode.dom = element; 
    
    return element;
};

/**
 * Recursively patches the children of a DOM element.
 * @param {HTMLElement} parentDom - The real DOM parent element.
 * @param {VNode[]} oldChildren - Previous VNode children.
 * @param {VNode[]} newChildren - New VNode children.
 */
const patchChildren = (parentDom, oldChildren = [], newChildren = []) => {
    const childNodes = Array.from(parentDom.childNodes);
    const minLength = Math.min(oldChildren.length, newChildren.length);
    
    // 1. Patch or replace existing children up to minLength
    for (let i = 0; i < minLength; i++) {
        // The parent for the recursive patch is the parentDom, and the target DOM node is childNodes[i]
        // We pass the actual DOM node as the third argument to patch
        patch(parentDom, oldChildren[i], newChildren[i], childNodes[i]);
    }
    
    // 2. Remove extra old children
    for (let i = minLength; i < oldChildren.length; i++) {
        const domToRemove = parentDom.childNodes[minLength]; // Always remove the one at the start of the excess
        if (domToRemove) parentDom.removeChild(domToRemove);
    }
    
    // 3. Add new children
    for (let i = minLength; i < newChildren.length; i++) {
        const newDom = render(newChildren[i]);
        parentDom.appendChild(newDom);
    }
};

/**
 * Main reconciliation function. Compares old and new VNodes and applies minimal changes to the DOM.
 * @param {HTMLElement} parentDom - The real DOM parent element.
 * @param {VNode|string|number} oldVNode - The previous VNode.
 * @param {VNode|string|number} newVNode - The new VNode.
 * @param {HTMLElement|Text} [existingDom] - The real DOM element corresponding to oldVNode (optional, for child patching).
 */
const patch = (parentDom, oldVNode, newVNode, existingDom) => {
    const dom = existingDom || (oldVNode && oldVNode.dom) || parentDom.firstChild;

    // 1. New VNode is null/undefined (Removal)
    if (newVNode === null || newVNode === undefined) {
        if (dom) parentDom.removeChild(dom);
        return null;
    }

    // 2. Old VNode is null/undefined (Addition)
    if (oldVNode === null || oldVNode === undefined) {
        const newDom = render(newVNode);
        parentDom.appendChild(newDom);
        return newDom;
    }
    
    // 3. VNode types are different (Replacement, e.g., <div> to <p>)
    if (typeof oldVNode !== typeof newVNode || (typeof newVNode === 'object' && oldVNode.tag !== newVNode.tag)) {
        const newDom = render(newVNode);
        parentDom.replaceChild(newDom, dom);
        return newDom;
    }
    
    // 4. VNodes are the same type/tag (Update)

    // A. Handle Text Node update
    if (typeof newVNode === 'string' || typeof newVNode === 'number') {
        if (dom.nodeValue !== newVNode.toString()) {
            dom.nodeValue = newVNode;
        }
        return dom;
    }

    // B. Handle Element Node update
    
    // Link the new VNode to the existing DOM element for the next cycle
    newVNode.dom = dom; 
    
    // I. Update properties/attributes
    patchProps(dom, oldVNode.props, newVNode.props);

    // II. Update children recursively
    patchChildren(dom, oldVNode.children, newVNode.children);
    
    return dom;
};

// --- VENJS CORE OBJECT ---
const venjs = {
    /**
     * Creates a Virtual Node (VNode) object. This no longer creates a real DOM element.
     * @param {string} tag - The HTML tag name (e.g., 'div', 'p').
     * @param {Object} props - Attributes and event handlers (e.g., { class: 'btn', onclick: handler }).
     * @param {Array<VNode|string|number>} children - Child VNodes or text content.
     * @returns {Object} The VNode object.
     */
    createElement: (tag, props = {}, children = []) => {
        // Handle arguments, ensuring children is flattened and VNodes
        const flatChildren = children.flat().filter(c => c !== null && c !== undefined);

        // Always return a plain JavaScript VNode object
        return { tag, props: { ...props }, children: flatChildren };
    },

    /**
     * Creates a state store using the Reducer pattern for predictable state changes.
     * @param {Object} initialState - The initial state object.
     * @param {function(state, action): Object} reducer - A function that calculates the new state.
     * @returns {Object} Store API (getState, dispatch, subscribe).
     */
    createStore: (initialState, reducer) => {
        let state = { ...initialState };
        const listeners = [];

        const dispatch = (action) => {
            const newState = reducer(state, action);
            
            // Only update and notify listeners if the state has actually changed
            if (state !== newState) {
                const oldState = state;
                state = newState;
                listeners.forEach(listener => listener(state, oldState));
            }
        };

        return {
            getState: () => state,
            dispatch: dispatch,
            subscribe: (listener) => {
                listeners.push(listener);
                // Return an unsubscribe function
                return () => listeners.splice(listeners.indexOf(listener), 1);
            }
        };
    },

    /**
     * Utility to load documentation content (returns a VNode structure).
     * Since this is now VDOM, it returns VNodes, not real DOM elements.
     * @param {string} page - The page key.
     * @param {Object} documentation - The map of documentation content.
     * @returns {Object} A VNode representing the page content.
     */
    loadPage: (page, documentation) => {
        const content = documentation[page] || documentation['hello-world'];
        if (!content) {
            console.error('No content found for page:', page);
            return venjs.createElement('div', { class: 'text-red-500 p-4' }, ['Error: Page not found']);
        }
        
        // Note: innerHTML is still supported as a prop in the VNode
        return venjs.createElement('div', { class: 'documentation-container' }, [
            venjs.createElement('h2', { class: 'text-2xl font-bold mb-4' }, [content.title]),
            venjs.createElement('div', { class: 'prose mt-4', innerHTML: content.content })
        ]);
    },

    /**
     * Mounts the application or initiates the VDOM patch process.
     * @param {string} appSelector - CSS selector for the root DOM element (e.g., '#app').
     * @param {function(): Object} componentFactory - Function that returns the root VNode tree.
     */
    ven: (appSelector, componentFactory) => {
        if (typeof window === 'undefined') {
            console.log('Venjs running in Node.js');
            return;
        }
        
        // Find the root element and store it once
        if (!rootElement) {
            rootElement = document.querySelector(appSelector);
            if (!rootElement) {
                console.error('Venjs Error: Root element not found with selector:', appSelector);
                return;
            }
            // Clear any existing content on initial mount
            rootElement.innerHTML = ''; 
        }

        // Generate the new VNode tree
        const nextVNode = componentFactory();

        if (prevVNode === null) {
            // Initial Mount: Render the VNode and append the real DOM
            const dom = render(nextVNode);
            // Since rootElement was cleared, we append the result of render
            rootElement.appendChild(dom);
        } else {
            // Update: Compare the old VNode tree with the new one and apply changes
            // Patch starts from the root element's first child
            patch(rootElement, prevVNode, nextVNode, rootElement.firstChild);
        }

        // Store the new VNode for the next update cycle
        prevVNode = nextVNode;
    }
};

// Expose the core patch function for internal use (or future testing)
venjs.patch = patch; 

// Ensure the main mounting function is accessible via a more common name
venjs.mount = venjs.ven;
