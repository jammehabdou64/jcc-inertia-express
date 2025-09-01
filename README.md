# 📦 JCC Inertia Express Adapter

An **Inertia.js adapter for Express** that brings the same developer experience you know from Laravel into your Express applications.
It allows you to use **React, Vue, or Svelte** as your frontend framework while keeping server-side routing and controllers in Express.

> This package is a **middleware adapter**, not Inertia itself.
> To learn everything about Inertia (React, Vue, or Svelte), visit the official site: [https://inertiajs.com](https://inertiajs.com)

---

## 🚀 Features

- Middleware for handling Inertia requests in Express.
- Shared props & versioning system
- Inertia-aware redirects.
- Works seamlessly with **Vite + React + Tailwind** (or Vue/Svelte).

---

## 📥 Installation

```bash
npm install jcc-inertia-express dotenv
```

or with Yarn:

```bash
yarn add jcc-inertia-express dotenv
```

> **Note:** `dotenv` is required if you want to use environment variables like `APP_ENV` or `APP_VERSION`.

---

## ⚙️ Setup

### 1. Configure dotenv

Create a `.env` file in your project root:

```env
APP_ENV=local
APP_VERSION=1.0.0
```

And load it in your server entry file:

```ts
import "dotenv/config";
```

---

### 2. Register the template engine

```ts
import express from "express";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import { engine, inertia } from "jcc-inertia-express";

const app = express();

app.engine("jcc.html", engine.render.bind(engine));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jcc.html");
```

---

### 3. Middlewares

```ts
app.use(express.static("public"));

app.use(
  session({
    secret: "super-secret",
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000 },
  })
);

app.use(flash());

app.use(
  inertia({
    rootView: "index", // base HTML file
    version: () => process.env.APP_VERSION || "1",
    props: (req, res) => ({
      env: process.env.APP_ENV || "production",
      user: req.user || {},
      flash: req.flash?.() || {},
    }),
  })
);
```

---

## 🛠 Usage

### Express Routes / Controllers

```ts
app.get("/", (req, res) => {
  res.inertia("Home", { users: [{ name: "Abdou Jammeh" }] });
});

app.get("/about", (req, res) => {
  res.inertia("About");
});

app.get("/welcome", (req, res) => {
  res.inertia("Home", { message: "Welcome to Inertia + Express!" });
});
```

### Redirects

```ts
app.post("/login", (req, res) => {
  // your login logic
  res.inertiaRedirect("/dashboard");
});
```

---

## 📄 Root View Example (`views/index.jcc.html`)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    @viteReactRefresh @vite(["/views/css/app.css", "/views/js/main.jsx"])
  </head>
  <body class="bg-slate-200 w-full h-screen">
    @inertia
  </body>
</html>
```

---

## ⚡ Vite Configuration Example

```ts
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    laravel({
      input: ["views/css/app.css", "views/js/main.jsx"],
      refresh: true,
    }),
    tailwindcss(),
    react(),
  ],
});
```

---

## 🔑 API Reference

### `res.inertia(component, props?, options?)`

- **component**: `string` – the frontend component name.
- **props**: `object` – data passed to the component.
- **options**: `object` – additional options.

Example:

```ts
res.inertia("Dashboard", { user: { name: "Abdou" } });
```

---

### `res.inertiaRedirect(url)`

Redirects with Inertia awareness:

- Normal requests → HTTP 303 redirect.
- Inertia requests → 409 status with `X-Inertia-Location`.

---

## 🧩 Advanced

### Shared Props

Define global props available to every Inertia response:

```ts
inertia({
  rootView: "index",
  props: (req, res) => ({
    csrfToken: req.csrfToken?.(),
    user: req.user || null,
  }),
});
```

### Versioning

Supports asset versioning to force client-side reloads:

```ts
inertia({
  version: () => process.env.APP_VERSION || "1",
});
```

---

## ✅ Example Project Structure

```
project/
├── views/
│   ├── index.jcc.html
│   ├── css/app.css
│   └── js/main.jsx
├── public/
├── src/
│   └── server.ts
├── vite.config.ts
├── .env
└── package.json
```

---

## 🖼 Frontend Example (React)

```jsx
// views/js/main.jsx
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
  progress: {
    color: "#172554",
    delay: 1,
  },
});
```

> For Vue or Svelte setups, check [Inertia.js documentation](https://inertiajs.com).

---

## 🔮 Roadmap

- [ ] Vue & Svelte adapter support
- [ ] Strong TypeScript typings for props
- [ ] Improved flash message integration

---

## 📝 License

MIT © Abdou Jammeh
