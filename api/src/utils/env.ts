import "dotenv/config";
import { z } from "zod";

const envs = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN:
    process.env.JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN,
  JWT_VERIFY_EMAIL_TOKEN_EXPIRES_IN:
    process.env.JWT_VERIFY_EMAIL_TOKEN_EXPIRES_IN,
  NODE_ENV: process.env.NODE_ENV,
  ERROR_WEBHOOK_URL: process.env.ERROR_WEBHOOK_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
};

const EnvSchema = z.object({
  PORT: z.string().optional(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().default("secret"),
  JWT_REFRESH_SECRET: z.string().default("refresh-secret"),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN: z.string().default("1h"),
  JWT_VERIFY_EMAIL_TOKEN_EXPIRES_IN: z.string().default("24h"),
  NODE_ENV: z.string().default("development"),
  ERROR_WEBHOOK_URL: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
});

export type EnvType = z.infer<typeof EnvSchema>;

export const env = EnvSchema.parse(envs);
