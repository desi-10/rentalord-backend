import pino from "pino";
import pinoHttpModule from "pino-http";
import { env } from "./env.js";

const pinoHttp = (pinoHttpModule as any).default || pinoHttpModule;

const isDevelopment = env.NODE_ENV === "development" || !env.NODE_ENV;

export const logger = pino({
  level: isDevelopment ? "debug" : "info",
  ...(isDevelopment && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
        singleLine: false,
        errorLikeObjectKeys: ["err", "error"],
        errorProps: "message,stack,code,name",
      },
    },
  }),
});

export const httpLogger = pinoHttp({
  logger,
  quietReqLogger: false,
  // autoLogging: env.NODE_ENV !== "production" ,
  autoLogging: false,
});
