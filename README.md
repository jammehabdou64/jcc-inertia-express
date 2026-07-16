# jcc-inertia-express

An **Inertia.js adapter for Express**. Use React, Vue, or Svelte on the frontend while keeping routing and controllers in Express — similar to Laravel + Inertia.

> This package is the **server adapter** only. For the Inertia client API, see [inertiajs.com](https://inertiajs.com).

## Features

- `res.inertia()` / `res.inertiaRedirect()` on Express responses
- Shared props and asset versioning
- Partial reloads
- Optional SSR with automatic client-side fallback
- Blade-style root view directives: `@inertia`, `@vite`, `@viteReactRefresh`
- Works with **Node**, **nodemon**, and **Bun** (CommonJS + ESM)

---

## Quick start (recommended)

Scaffold a ready-made Express + Inertia + Vite app:

```bash
# Bun
bunx jcc-inertia-starter my-app

# npm
npx jcc-inertia-starter my-app
```

```bash
cd my-app
npm install
npm run watch   # Vite (frontend HMR)
npm run dev     # Express server — see the generated project README
```

---

## Install into an existing Express app

```bash
npm install jcc-inertia-express express dotenv
```

Also install your frontend stack, for example React:

```bash
npm install @inertiajs/react react react-dom
npm install -D vite @vitejs/plugin-react laravel-vite-plugin
```

Works with both module styles:

```js
// CommonJS
const { inertia, engine } = require("jcc-inertia-express");

// ESM / TypeScript
import { inertia, engine } from "jcc-inertia-express";
```

---

## Project layout

A typical app looks like this:

```
my-app/
├── public/                 # static files + Vite build output
│   ├── hot                 # written by Vite in development
│   └── build/              # production assets (manifest.json)
├── views/
│   ├── index.jcc.html      # root Inertia shell
│   ├── css/app.css
│   └── js/
│       ├── main.jsx        # Inertia client entry
│       ├── ssr.jsx         # optional SSR entry
│       ├── Pages/          # page components (Home, About, …)
│       └── Components/
├── server.js / app.ts      # Express entry
├── vite.config.ts
└── .env
```

---

## Setup

### 1. Environment variables

Create a `.env` file:

```env
APP_ENV=local
APP_URL=localhost
APP_VERSION=1.0.0

# Only needed if you enable SSR
SSR_HOST=localhost
SSR_PORT=13714
```

Load it in your server entry:

```ts
import "dotenv/config";
```

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | Use `local` in development, `production` in production |
| `APP_VERSION` | Asset version — bump to force full page reloads |
| `SSR_HOST` / `SSR_PORT` | Inertia SSR sidecar address |

### 2. Register the JCC template engine

```ts
import express from "express";
import path from "path";
import { engine, inertia } from "jcc-inertia-express";

const app = express();

app.engine("jcc.html", engine.render.bind(engine));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jcc.html");
app.use(express.static("public"));
```

### 3. Register Inertia middleware

```ts
app.use(
  inertia({
    rootView: "index", // views/index.jcc.html
    version: () => process.env.APP_VERSION || "1",
    props: (req, res) => ({
      // shared on every page
      user: req.user || null,
    }),
    ssr: false, // set true when the SSR sidecar is running
  }),
);
```

### 4. Root view (`views/index.jcc.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    @viteReactRefresh
    @vite(["/views/css/app.css", "/views/js/main.jsx"])
  </head>
  <body>
    @inertia
  </body>
</html>
```

| Directive | What it does |
|-----------|----------------|
| `@inertia` | Renders the Inertia root (`#app`) and page JSON |
| `@vite([...])` | Injects Vite client scripts (dev) or built assets (prod) |
| `@viteReactRefresh` | React Fast Refresh preamble in development |

### 5. Vite config

```ts
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    laravel({
      input: ["views/css/app.css", "views/js/main.jsx"],
      refresh: true,
      // optional:
      // ssr: "views/js/ssr.jsx",
    }),
    react(),
  ],
});
```

### 6. Frontend entry (`views/js/main.jsx`)

```jsx
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("./Pages/**/*.jsx", { eager: true });
    return pages[`./Pages/${name}.jsx`];
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
```

Create pages under `views/js/Pages/`, e.g. `Home.jsx`, `About.jsx`. The name you pass to `res.inertia("Home")` must match the file name.

---

## Usage

### Render a page

```ts
app.get("/", (req, res) => {
  res.inertia("Home", {
    users: [{ name: "Abdou Jammeh" }],
  });
});

app.get("/about", (req, res) => {
  res.inertia("About");
});
```

Props are merged with shared `props` from the middleware.

### Redirects

```ts
app.post("/login", (req, res) => {
  // …authenticate…
  res.inertiaRedirect("/dashboard");
});
```

- Normal browser requests → HTTP **303** redirect  
- Inertia XHR requests → **303** + `X-Inertia-Location`

---

## Development vs production

**Development**

```bash
npm run watch   # Vite — writes public/hot
npm run dev     # your Express server
```

**Production**

```bash
npx vite build
# set APP_ENV=production
# start your Express server
```

In production the engine reads `public/build/manifest.json` (from `laravel-vite-plugin`) instead of the Vite dev server.

---

## SSR (optional)

1. Add `views/js/ssr.jsx` using `@inertiajs/react/server`
2. Build SSR: `npx vite build --ssr`
3. Start the sidecar (usually `node bootstrap/ssr/ssr.js`)
4. Set `ssr: true` in the middleware and configure `SSR_HOST` / `SSR_PORT`

If the sidecar is down or returns an empty body, the adapter **falls back to client-side rendering**.

---

## API reference

### `inertia(options)`

| Option | Type | Description |
|--------|------|-------------|
| `rootView` | `string` | Root template name (without `.jcc.html`) |
| `props` | `object` or `(req, res) => object` | Shared props on every response |
| `version` | `string` or `() => string` | Asset version for cache busting |
| `ssr` | `boolean` | Enable SSR sidecar (default `false`) |

### `res.inertia(component, props?)`

Renders an Inertia page. Returns `Promise<void>`.

### `res.inertiaRedirect(url)`

Inertia-aware redirect (see above).

---

## Requirements

- Node.js 18+ (or Bun)
- Express 4.18+ / 5.x
- Vite + `laravel-vite-plugin` for asset loading

---

## License

MIT © Abdou Jammeh
