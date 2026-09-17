import { z } from "zod";

const envSchema = z.object({
  API_URL: z.string().url(),
  APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
});

export const env = envSchema.parse({
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api",
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || "development",
});
