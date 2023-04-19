import { z } from "zod";
import fetch from "node-fetch";
import enviromentVars from "../../src/config";

const api_key = enviromentVars.ZEALY_API_KEY;

const subdomain = enviromentVars.ZEALY_SUBDOMAIN;

const dataSchema = z.object({
  id: z.string(),
  name: z.string(),
  discordHandle: z.string(),
  xp: z.number(),
  level: z.number(),
  rank: z.number(),
});

export const findById = async (
  id: string
): Promise<{
  error: boolean;
  message: string;
  zealy_data: z.infer<typeof dataSchema> | null;
}> => {
  const headers = {
    "x-api-key": api_key,
  };
  const res = await fetch(
    `https://api.zealy.io/communities/${subdomain}/users?discordId=${id}`,
    { headers: headers }
  );

  if (res.status == 200) {
    const body = await res.json();

    try {
      const data = dataSchema.parse(body);
      return { error: false, message: "", zealy_data: data };
    } catch {
      return { error: true, message: "An Error Occured", zealy_data: null };
    }
  }

  if (res.status == 404) {
    const data = await res.json();
    return { error: true, message: data, zealy_data: null };
  }

  return { error: true, message: await res.text(), zealy_data: null };
};
