import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";
import { formatEarning } from "../utils/helper";

const leaderBoardCommand: SlashCommand = {
  command: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Summary of all users earning")
    .addNumberOption((option) =>
      option
        .setName("limit")
        .setDescription("How many users do you want to see?")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  execute: async (interaction) => {
    const count = await prisma.user.count();

    const limit = (interaction.options.get("limit")?.value as number) ?? count;

    const all_users = await prisma.user.findMany({
      take: limit,
      orderBy: { currentXp: "desc" },
    });

    const data = await Promise.all(
      all_users.map(async (user) => {
        const { zealy_data } = await findById(user.discordId);

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            currentXp: zealy_data.xp,
            level: zealy_data.level,
            rank: zealy_data.rank,
          },
        });

        const { ipx_with_booster } = formatEarning(updated);

        return { username: user.name, ipx_with_booster };
      })
    );

    return interaction.reply({
      content: `${JSON.stringify(data)}`,
      ephemeral: true,
    });
  },
};

export default leaderBoardCommand;
