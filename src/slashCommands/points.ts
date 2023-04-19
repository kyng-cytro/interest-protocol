import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";
import { formatEarning } from "../utils/helper";

const pointsCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("points")
    .setDescription("Check your earned points"),

  execute: async (interaction) => {
    const discordId = interaction.user.id;

    const username = interaction.user.username;

    const user = await prisma.user.findUnique({
      where: { discordId },
    });

    if (!user) {
      return interaction.reply({
        content: `Hi ${username}, You don't seem to be registered. Have you ran the get-started command?`,
        ephemeral: true,
      });
    }

    const { error, message, zealy_data } = await findById(discordId);

    if (error) {
      return interaction.reply({
        content: `An error occuring getting you started. please make sure you have joined the zealy community by completing at least one task`,
        ephemeral: true,
      });
    }

    if (zealy_data == null) {
      return interaction.reply({
        content: `An error occuring getting you started. please make sure you have joined the zealy community by completing at least one task`,
        ephemeral: true,
      });
    }

    const updated_user = await prisma.user.update({
      where: {
        discordId,
      },
      data: {
        currentXp: zealy_data.xp,
        level: zealy_data.level,
        rank: zealy_data.rank,
      },
    });

    const {
      booster,
      currentXp,
      startingXp,
      earnedXp,
      ipx_value,
      ipx_with_booster,
    } = formatEarning(updated_user);

    return interaction.reply({
      content: `Hi, You have earned a total of: ${ipx_with_booster}IPX. Your current booster: ${booster}x, Earned IPX without booster: ${ipx_value}IPX, total XP earned during the event: ${earnedXp}XP, Total XP earned: ${currentXp}XP, Total XP before event: ${startingXp}XP`,
      ephemeral: true,
    });
  },
};

export default pointsCommand;
