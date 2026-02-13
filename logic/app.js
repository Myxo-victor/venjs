/*
https://randomuser.me/api/
*@author Myxo victor, aka: victor ochiabuto
* This file is responsible for handling the main logic of the Venjs application.
* You can modify this file to add your own custom logic, such as fetching data from APIs, handling user interactions, or managing application state.
* This file should be included in the index.html file after the main components script (main.js) and the ven.js engine script.
* You can use this file to initialize your application, set up event listeners, or perform any necessary setup for your app.
* Make sure to keep this file organized and modular for better maintainability.
*/

//let's fetch some random user data from the Random User API to demonstrate how to use the VenJS API connection method.
/**
 * Simple VenJS API Call
 * Using JSONPlaceholder - A highly compatible API for Localhost/CORS
 */

// We use JSONPlaceholder as it is more stable for local development testing
const data = venjs.api.connect('https://jsonplaceholder.typicode.com/users/1', {
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Handle the promise and log results to console
data.then(response => {
    // Check if the response actually contains data
    if (!response || !response.username) {
        throw new Error("Data received but format is unexpected.");
    }

    console.log("VenJS: Connection Successful!");
    console.log("User Full Name:", response.name);
    console.log("Username:", response.username);
    console.log("Email:", response.email);
    console.log("Company:", response.company.name);
    
    // Log the whole object to see everything available
    console.log("Full API Response:", response);
})
.catch(error => {
    console.error("VenJS: Connection Failed", error);
    
    // Detailed troubleshooting for localhost
    console.warn("DEBUG TIP: If you still see 'Failed to fetch':");
    console.log("1. Ensure you're not using 'file://' (Open with Live Server).");
    console.log("2. Check if your local firewall/VPN is blocking outgoing requests.");
    console.log("3. Try opening this URL in a new tab: https://jsonplaceholder.typicode.com/users/1");
});