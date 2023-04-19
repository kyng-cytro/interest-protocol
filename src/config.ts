import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const enviromentVarsSchema = z.object({
  DISCORD_TOKEN: z.string(),
  CLIENT_ID: z.string(),
  ZEALY_API_KEY: z.string(),
  ZEALY_SUBDOMAIN: z.string(),
  CONVERSION_RATE: z.string(),
});

const enviromentVars = enviromentVarsSchema.parse(process.env);

export default enviromentVars;
