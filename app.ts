import express from "express";
import { Request, Response } from "express";
import session from "express-session";
import flash from "express-flash";
// Demo app imports library source directly; consumers use: import { engine, inertia } from "jcc-inertia-express"
import { engine, inertia } from "./src/index";
import path from "path";

import "dotenv/config";
// import { config } from "dotenv";

// config();

const app = express();

app.engine("jcc.html", engine.render.bind(engine) as any);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jcc.html");

app.use(express.static("public"));
app.use(
  session({
    secret: "text",
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000 },
  }),
);

app.use(
  inertia({
    rootView: "index",
    props: (req: Request, res: Response) => ({
      user: (req as any)?.user || {},
      flash: req.flash || "",
    }),
    ssr: true,
  }),
);

app.use(flash());

app.get("/", (req, res) => {
  res.inertia("Home", {
    users: [{ name: "Hello, World! - Abdou Jammeh hi's", age: 30 }],
  });
});

app.get("/welcome", (req, res) => {
  res.inertia("Home", { users: [{ name: "Abdou Jammeh", age: 30 }] });
});

app.get("/about", (req, res) => {
  res.inertia("About");
});

app.listen(4500, () => {
  console.log("Server running on http://localhost:4500");
});
