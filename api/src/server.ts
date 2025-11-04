import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import routes from "../src/routes/index.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/hello", (req, res) => {
  res.send("Hello welcome to Rentalord API");
});

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
