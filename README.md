VenJS Framework 
VenJS is a lightweight, cross-platform JavaScript framework and engine for building dynamic applications with minimal overhead. Created by Myxo Victor at www.aximon.ng Aximon, VenJS combines high-performance UI rendering with a built-in API connector and animation engine.FeaturesUnified API Connector: Simplified async/await interface for fetching data.Cross-Platform Engine: Detects environment to handle Web DOM or Mobile Virtual Nodes.Rendering Aliases: Use venjs.render, venjs.ven, or venjs.mount to attach your UI.
Animation Engine: Built-in Intersection Observer logic for scroll-triggered animations.
State Management: Reactive store for efficient data updates.
Installation Include via CDNUse jsDelivr to include VenJS directly in your HTML:<script src="[https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@latest/ven.js](https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@latest/ven.js)"></script>
Local InstallationCopy ven.js to your project directory.Include it in your HTML:<script src="ven.js"></script>
Usage ExamplesRendering (Mounting) UIYou can now use render, ven, or mount interchangeably.
const App = () => venjs.createElement('h1', { 
    textContent: 'Welcome to VenJS',
    className: 'title' 
});

// All these do the same thing:
venjs.mount(document.getElementById('app'), App);
// venjs.ven(document.getElementById('app'), App);
// venjs.render(document.getElementById('app'), App);
Reactive Stateconst store = venjs.createStore({ count: 0 });

const Counter = () => venjs.createElement('button', {
    textContent: `Count is: ${store.getState().count}`,
    events: { 
        click: () => store.setState({ count: store.getState().count + 1 }) 
    }
});

store.subscribe(() => venjs.ven(document.getElementById('app'), Counter));
venjs.ven(document.getElementById('app'), Counter);
API Connectionasync function fetchData() {
    const data = await venjs.api.connect('[https://api.example.com/data](https://api.example.com/data)');
    console.log(data);
}
API ReferenceMethodDescriptioncreateElement(tag, props, children)Creates a DOM element (Web) or Virtual Node (Mobile).render/ven/mount(app, component)Mounts a component to a target container.createStore(initialState)Initializes a reactive state management object.api.connect(url, options)Performs an optimized fetch request.animate(selector, options)Triggers CSS animations when elements enter the viewport.
License MIT License
Copyright © 2025 Aximon | MIT License
