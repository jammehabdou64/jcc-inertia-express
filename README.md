# JCC Inertia Express

An **Inertia.js adapter for Express** that brings the same developer experience you know from Laravel into your Express applications. Use **React, Vue, or Svelte** on the frontend while keeping server-side routing in Express.

> This package is a **middleware adapter**, not Inertia itself.  
> For Inertia client setup, see [inertiajs.com](https://inertiajs.com).

## Features

- Inertia request/response middleware for Express
- Shared props and asset versioning
- Partial reload support (`X-Inertia-Partial-Data` + `X-Inertia-Partial-Component`)
- Inertia-aware redirects
- Optional SSR with automatic client-side fallback
- JCC template engine with `@inertia`, `@vite`, and `@viteReactRefresh` directives
- Vite dev server and production manifest support

## Installation

```bash
npm install jcc-inertia-express express dotenv
```

## Setup

### 1. Environment variables

```env
APP_ENV=local
APP_URL=localhost
APP_VERSION=1.0.0
SSR_HOST=localhost
SSR_PORT=13714
```

Load them in your server entry:

```ts
import "dotenv/config";
```

### 2. Register the template engine

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

### 3. Inertia middleware

```ts
app.use(
  inertia({
    rootView: "index",
    version: () => process.env.APP_VERSION || "1",
    props: (req, res) => ({
      user: req.user || null,
      flash: req.flash?.() || {},
    }),
    ssr: true, // optional — falls back to client-side if SSR is unavailable
  }),
);
```

## Usage

### Render a page

```ts
app.get("/", (req, res) => {
  res.inertia("Home", { users: [{ name: "Abdou Jammeh" }] });
});
```

### Redirects

```ts
app.post("/login", (req, res) => {
  res.inertiaRedirect("/dashboard");
});
```

- Normal requests → HTTP 303 redirect
- Inertia requests → 303 with `X-Inertia-Location`

## Root view (`views/index.jcc.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    @viteReactRefresh @vite(["/views/css/app.css", "/views/js/main.jsx"])
  </head>
  <body>
    @inertia
  </body>
</html>
```

## SSR (optional)

1. Add an SSR entry (e.g. `views/js/ssr.jsx`) using `@inertiajs/react/server`
2. Build it with Vite: `vite build --ssr`
3. Run the SSR sidecar: `node bootstrap/ssr/ssr.js`
4. Enable SSR in middleware: `ssr: true`

If the sidecar is down or returns an empty response, the adapter **falls back to client-side rendering** automatically.

## Vite config example

```ts
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    laravel({
      input: ["views/css/app.css", "views/js/main.jsx"],
      refresh: true,
      ssr: "views/js/ssr.jsx",
    }),
    react(),
  ],
});
```

## API

### `inertia(options)`

| Option | Type | Description |
|--------|------|-------------|
| `rootView` | `string` | Base HTML template name |
| `props` | `object \| (req, res) => object` | Shared props on every response |
| `version` | `string \| () => string` | Asset version for cache busting |
| `ssr` | `boolean` | Enable SSR via sidecar (default: `false`) |

### `res.inertia(component, props?)`

Renders an Inertia page. Returns a `Promise<void>`.

### `res.inertiaRedirect(url)`

Performs an Inertia-aware redirect.

## Local development (this repo)

This repository contains the library source in `src/` and a demo app at the root.

```bash
npm install
npm run build      # compile library to dist/
npm run demo       # run example Express server
npm run watch      # run Vite dev server
npm run vite-build # build frontend + SSR bundle
npm run ssr        # start SSR sidecar
```

The demo imports from `./src/` directly. Published consumers import from `jcc-inertia-express`.

## Publish

```bash
npm run build
npm publish
```

## License

MIT © Abdou Jammeh
