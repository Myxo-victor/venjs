VenJS Framework v4.0 (Enterprise)VenJS is a high-performance, lightweight JavaScript framework designed for building modern, reactive web applications with minimal overhead. Created by Myxo Victor at Aximon, VenJS v4.0 introduces an Enterprise UI suite and a robust Reactive Signal system.New in v4.0 Enterprise UI Module: Pre-styled, responsive components (appBar, sideBar, button, etc.).Reactive Signals: Fine-grained state management using the signal and effect pattern.Universal Module Support: Use as a global script or via ES6 import statements.Unified VDom Engine: Faster diffing and rendering for complex UIs.Installation1. Modern Import (Recommended)VenJS now supports named exports for its enterprise components:import venjs, { appBar, button, signal } from './venjs.js';
2. Standard CDNInclude VenJS directly in your HTML. All features are available under the global venjs object:<script src="https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@latest/ven.js"></script>
Core Features1. Reactive Signals (Modern State)The new signal system ensures your UI only updates exactly where the data changes.const count = venjs.signal(0);

// Create an effect that runs whenever count changes
venjs.effect(() => {
    console.log("Current count:", count.value);
});

const Counter = () => venjs.button({ 
    onclick: () => count.value++ 
}, `Count is: ${count.value}`);

venjs.render(document.getElementById('app'), Counter);
2. Enterprise UI ComponentsBuild professional dashboards in seconds using prebuilt, styled components.import { appBar, sideBar, card } from './venjs.js';

const App = () => [
    appBar({ title: "Admin Portal" }),
    sideBar({ isOpen: true }, [
        venjs.div({ class: "p-4" }, "Dashboard Menu")
    ]),
    card({ class: "m-10" }, "Welcome to the Enterprise Suite.")
];
3. API ConnectorSimple async/await interface for external data.async function loadData() {
    const data = await venjs.api.connect('https://api.example.com/users');
    console.log(data);
}
4. Animation EngineTrigger animations automatically as users scroll.venjs.animate('.fade-in-section', {
    opacity: [0, 1],
    duration: 800,
    threshold: 0.2
});
API ReferenceMethodTypeDescriptionsignal(val)StateCreates a reactive value.effect(fn)StateRuns a function automatically when signals inside it change.render(container, app)EngineMounts the application to the DOM.appBar(props)UIPrebuilt responsive top navigation bar.sideBar(props)UIPrebuilt animated navigation drawer.api.connect(url)ToolOptimized fetch wrapper for JSON APIs.createStore(state)LegacyOriginal Redux-style state management.LicenseCopyright © 2025 Aximon | MIT LicenseCreated by Myxo Victor

