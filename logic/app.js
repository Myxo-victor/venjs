/*
* VenJS 5.0 starter logic
* Use this file for API calls, state workflows, and app-level side effects.
*/

const data = venjs.api.connect('https://jsonplaceholder.typicode.com/users/1', {
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    }
});

data.then(response => {
    if (!response || !response.username) {
        throw new Error('Data received but format is unexpected.');
    }

    console.log('VenJS 5.0: Connection Successful');
    console.log('User Full Name:', response.name);
    console.log('Username:', response.username);
    console.log('Email:', response.email);
    console.log('Company:', response.company.name);
}).catch(error => {
    console.error('VenJS 5.0: Connection Failed', error);
    console.warn('Debug tip: ensure your local server is running and outbound requests are allowed.');
});
