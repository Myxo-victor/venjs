# VenJS 5.0

VenJS 5.0 is a lightweight JavaScript framework for building reactive web interfaces with a simple component API, signals, effects, animation helpers, API utilities, and notification tooling.

## Quick Start

1. Clone or download this project.
2. Serve the `venjs` folder with a local server.
3. Open `index.html` and start editing:
- UI: `components/main.js`
- Logic: `logic/app.js`
- Styles: `index.css`

## Core Features in 5.0

- Component rendering with `venjs.render(...)`
- Declarative element creation with `venjs.div(...)`, `venjs.h1(...)`, etc.
- Reactive state using `venjs.signal(...)` and `venjs.effect(...)`
- Async utilities with `venjs.api.connect(...)` and `venjs.api.query(...)`
- Scroll and entry animations with `venjs.animate(...)`
- Browser notification helpers and service-worker integration
- Legacy compatibility aliases: `venjs.ven(...)` and `venjs.mount(...)`

## Example

```js
const app = document.getElementById("app");
const count = venjs.signal(0);

const Counter = () => venjs.div({ class: "counter" }, [
  venjs.h1({}, `Count: ${count.value}`),
  venjs.button({ onclick: () => count.value++ }, "Increment")
]);

venjs.effect(() => venjs.render(app, Counter));
```

## Project Structure

- `ven.js`: VenJS 5.0 engine
- `ven.php`: secure backend bridge for database CRUD operations
- `index.html`: root starter page
- `components/main.js`: root app UI component
- `logic/app.js`: root app business logic
- `app/`: secondary app starter scaffold
- `sw.js`: service worker helper for notifications
- `ven_notify.php`: notification subscription handler

## Backend Database Engine (`ven.php`)

VenJS now includes a backend-capable pattern with:
- Client API: `venjs.db.connect(...)`
- Server endpoint: `ven.php` (PHP + PDO + prepared statements)

### Configure Credentials

Open `ven.php` and edit the `CONFIG` block:
- `db_host`
- `db_port`
- `db_name`
- `db_user`
- `db_pass`
- `api_key`
- `allowed_origins`
- `allowed_tables`

### Example Usage

```js
const server = venjs.db.connect({
  endpoint: '/ven.php',
  apiKey: 'CHANGE_THIS_TO_MATCH_VEN_PHP',
  table: 'users'
});

// Create
await server.create({
  email: 'demo@site.com',
  password_hash: '$2y$10$...'
});

// Read
const users = await server.read({
  select: ['id', 'email'],
  where: { email: 'demo@site.com' },
  limit: 1
});

// Update
await server.update(
  { email: 'demo@site.com' },
  { email: 'new@site.com' }
);

// Delete
await server.delete({ email: 'new@site.com' });

// Login (password_verify on server)
const auth = await server.login(
  { email: 'demo@site.com', password: 'plainTextInput' },
  { userField: 'email', passField: 'password_hash', select: ['id', 'email'] }
);
```

### Security Notes

- No raw SQL is accepted from the client.
- Queries are parameterized with prepared statements.
- Table access is restricted by `allowed_tables`.
- Column/table identifiers are validated before SQL is built.
- API key check uses `hash_equals`.
- CORS origin is allowlisted.
- Login uses `password_verify` (store hashed passwords only).

## License

MIT License  
Copyright (c) 2026 Aximon  
Created by Myxo Victor
