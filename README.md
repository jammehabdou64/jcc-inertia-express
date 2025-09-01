# 📦 JCC Inertia Express Adapter

An **Inertia.js adapter for Express** that brings the same developer experience you know from Laravel into your Express applications. It allows you to use React (or Vue/Svelte) as your frontend framework while keeping your server-side routing and controllers in Express.

---

## 🚀 Features

- Middleware for handling Inertia requests.
- Shared props & versioning system (like Laravel’s Inertia).
- Inertia-aware redirects.
- Works with Vite + React + Tailwind.

---

## 📥 Installation

```bash
npm install jcc-inertia-express
```

or with Yarn:

```bash
yarn add jcc-inertia-express
```

---

## ⚙️ Setup

### 1. Register the template engine

```ts
import express from "express";
import path from "path";
import session from "express-session";
import flash from "express-flash";
import { engine, inertia } from "inertia-express"; // your package

const app = express();

app.engine("jcc.html", engine.render.bind(engine));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jcc.html");
```

### 2. Middlewares

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
    props: (req, res) => ({
      user: req.user || {},
      flash: req.flash?.() || {},
    }),
  })
);
```

---

## 🛠 Usage

### Controllers (Express Routes)

```ts
app.get("/", (req, res) => {
  res.inertia("Home", { users: [{ name: "Abdou Jammeh", age: 30 }] });
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
  // logic
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

## ⚡ Vite Configuration

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

- **component**: `string` – name of the frontend component.
- **props**: `object` – data passed to the component.
- **options**: `object` – extra options.

Example:

```ts
res.inertia("Dashboard", { user: { name: "Abdou" } });
```

### `res.inertiaRedirect(url)`

Redirects with Inertia awareness.

- For normal requests → HTTP 303 redirect.
- For Inertia requests → 409 with `X-Inertia-Location`.

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
└── package.json
```

---

## 🖼 Frontend (React Example)

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

---

## 🔮 Roadmap

- [ ] Vue & Svelte support
- [ ] TypeScript typings for props
- [ ] Better flash message integration

---

## 📝 License

MIT © Abdou Jammeh

---
