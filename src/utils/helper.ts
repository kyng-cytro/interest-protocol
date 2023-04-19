import { User } from "@prisma/client";
import enviromentVars from "../config";

const rate = Number(enviromentVars.CONVERSION_RATE);

export const formatEarning = (user: User) => {
  const booster = getBooster(user.currentXp);

  const currentXp = user.currentXp;

  const startingXp = user.prevXp;

  const earnedXp = currentXp - startingXp;

  const ipx_value = earnedXp * rate;

  const ipx_with_booster = ipx_value * booster;

  return {
    booster,
    currentXp,
    startingXp,
    earnedXp,
    ipx_value,
    ipx_with_booster,
  };
};

export const summariseEarning = (user: User) => {
  const booster = getBooster(user.currentXp);

  const currentXp = user.currentXp;

  const startingXp = user.prevXp;

  const earnedXp = currentXp - startingXp;

  const ipx_value = earnedXp * rate;

  const ipx_with_booster = ipx_value * booster;

  return ipx_with_booster;
};

export const getBooster = (xp: number): number => {
  if (xp < 5000) return 0;
  if (xp < 10000) return 1.2;
  if (xp < 20000) return 1.3;
  if (xp <= 25000) return 1.4;
  if (xp > 25000) return 1.5;
};
