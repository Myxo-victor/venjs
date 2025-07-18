Venjs Framework
Venjs is a lightweight, vanilla JavaScript framework for building dynamic web applications with minimal overhead. Created single-handedly by Myxo Victor at Aximon, Venjs combines the simplicity of early web development with the power of modern frameworks like React, offering a fast and flexible solution for developers.
Features

Simple API: Create DOM elements easily with venjs.createElement.
Reactive State Management: Manage state with venjs.createStore for efficient updates.
Async Page Loading: Load content dynamically using venjs.loadPage.
Lightweight: Pure JavaScript, no dependencies, ensuring blazing-fast performance.
Flexible Rendering: Render components to the DOM with venjs.ven.

Installation

Clone the Repository:
git clone https://github.com/Myxo-victor/venjs.git
cd venjs


Include Venjs via CDN:Use the jsDelivr CDN to include Venjs in your project:
<script src="https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@latest/venjs.js"></script>

For a specific version (e.g., v1.0.0):
<script src="https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@v1.0.0/venjs.js"></script>


Local Installation:

Copy venjs.js to your project directory.
Include it in your HTML:<script src="venjs.js"></script>





Usage Examples
Create an Element
const element = venjs.createElement('div', { className: 'text-red-500', textContent: 'Hello, Venjs!' });
document.body.appendChild(element);

State Management
const store = venjs.createStore({ count: 0 });
const App = () => venjs.createElement('button', {
    textContent: `Count: ${store.getState().count}`,
    events: { click: () => store.setState({ count: store.getState().count + 1 }) }
});
venjs.ven(document.getElementById('app'), App);

Async Page Loading
const documentation = { 'page': { title: 'Page', content: '<p>Content</p>' } };
venjs.loadPage('page', documentation).then(element => {
    document.getElementById('content').appendChild(element);
});

Render a Component
const App = () => venjs.createElement('h1', { textContent: 'Welcome to Venjs' });
venjs.ven(document.getElementById('app'), App);

API Reference

createElement(tag, props, children): Creates a DOM element or virtual node.
tag: HTML tag (e.g., 'div', 'h1').
props: Object with attributes (e.g., className, textContent, events).
children: Array of child elements or strings.


createStore(initialState): Creates a reactive state store.
getState(): Returns current state.
setState(newState): Updates state and notifies listeners.
subscribe(listener): Subscribes to state changes.


loadPage(page, documentation): Asynchronously loads content for a given page.
ven(app, component): Renders a component to a DOM element.

Uploading to GitHub
To update the venjs repository:

Add venjs.js and README.md:

Save venjs.js (provided previously, artifact ID: dba8b9b2-023b-4a6f-b8af-2d1136133f06) and this README.md in your project directory.
If not already initialized:git init
git add venjs.js README.md
git commit -m "Add venjs.js and README.md"
git remote add origin https://github.com/Myxo-victor/venjs.git
git push -u origin main


If the repository exists:git add venjs.js README.md
git commit -m "Update venjs.js and README.md"
git push origin main




Verify CDN:

Test the CDN URL: https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@latest/venjs.js.
For specific versions, create a release on GitHub (e.g., v1.0.0) and use:<script src="https://cdn.jsdelivr.net/gh/Myxo-victor/venjs@v1.0.0/venjs.js"></script>





Debugging

Console Logs: Check browser DevTools (F12) for errors in venjs.js.
Network Tab: Ensure venjs.js loads (200 OK) via CDN or locally.
CDN Issues: If the CDN fails, use local venjs.js or verify the GitHub repository.

Contributing
Venjs was created by Myxo Victor at Aximon. Contributions are welcome! To contribute:

Fork the repository: https://github.com/Myxo-victor/venjs.
Create a feature branch: git checkout -b feature/YourFeature.
Commit changes: git commit -m 'Add YourFeature'.
Push to the branch: git push origin feature/YourFeature.
Open a Pull Request.

License
© 2025 Aximon. All rights reserved.
Contact

Author: Myxo Victor
Company: Aximon   [www.aximon.ng]
Repository: github.com/Myxo-victor/venjs
