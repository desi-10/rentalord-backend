import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import routes from "../src/routes/index.js";
import morgan from "morgan";

const app = express();

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1/hello", (req, res) => {
  res.send("Rentalord API is running");
});

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
