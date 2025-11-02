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

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
