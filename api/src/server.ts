import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";
import routes from "../src/routes/index.js";
import cookieParser from "cookie-parser";
import { httpLogger } from "./utils/logger.js";
import { createRateLimiter } from "./utils/rate-limit.js";

const app = express();

app.use(createRateLimiter()); // ✅ apply before all routes
app.use(httpLogger);

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api/v1/hello", (req, res) => {
  res.send("Hello welcome to Rentalord API");
});

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
