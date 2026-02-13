/*
*@author Myxo victor, aka: victor ochiabuto
* This file is responsible for initializing the main components of the Venjs application.
* It should be included in the index.html file after the ven.js engine script.
* You can modify this file to add your own components or initialize any global state for your app.
* Make sure to follow the structure of creating components and rendering them to the DOM.
* For example, you can create a header component, a main content area, and a footer component.
* This file serves as the entry point for your application's UI.
* You can also import other JavaScript modules or libraries here if needed.
* Remember to keep this file organized and modular for better maintainability.
*/

// declaring the app element where the components will be rendered
const app = document.getElementById('app');

const App = () => venjs.div({
    class:'app'
},[
   venjs.img({src:'./images/logo.png', alt:'Venjs Logo', class:'app-logo'}),
   venjs.h1({class:'welcome-header'},'Welcome to Venjs!'),
   venjs.p({},'Venjs is a powerful JavaScript framework for building modern web applications with ease.'),
   venjs.button({
       onclick: () => alert('Button clicked!')
   }, 'Click Me')
]);

// Render the App component to the DOM
/* To render a component, we can use:
* venjs.render(component, targetElement); or
* venjs.ven(component, targetElement); or
* venjs.mount(component, targetElement);
* All three methods do the same thing, so you can choose the one you prefer.
*/
venjs.render(app, App);


//we can use venjs animations on our UI elements here
/* For example, we can animate the welcome header to slide in from the top when the page loads. 
* if it has an id just write the id name without quotes ""
* if it has a class just write the class name without dot . and quotes ""
* you can also use the element tag name like "h1" or "button" without quotes ""
*/

venjs.animate('.welcome-header',{
    slideFrom:'top',
    duration: 1000,
    scale: [0.5, 1],
    opacity: [0, 1]
})

venjs.animate('.app-logo',{
    slideFrom: 'bottom',
    duration: 2000,
    loop: true
})
