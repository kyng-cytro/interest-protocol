import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../types";
import prisma from "../utils/prisma";
import { findById } from "../utils/zealy";
import { formatEarning } from "../utils/helper";

const leaderBoardCommand: SlashCommand = {
  cooldown: 30,
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
    await interaction.deferReply({ ephemeral: true });

    const count = await prisma.user.count();

    const limit = (interaction.options.get("limit")?.value as number) ?? count;

    const all_users = await prisma.user.findMany({
      take: limit,
      orderBy: { currentXp: "desc" },
    });

    const data = await Promise.all(
      all_users.map(async (user, i) => {
        const { zealy_data } = await findById(user.discordId);

        const updated = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: zealy_data.name,
            currentXp: zealy_data.xp,
            level: zealy_data.level,
            rank: zealy_data.rank,
          },
        });

        const { ipx_with_booster } = formatEarning(updated);

        return `${i + 1}. ${user.name}: ${ipx_with_booster} IPX`;
      })
    );

    const embed = new EmbedBuilder()
      .setColor(0x99bbff)
      .setAuthor({ name: "🏆 Leaderboard" })
      .setDescription(`${data.join("\n")}`);

    return interaction.editReply({
      embeds: [embed],
    });
  },
};

export default leaderBoardCommand;
